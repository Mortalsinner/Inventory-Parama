import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddStok = () => {
    const { KodeStok } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ idBarang: '', qtyBarang: '' });
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.idBarang || !formData.qtyBarang) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: 'Nama Barang dan Jumlah wajib diisi!'
            });
            return;
        }
    
        try {
            // Insert ke tabel Stok_Barang
            const { error } = await supabase
                .from('Stok_Barang')
                .insert([{
                    idDetailDistribusi: KodeStok ? parseInt(KodeStok) : null,
                    idBarang: parseInt(formData.idBarang),
                    qtyBarang: parseInt(formData.qtyBarang),
                    created_at: new Date().toISOString()
                }]);
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
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-lg h-screen overflow-auto">
            <div className="max-w-xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                    Tambah Stok Barang ke Distribusi
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Nama Barang</label>
                            <select
                                name="idBarang"
                                value={formData.idBarang}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                                required
                            >
                                <option value="">Pilih Barang</option>
                                {barangList.map((barang) => (
                                    <option key={barang.idBarang} value={barang.idBarang}>
                                        {barang.namaBarang}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Stok</label>
                            <input
                                type="number"
                                name="qtyBarang"
                                value={formData.qtyBarang}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                min="1"
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

export default AddStok;