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
                .select('idBarang, namaBarang');
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

        // Validasi semua input
        for (let i = 0; i < formData.length; i++) {
            if (!formData[i].idBarang || !formData[i].qtyBarang) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validasi Gagal',
                    text: 'Nama Barang dan Jumlah wajib diisi di semua baris!'
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
                title: 'Error',
                text: error.message
            });
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-10 bg-emerald-500 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Add Distribution Stock</h2>
                        <p className="text-sm text-slate-500 font-medium">Assign items to specific distribution tracks</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* PIC Header Card */}
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white/40">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Responsible Person</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">PIC Name</label>
                            <input
                                type="text"
                                value={pic}
                                onChange={(e) => setPic(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Enter PIC Name"
                                required
                            />
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase">Items to Distribute</h3>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-slate-200 text-slate-500 rounded-md">{formData.length} BATCHES</span>
                        </div>

                        {formData.map((item, idx) => (
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-500" key={idx}>
                                {formData.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(idx)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full shadow-lg shadow-rose-500/30 flex items-center justify-center hover:bg-rose-600 transition-all active:scale-90 z-10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                    <div className="md:col-span-8">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Select Asset</label>
                                        <select
                                            name="idBarang"
                                            value={item.idBarang}
                                            onChange={(e) => handleChange(idx, e)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat appearance-none"
                                            required
                                        >
                                            <option value="">Choose Asset...</option>
                                            {barangList.map((barang) => (
                                                <option key={barang.idBarang} value={barang.idBarang}>
                                                    {barang.namaBarang}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Quantity</label>
                                        <input
                                            type="number"
                                            name="qtyBarang"
                                            value={item.qtyBarang}
                                            onChange={(e) => handleChange(idx, e)}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
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
                            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs tracking-widest hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            ADD ANOTHER ASSET
                        </button>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/distribusi')}
                            className="flex-1 py-4 px-6 rounded-2xl text-slate-400 font-black text-xs tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 px-6 rounded-2xl text-white font-black text-xs tracking-[0.2em] bg-gradient-to-r from-emerald-600 to-teal-600 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 flex justify-center items-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            SAVE DISTRIBUTION
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStok;