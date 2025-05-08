import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddSekolah = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaSekolah: '',
    statusPengiriman: '',
    create_By: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.namaSekolah || !formData.statusPengiriman || !formData.create_By) {
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
          statusPengiriman: formData.statusPengiriman,
          create_By: formData.create_By
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
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-lg h-screen overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Tambah Distribusi Barang</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sekolah</label>
              <input
                type="text"
                name="namaSekolah"
                value={formData.namaSekolah}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Pengiriman</label>
              <select
                name="statusPengiriman"
                value={formData.statusPengiriman}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Pilih Status</option>
                <option value="belum dikirim">Belum Dikirim</option>
                <option value="dikirim">Dikirim</option>
                <option value="diterima">Diterima</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Create By</label>
              <input
                type="text"
                name="create_By"
                value={formData.create_By}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/distribusi')}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSekolah;