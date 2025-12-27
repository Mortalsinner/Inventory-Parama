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
                title: 'Kesalahan',
                text: 'Gagal mengambil detail barang'
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
                    title: 'Kesalahan Validasi',
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
                title: 'Berhasil',
                text: 'Data berhasil diperbarui!',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/home');
            });
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: 'Gagal memperbarui data: ' + error.message
            });
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto py-10">
                <div className="flex items-center gap-5 mb-12">
                    <Link to="/home" className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-slate-200/50">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ubah Aset</h2>
                        </div>
                        <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Perbarui informasi inventaris yang ada</p>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <input type="hidden" name="updated_at" value={new Date().toISOString()} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left Side: Photo Upload */}
                            <div className="space-y-6">
                                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Visualisasi Aset</label>
                                <div className="relative group">
                                    <div className="w-full h-72 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group-hover:bg-indigo-50/30 group-hover:border-indigo-200 transform group-hover:scale-[1.01]">
                                        <input
                                            type="file"
                                            name="fotoBarang"
                                            onChange={handleChange}
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-all duration-500">
                                            <div className="p-5 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500 ring-1 ring-slate-100 group-hover:ring-indigo-100">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <span className="text-xs font-black tracking-widest uppercase">Perbarui Foto Aset</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 px-2 font-black uppercase tracking-widest">Mendukung: JPG, PNG, WEBP (Maks 2MB)</p>
                                </div>
                            </div>

                            {/* Right Side: Form Fields */}
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Nama Resmi Aset</label>
                                    <input
                                        type="text"
                                        name="namaBarang"
                                        value={formData.namaBarang}
                                        onChange={handleChange}
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                        placeholder="Masukkan nama barang..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Stok Saat Ini</label>
                                        <input
                                            type="number"
                                            name="JumlahBarang"
                                            value={formData.JumlahBarang}
                                            onChange={handleChange}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Status Operasional</label>
                                        <div className="relative">
                                            <select
                                                name="statusBarang"
                                                value={formData.statusBarang}
                                                onChange={handleChange}
                                                className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                                            >
                                                <option value="">Status...</option>
                                                <option value="Normal">Berfungsi Baik</option>
                                                <option value="Rusak">Rusak</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Kategori Peralatan</label>
                                    <div className="relative">
                                        <select
                                            name="kategori"
                                            value={formData.kategori}
                                            onChange={handleChange}
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                                        >
                                            <option value="">Pilih kategori...</option>
                                            <option value="Properti">Properti Studio</option>
                                            <option value="Gear">Peralatan Produksi</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 pt-8 border-t border-slate-100">
                            <Link to="/home" className="flex-1">
                                <button className="w-full py-5 px-6 rounded-[1.5rem] text-slate-400 font-black text-xs tracking-[0.2em] border border-slate-100 hover:bg-slate-50 hover:text-rose-500 transition-all active:scale-95">
                                    BATALKAN PERUBAHAN
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className="flex-[2] py-5 px-6 rounded-[1.5rem] text-white font-black text-xs tracking-[0.2em] bg-indigo-600 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex justify-center items-center gap-3"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                PERBARUI ASET
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditBarang;