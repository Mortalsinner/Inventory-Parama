import { useState, useEffect } from 'react';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const PengajuanBeli = () => {
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({
        nama_barang: '',
        qty: '',
        harga: '',
        Link_Pembelian: '',
        pic_display: '' // For form display
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setFormData(prev => ({ ...prev, pic_display: user.Username }));
        }
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('pengajuan_pembelian')
                .select('*, User(Username)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEdit = (item) => {
        setFormData({
            nama_barang: item.nama_barang,
            qty: item.qty,
            harga: item.harga,
            Link_Pembelian: item.Link_Pembelian,
            pic_display: item.User?.Username || '-'
        });
        setEditingId(item.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        const userData = localStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        setFormData({
            nama_barang: '',
            qty: '',
            harga: '',
            Link_Pembelian: '',
            pic_display: user?.Username || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let error;
            const userData = JSON.parse(localStorage.getItem('user'));

            // Clean payload - exclude pic_display
            const { pic_display, ...baseData } = formData;

            if (editingId) {
                // Update - keep original iduser (don't send it)
                const { error: updateError } = await supabase
                    .from('pengajuan_pembelian')
                    .update({
                        ...baseData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', editingId);
                error = updateError;
            } else {
                // Insert - add current user as iduser
                const payload = {
                    ...baseData,
                    iduser: userData?.iduser,
                    status: 'Pending',
                    created_at: new Date().toISOString()
                };
                const { error: insertError } = await supabase
                    .from('pengajuan_pembelian')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: editingId ? 'Pengajuan berhasil diperbarui!' : 'Pengajuan pembelian berhasil dikirim!',
                timer: 1500,
                showConfirmButton: false
            });

            handleCancelEdit(); // Reset form and state
            fetchRequests();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Pengajuan?',
            text: "Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('pengajuan_pembelian')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                Swal.fire('Terhapus!', 'Pengajuan telah dihapus.', 'success');
                fetchRequests();
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto py-10">
                <div className="flex items-center gap-5 mb-12">
                    <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pengajuan Pembelian</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Kirim dan kelola pengajuan pengadaan kebutuhan</p>
                    </div>
                </div>

                <div className="flex flex-col gap-10">

                    {/* Form Section */}
                    <div className="w-full">
                        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                        {editingId ? 'UBAH PENGAJUAN' : 'PENGADAAN BARU'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                                        {editingId ? 'Ubah entri yang ada' : 'Buat pesanan pembelian baru'}
                                    </p>
                                </div>
                                {editingId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-[10px] font-black tracking-widest text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-100 px-4 py-2 rounded-xl transition-all active:scale-95"
                                    >
                                        BATALKAN
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Nama Barang</label>
                                    <input
                                        type="text"
                                        name="nama_barang"
                                        value={formData.nama_barang}
                                        onChange={handleChange}
                                        className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                        placeholder="misal: Memory Card 128GB"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Jumlah</label>
                                        <input
                                            type="number"
                                            name="qty"
                                            value={formData.qty}
                                            onChange={handleChange}
                                            className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-sm"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Est. Harga</label>
                                        <input
                                            type="number"
                                            name="harga"
                                            value={formData.harga}
                                            onChange={handleChange}
                                            className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 shadow-sm"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">URL Referensi</label>
                                    <input
                                        type="url"
                                        name="Link_Pembelian"
                                        value={formData.Link_Pembelian}
                                        onChange={handleChange}
                                        className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-indigo-600 placeholder:text-slate-300 shadow-sm"
                                        placeholder="https://tokopedia.com/barang"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Pemohon yang Ditugaskan</label>
                                    <div className="flex items-center px-6 py-5 bg-slate-100/30 border border-slate-100 rounded-2xl text-slate-500 cursor-not-allowed">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mr-4 text-indigo-500 font-black text-xs ring-1 ring-slate-100">
                                            {formData.pic_display?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm tracking-wide text-slate-600">{formData.pic_display}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-5 px-6 rounded-[1.5rem] text-white font-black text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 ${editingId
                                        ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700'
                                        : 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700'
                                        }`}
                                >
                                    {editingId ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            PERBARUI PENGAJUAN
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            KIRIM PENGADAAN
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="w-full">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg tracking-tight">Riwayat Pengajuan</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Pantau semua pengadaan yang dikirim</p>
                                </div>
                                <span className="text-[10px] font-black px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full ring-1 ring-indigo-100">
                                    {requests.length} DATA
                                </span>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/30 text-slate-400">
                                        <tr className="border-b border-slate-100">
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em]">Detail Barang</th>
                                            <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-center">Jumlah</th>
                                            <th className="px-6 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {requests.length > 0 ? (
                                            requests.map((item) => (
                                                <tr key={item.id} className="hover:bg-indigo-50/20 transition-all duration-500 group">
                                                    <td className="px-10 py-8">
                                                        <div className="font-black text-slate-800 text-lg tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{item.nama_barang}</div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg ring-1 ring-indigo-100">Rp {parseInt(item.harga).toLocaleString()}</span>
                                                            {item.Link_Pembelian && (
                                                                <a
                                                                    href={item.Link_Pembelian}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[10px] font-black text-slate-400 hover:text-indigo-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
                                                                >
                                                                    URL <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-8 text-center">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-sm font-black text-slate-800 border border-slate-100 shadow-sm">{item.qty}</span>
                                                    </td>
                                                    <td className="px-6 py-8 text-center">
                                                        <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                            item.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                            }`}>
                                                            {item.status === 'Approved' ? 'Disetujui' : item.status === 'Rejected' ? 'Ditolak' : 'Menunggu'}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <div className="flex justify-end gap-3 transition-all duration-500">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-3.5 bg-white text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90"
                                                                title="Ubah Pengajuan"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-3.5 bg-white text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-90"
                                                                title="Hapus Data"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="p-24 text-center">
                                                    <div className="flex flex-col items-center gap-6 text-slate-300">
                                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2 ring-1 ring-slate-100 shadow-inner">
                                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada pengajuan pembelian</p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-1">Kirim pengadaan baru untuk memulai</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PengajuanBeli;
