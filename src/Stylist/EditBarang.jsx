import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const EditBarang = () => {
    const navigate = useNavigate();
    const { idBarang } = useParams();

    const [formData, setFormData] = useState({
        fotoBarang: null,
        namaBarang: '',
        JumlahBarang: '',
        kategori: '',
        statusBarang: '',
        updated_at: new Date().toISOString()
    });

    useEffect(() => {
        fetchBarang();
    }, []);

    const fetchBarang = async () => {
        try {
            const { data, error } = await supabase
                .from('Barang')
                .select('*')
                .eq('idBarang', idBarang)
                .single();

            if (error) throw error;

            setFormData({
                fotoBarang: data.fotoBarang,
                namaBarang: data.namaBarang,
                JumlahBarang: data.JumlahBarang,
                kategori: data.kategori,
                statusBarang: data.statusBarang,
                updated_at: data.updated_at || new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error fetching barang details'
            });
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'file'
            ? e.target.files[0]
            : e.target.type === 'number'
                ? parseInt(e.target.value)
                : e.target.value;

        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.namaBarang || !formData.JumlahBarang || !formData.statusBarang ||
                !formData.kategori) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Error',
                    text: 'Mohon isi semua field yang diperlukan!'
                });
                return;
            }

            let fotoUrl = formData.fotoBarang;

            // Handle new image upload if there is one
            if (formData.fotoBarang && formData.fotoBarang instanceof File) {
                const fileExt = formData.fotoBarang.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('fotobarang')
                    .upload(fileName, formData.fotoBarang, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('fotobarang')
                    .getPublicUrl(fileName);

                if (data) {
                    fotoUrl = fileName;
                }
            }

            const { error } = await supabase
                .from('Barang')
                .update({
                    fotoBarang: fotoUrl,
                    namaBarang: formData.namaBarang,
                    JumlahBarang: formData.JumlahBarang,
                    kategori: formData.kategori,
                    statusBarang: formData.statusBarang,
                    updated_at: new Date().toISOString()
                })
                .eq('idBarang', idBarang);

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data berhasil diupdate!',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/home');
            });
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengupdate data: ' + error.message
            });
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-10 bg-orange-500 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Modify Asset</h2>
                        <p className="text-sm text-slate-500 font-medium">Update existing inventory information</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <input type="hidden" name="updated_at" value={new Date().toISOString()} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: Photo Upload */}
                            <div className="space-y-6">
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Asset Visualization</label>
                                <div className="relative group">
                                    <div className="w-full h-64 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:bg-slate-100 group-hover:border-orange-300">
                                        <input
                                            type="file"
                                            name="fotoBarang"
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-orange-500 transition-colors">
                                            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-xs font-bold tracking-widest uppercase">Update Photo</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-3 px-2 font-medium">Support: JPG, PNG, WEBP (Max 2MB)</p>
                                </div>
                            </div>

                            {/* Right Side: Form Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Asset Name</label>
                                    <input
                                        type="text"
                                        name="namaBarang"
                                        value={formData.namaBarang}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                        placeholder="Enter item name..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Quantity</label>
                                        <input
                                            type="number"
                                            name="JumlahBarang"
                                            value={formData.JumlahBarang}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Status</label>
                                        <select
                                            name="statusBarang"
                                            value={formData.statusBarang}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat appearance-none"
                                        >
                                            <option value="">Status...</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Rusak">Rusak</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 px-1">Category</label>
                                    <select
                                        name="kategori"
                                        value={formData.kategori}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-bold text-slate-700 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.25rem_center] bg-no-repeat appearance-none"
                                    >
                                        <option value="">Choose category...</option>
                                        <option value="Properti">Properti</option>
                                        <option value="Gear">Gear</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
                            <Link to="/home" className="flex-1">
                                <button className="w-full py-5 px-6 rounded-2xl text-slate-400 font-black text-xs tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-95">
                                    DISCARD CHANGES
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className="flex-[2] py-5 px-6 rounded-2xl text-white font-black text-xs tracking-[0.2em] bg-gradient-to-r from-orange-500 to-amber-500 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-95 flex justify-center items-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                UPDATE ASSET
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBarang;