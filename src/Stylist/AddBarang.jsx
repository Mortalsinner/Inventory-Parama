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
          title: 'Validation Error',
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
            title: 'Upload Error',
            text: 'Gagal upload gambar: ' + uploadError.message
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
        title: 'Success!',
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
        title: 'Error!',
        text: `Gagal menambahkan data: ${error.message}`
      });
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/home" className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Add New Asset</h2>
            <p className="text-sm text-slate-500 font-medium">Create a new entry in your equipment inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">

            {/* File Input */}
            <div className="mb-10">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Identification Photo</label>
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  name="fotoBarang"
                  onChange={handleChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl py-12 bg-slate-50 group-hover:bg-blue-50/50 group-hover:border-blue-200 transition-all duration-300">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-1">{formData.fotoBarang ? formData.fotoBarang.name : 'Click to upload or drag and drop'}</p>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">SVG, PNG, JPG (MAX. 800x400px)</p>
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Asset Name</label>
                <input
                  type="text"
                  name="namaBarang"
                  value={formData.namaBarang}
                  onChange={handleChange}
                  placeholder="e.g. Professional Tripod X1"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-semibold placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Initial Quantity</label>
                <input
                  type="number"
                  name="JumlahBarang"
                  value={formData.JumlahBarang}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-semibold placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Asset Category</label>
                <div className="relative">
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-semibold appearance-none cursor-pointer shadow-inner"
                  >
                    <option value="">Select Category</option>
                    <option value="Properti">Properti</option>
                    <option value="Gear">Gear</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Initial Condition Status</label>
                <div className="flex gap-4">
                  {['Normal', 'Rusak'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, statusBarang: status })}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all border-2 ${formData.statusBarang === status
                        ? status === 'Normal'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10'
                          : 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-500/10'
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
          <div className="flex items-center justify-end gap-5">
            <Link to="/home" className="px-8 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors tracking-widest uppercase">
              Discard Changes
            </Link>
            <button
              type="submit"
              className="px-12 py-4 bg-slate-900 shadow-2xl shadow-slate-900/30 text-white rounded-[1.5rem] hover:bg-black transition-all active:scale-95 font-black text-sm tracking-[0.2em]"
            >
              SAVE ASSET
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBarang;
