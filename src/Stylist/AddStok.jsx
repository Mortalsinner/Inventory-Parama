import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const AddStok = () => {
    const { KodeStok } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState([{ idBarang: '', qtyBarang: '' }]);
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

    const handleChange = (index, e) => {
        const newFormData = [...formData];
        newFormData[index][e.target.name] = e.target.value;
        setFormData(newFormData);
    };

    const handleAddRow = () => {
        setFormData([...formData, { idBarang: '', qtyBarang: '' }]);
    };

    const handleRemoveRow = (index) => {
        if (formData.length === 1) return;
        const newFormData = formData.filter((_, i) => i !== index);
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi semua input
        for (let i = 0; i < formData.length; i++) {
            if (!formData[i].idBarang || !formData[i].qtyBarang) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validasi Gagal',
                    text: 'Nama Barang dan Jumlah wajib diisi di semua baris!'
                });
                return;
            }
        }

        try {
            // Insert multiple rows ke tabel Stok_Barang
            const rows = formData.map(item => ({
                idDetailDistribusi: KodeStok ? parseInt(KodeStok) : null,
                idBarang: parseInt(item.idBarang),
                qtyBarang: parseInt(item.qtyBarang),
                created_at: new Date().toISOString()
            }));
            const { error } = await supabase
                .from('Stok_Barang')
                .insert(rows);
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
                        {formData.map((item, idx) => (
                            <div className="flex gap-4 mb-4 items-end" key={idx}>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Nama Barang</label>
                                    <select
                                        name="idBarang"
                                        value={item.idBarang}
                                        onChange={(e) => handleChange(idx, e)}
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
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Stok</label>
                                    <input
                                        type="number"
                                        name="qtyBarang"
                                        value={item.qtyBarang}
                                        onChange={(e) => handleChange(idx, e)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        min="1"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow(idx)}
                                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors"
                                    disabled={formData.length === 1}
                                >
                                    Hapus
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddRow}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors mt-2"
                        >
                            + Tambah Barang
                        </button>
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