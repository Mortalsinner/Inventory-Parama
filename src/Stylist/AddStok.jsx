import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddStok = () => {
    const { KodeStok } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState([{ idBarang: '', qtyBarang: '' }]);
    const [pic, setPic] = useState('');
    const [barangList, setBarangList] = useState([]);

    useEffect(() => {
        // Ambil daftar barang untuk select
        const fetchBarang = async () => {
            const { data, error } = await supabase
                .from('Barang')
                .select('idBarang, namaBarang, JumlahBarang');
            if (!error && data) {
                setBarangList(data);
            }
        };
        fetchBarang();
    }, []);

    const handleChange = (index, e) => {
        const newFormData = [...formData];
        newFormData[index][e.target.name] = e.target.value;
        setFormData(newFormData);
    };

    const handleAddRow = () => {
        setFormData([...formData, { idBarang: '', qtyBarang: '' }]);
    };

    const handleRemoveRow = (index) => {
        if (formData.length === 1) return;
        const newFormData = formData.filter((_, i) => i !== index);
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi input PIC
        if (!pic) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: 'Nama PIC wajib diisi!'
            });
            return;
        }

        // Validasi semua input dan stok
        for (let i = 0; i < formData.length; i++) {
            const item = formData[i];
            if (!item.idBarang || !item.qtyBarang) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validasi Gagal',
                    text: 'Nama Barang dan Jumlah wajib diisi di semua baris!'
                });
                return;
            }

            const barang = barangList.find(b => b.idBarang === parseInt(item.idBarang));
            if (barang && parseInt(item.qtyBarang) > barang.JumlahBarang) {
                Swal.fire({
                    icon: 'error',
                    title: 'Stok Tidak Mencukupi',
                    text: `Jumlah untuk ${barang.namaBarang} melebihi stok tersedia (${barang.JumlahBarang})!`
                });
                return;
            }
        }

        try {
            // Insert multiple rows ke tabel Stok_Barang
            const rows = formData.map(item => ({
                idDetailDistribusi: KodeStok ? parseInt(KodeStok) : null,
                idBarang: parseInt(item.idBarang),
                qtyBarang: parseInt(item.qtyBarang),
                pic: pic,
                created_at: new Date().toISOString()
            }));
            const { error } = await supabase
                .from('Stok_Barang')
                .insert(rows);
            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Stok barang berhasil ditambahkan!',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/distribusi');
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: error.message
            });
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto py-10">
                <div className="flex items-center gap-5 mb-12">
                    <button onClick={() => navigate('/distribusi')} className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-slate-200/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tambah Stok Distribusi</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Alokasikan barang ke jalur distribusi tertentu</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* PIC Header Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100/50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Penanggung Jawab</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">Kontak utama untuk batch ini</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Nama Lengkap PIC</label>
                            <input
                                type="text"
                                value={pic}
                                onChange={(e) => setPic(e.target.value)}
                                className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                placeholder="Masukkan Nama PIC"
                                required
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-[11px] font-black text-slate-400 tracking-[0.3em] uppercase">Barang yang Didistribusikan</h3>
                            <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full ring-1 ring-indigo-100">{formData.length} BATCH</span>
                        </div>

                        {formData.map((item, idx) => (
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500" key={idx}>
                                {formData.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(idx)}
                                        className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-slate-100 text-rose-500 rounded-2xl shadow-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90 z-10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                    <div className="md:col-span-8">
                                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Aset Target</label>
                                        <div className="relative">
                                            <select
                                                name="idBarang"
                                                value={item.idBarang}
                                                onChange={(e) => handleChange(idx, e)}
                                                className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                                                required
                                            >
                                                <option value="">Pilih Aset...</option>
                                                {barangList.map((barang) => (
                                                    <option key={barang.idBarang} value={barang.idBarang}>
                                                        {barang.namaBarang}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-4">
                                        <div className="flex justify-between items-center mb-3 ml-1">
                                            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Jumlah</label>
                                            {item.idBarang && (
                                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md ring-1 ring-indigo-100">
                                                    STOK: {barangList.find(b => b.idBarang === parseInt(item.idBarang))?.JumlahBarang || 0}
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            name="qtyBarang"
                                            value={item.qtyBarang}
                                            onChange={(e) => handleChange(idx, e)}
                                            className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                            min="1"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-xs tracking-[0.2em] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 group bg-white shadow-sm"
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all group-hover:rotate-90">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </div>
                            TAMBAH BATCH ASET LAIN
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 pt-8 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/distribusi')}
                            className="flex-1 py-5 px-6 rounded-[1.5rem] text-slate-400 font-black text-xs tracking-[0.2em] border border-slate-100 hover:bg-slate-50 hover:text-rose-500 transition-all active:scale-95"
                        >
                            BATALKAN ENTRI
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-5 px-6 rounded-[1.5rem] text-white font-black text-xs tracking-[0.2em] bg-indigo-600 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex justify-center items-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            SIMPAN DISTRIBUSI
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStok;