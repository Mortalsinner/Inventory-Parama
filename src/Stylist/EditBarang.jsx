import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const EditBarang = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
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
                .eq('id', id)
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
                title: 'Error',
                text: 'Error fetching barang details'
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
                    title: 'Validation Error',
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
                .eq('id', id);

            if (error) throw error;
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data berhasil diupdate!',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                navigate('/home');
            });
        } catch (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengupdate data: ' + error.message
            });
        }
    };

    return (
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-lg h-screen overflow-auto">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Edit Item</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="hidden" name="updated_at" value={new Date().toISOString()} />
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {/* File Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Item Photo</label>
                            <input
                                type="file"
                                name="fotoBarang"
                                onChange={handleChange}
                                accept="image/*"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Text Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    name="namaBarang"
                                    value={formData.namaBarang}
                                    onChange={handleChange}
                                    placeholder="Enter item name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    name="JumlahBarang"
                                    value={formData.JumlahBarang}
                                    onChange={handleChange}
                                    placeholder="Enter quantity"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Properti">Properti</option>
                                    <option value="Gear">Gear</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="statusBarang"
                                    value={formData.statusBarang}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Rusak">Rusak</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Link to="/">
                            <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBarang;