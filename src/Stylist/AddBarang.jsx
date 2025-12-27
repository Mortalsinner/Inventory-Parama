import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { supabase } from '../CreateClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddBarang = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fotoBarang: null,
    namaBarang: '',
    JumlahBarang: '',
    kategori: '',
    statusBarang: ''
  });

  // Menambahkan useEffect untuk rerender

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
      // Validation
      if (!formData.namaBarang || !formData.JumlahBarang || !formData.statusBarang || !formData.kategori) {
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan Validasi',
          text: 'Mohon isi semua field yang diperlukan!'
        });
        return;
      }

      let fotoPath = null;

      // Upload file if exists
      if (formData.fotoBarang) {
        const fileExt = formData.fotoBarang.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('fotobarang')
          .upload(filePath, formData.fotoBarang, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          Swal.fire({
            icon: 'error',
            title: 'Kesalahan Unggah',
            text: 'Gagal mengunggah gambar: ' + uploadError.message
          });
          return;
        }

        fotoPath = filePath;
      }

      // Save to database
      const { error: insertError } = await supabase
        .from('Barang')
        .insert([{
          fotoBarang: fotoPath,
          namaBarang: formData.namaBarang,
          JumlahBarang: formData.JumlahBarang,
          kategori: formData.kategori,
          statusBarang: formData.statusBarang,
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate('/home');
      });

    } catch (error) {
      console.error('Error submitting data:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan!',
        text: `Gagal menambahkan data: ${error.message}`
      });
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center gap-5 mb-12">
          <Link to="/home" className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-slate-200/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tambah Aset Baru</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Buat entri baru dalam inventaris peralatan Anda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">

            {/* File Input */}
            <div className="mb-10">
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Gambar Aset</label>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  name="fotoBarang"
                  onChange={handleChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] py-14 bg-slate-50 group-hover:bg-indigo-50/30 group-hover:border-indigo-200 transition-all duration-500 transform group-hover:scale-[1.01]">
                  <div className="p-5 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500 ring-1 ring-slate-100 group-hover:ring-indigo-100">
                    <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-1">{formData.fotoBarang ? formData.fotoBarang.name : 'Klik untuk memilih foto aset'}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">Disarankan menggunakan format SVG, PNG, atau JPG resolusi tinggi</p>
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-inter">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Nama Resmi Aset</label>
                <input
                  type="text"
                  name="namaBarang"
                  value={formData.namaBarang}
                  onChange={handleChange}
                  placeholder="misal: Kamera Cinema EOS C70"
                  className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Jumlah Stok Awal</label>
                <input
                  type="number"
                  name="JumlahBarang"
                  value={formData.JumlahBarang}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Klasifikasi</label>
                <div className="relative">
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 font-bold appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Properti">Properti Studio</option>
                    <option value="Gear">Peralatan Produksi</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Status Pemeliharaan</label>
                <div className="flex gap-4">
                  {['Normal', 'Rusak'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, statusBarang: status })}
                      className={`flex-1 py-5 px-8 rounded-2xl font-black text-xs tracking-widest transition-all border-2 ${formData.statusBarang === status
                        ? status === 'Normal'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xl shadow-emerald-500/10'
                          : 'bg-rose-50 border-rose-500 text-rose-700 shadow-xl shadow-rose-500/10'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-6 pt-4">
            <Link to="/home" className="px-8 py-5 text-[11px] font-black text-slate-400 hover:text-rose-500 transition-all tracking-[0.2em] uppercase">
              Batalkan Perubahan
            </Link>
            <button
              type="submit"
              className="px-14 py-5 bg-indigo-600 shadow-2xl shadow-indigo-600/30 text-white rounded-[1.5rem] hover:bg-indigo-700 transition-all active:scale-95 font-black text-xs tracking-[0.2em]"
            >
              SIMPAN ASET
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBarang;
