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
        title: 'Error',
        text: error.message
      });
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-10 bg-indigo-600 rounded-full" />
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Add Distribution Track</h2>
            <p className="text-sm text-slate-500 font-medium">Create a new school distribution record</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 px-1">School / Institution Name</label>
              <input
                type="text"
                name="namaSekolah"
                value={formData.namaSekolah}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="e.g. SMK Negeri 1 Jakarta"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 px-1">Initial Status</label>
              <select
                name="statusPengiriman"
                value={formData.statusPengiriman}
                onChange={handleChange}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2394a3b8%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1.5rem_center] bg-no-repeat appearance-none"
                required
              >
                <option value="">Select Status...</option>
                <option value="belum dikirim">Not Yet Shipped</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/distribusi')}
                className="flex-1 py-5 px-6 rounded-2xl text-slate-400 font-black text-xs tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-[2] py-5 px-6 rounded-2xl text-white font-black text-xs tracking-[0.2em] bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95 flex justify-center items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                CREATE RECORD
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSekolah;