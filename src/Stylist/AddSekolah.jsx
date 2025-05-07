import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddSekolah = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    namaSekolah: '',
    iduser: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user list untuk select, hanya yang role Stylist
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('User')
        .select('iduser, Username, Role')
        .eq('Role', 'Stylist');
      if (!error && data) {
        setUsers(data);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.namaSekolah || !formData.iduser) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Nama Sekolah dan User wajib diisi!'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('Stok')
        .insert([{
          namaSekolah: formData.namaSekolah,
          iduser: formData.iduser
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User (Stylist)</label>
              <select
                name="iduser"
                value={formData.iduser}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                required
              >
                <option value="">Pilih User</option>
                {users.map(user => (
                  <option key={user.iduser} value={user.iduser}>
                    {user.Username}
                  </option>
                ))}
              </select>
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