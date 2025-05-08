import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddStok = () => {
    const navigate = useNavigate();
    const { KodeStok } = useParams();
    const [barangList, setBarangList] = useState([]);
    const [formData, setFormData] = useState({
        NamaBarang: '',
        qtyBarang: ''
    });

    useEffect(() => {
        // Ambil daftar barang untuk select
        const fetchBarang = async () => {
            const { data, error } = await supabase
                .from('Barang')
                .select('namaBarang');
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
    
        if (!formData.NamaBarang || !formData.qtyBarang) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: 'Nama Barang dan Jumlah wajib diisi!'
            });
            return;
        }
    
        try {
            // Insert ke tabel Detail_Stok_Barang
            const { error } = await supabase
                .from('Detail_Stok_Barang')
                .insert([{
                    KodeStok: KodeStok ? parseInt(KodeStok) : null,
                    NamaBarang: formData.NamaBarang,
                    qtyBarang: parseInt(formData.qtyBarang)
                }]);
            if (error) throw error;
    
            Swal.fire({
                icon: 'success',
                title: 'Sukses',
                text: 'Detail stok barang berhasil ditambahkan!',
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
                    Tambah Detail Stok Barang
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Nama Barang</label>
                            <select
                                name="NamaBarang"
                                value={formData.NamaBarang}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                                required
                            >
                                <option value="">Pilih Barang</option>
                                {barangList.map((barang, idx) => (
                                    <option key={idx} value={barang.namaBarang}>
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