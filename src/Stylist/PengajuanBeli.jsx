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
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Purchase Requests</h2>
                        <p className="text-sm text-slate-500 font-medium">Submit and manage supply procurement requests</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Form Section */}
                    <div className="lg:col-span-5">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white/40 sticky top-8">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    {editingId ? 'EDIT REQUEST' : 'NEW REQUEST'}
                                </h3>
                                {editingId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        CANCEL EDIT
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Asset Name</label>
                                    <input
                                        type="text"
                                        name="nama_barang"
                                        value={formData.nama_barang}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="e.g. Memory Card 128GB"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Quantity</label>
                                        <input
                                            type="number"
                                            name="qty"
                                            value={formData.qty}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Est. Price</label>
                                        <input
                                            type="number"
                                            name="harga"
                                            value={formData.harga}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Purchase Link</label>
                                    <input
                                        type="url"
                                        name="Link_Pembelian"
                                        value={formData.Link_Pembelian}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-blue-600 placeholder:text-slate-300"
                                        placeholder="https://tokopedia.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">PIC Assigned</label>
                                    <div className="flex items-center px-5 py-4 bg-slate-100/50 border-2 border-slate-100 rounded-2xl text-slate-500 cursor-not-allowed">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center mr-3 text-indigo-500 font-black text-xs">
                                            {formData.pic_display?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{formData.pic_display}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full py-4 px-6 rounded-2xl text-white font-black text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2.5 ${editingId
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20'
                                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/20'
                                        }`}
                                >
                                    {editingId ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            UPDATE REQUEST
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            SUBMIT REQUEST
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                                <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Request History</h3>
                                <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                    {requests.length} ITEMS
                                </span>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-400">
                                        <tr className="border-b border-slate-50">
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Item Details</th>
                                            <th className="px-4 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Qty</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {requests.length > 0 ? (
                                            requests.map((item) => (
                                                <tr key={item.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                                    <td className="px-6 py-6">
                                                        <div className="font-bold text-slate-800 mb-1">{item.nama_barang}</div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Rp {parseInt(item.harga).toLocaleString()}</span>
                                                            {item.Link_Pembelian && (
                                                                <a
                                                                    href={item.Link_Pembelian}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[10px] font-black text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
                                                                >
                                                                    LINK <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-6 text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 border border-slate-100">{item.qty}</span>
                                                    </td>
                                                    <td className="px-6 py-6 text-center">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-2 bg-white text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-2 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all active:scale-90"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        </div>
                                                        <p className="font-bold text-slate-400">No purchase requests yet.</p>
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
