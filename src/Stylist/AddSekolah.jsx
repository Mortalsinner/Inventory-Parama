import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddSekolah = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaSekolah: '',
    statusPengiriman: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.namaSekolah || !formData.statusPengiriman) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Semua field wajib diisi!'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('Distribusi_Barang')
        .insert([{
          namaSekolah: formData.namaSekolah,
          statusPengiriman: formData.statusPengiriman
        }]);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: 'Distribusi berhasil ditambahkan!',
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
      <div className="max-w-2xl mx-auto py-10">
        <div className="flex items-center gap-5 mb-12">
          <button onClick={() => navigate('/distribusi')} className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-slate-200/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tambah Jalur Distribusi</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Buat rekaman distribusi sekolah baru</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                name="namaSekolah"
                value={formData.namaSekolah}
                onChange={handleChange}
                className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                placeholder="misal: SMK Negeri 1 Jakarta"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Tahap Pengiriman Awal</label>
              <div className="relative">
                <select
                  name="statusPengiriman"
                  value={formData.statusPengiriman}
                  onChange={handleChange}
                  className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                  required
                >
                  <option value="">Pilih Status Awal...</option>
                  <option value="belum dikirim">Belum Dikirim (Menunggu)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
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
                BUAT REKAMAN JALUR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSekolah;