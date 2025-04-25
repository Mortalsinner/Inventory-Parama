import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../CreateClient';

const EditBarang = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        fotoBarang: null,
        namaBarang: '',
        kode_barang: '',
        JumlahBarang: '',
        kategori: '',
        statusBarang: '',
        update_at: new Date().toISOString()  // Add timestamp
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
                kode_barang: data.kode_barang,
                JumlahBarang: data.JumlahBarang,
                kategori: data.kategori,
                statusBarang: data.statusBarang,
                update_at: data.update_at || new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching barang:', error);
            alert('Error fetching barang details');
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
                !formData.kode_barang || !formData.kategori) {
                alert('Mohon isi semua field yang diperlukan!');
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
                    kode_barang: formData.kode_barang,
                    namaBarang: formData.namaBarang,
                    JumlahBarang: formData.JumlahBarang,
                    kategori: formData.kategori,
                    statusBarang: formData.statusBarang,
                    // update_at: formData.update_at
                })
                .eq('id', id);

            if (error) throw error;
            
            alert('Data berhasil diupdate!');
            navigate('/');
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Gagal mengupdate data: ' + error.message);
        }
    };

    return (
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
            <h2 className="text-xl font-bold mb-4">Edit Barang</h2>

            <form onSubmit={handleSubmit}>
                {/* Add hidden input for timestamp */}
                <input 
                    type="hidden"
                    name="update_at"
                    value={new Date().toISOString()}
                />
                
                {/* Existing form inputs */}
                <input 
                    type="file"
                    name="fotoBarang"
                    onChange={handleChange}
                    accept="image/*"
                    className="file-input mb-4" 
                /><br />

                <input 
                    type="text" 
                    name="namaBarang"
                    value={formData.namaBarang}
                    onChange={handleChange}
                    placeholder="Nama Barang" 
                    className="input mb-4" 
                /><br />

                <input 
                    type="text" 
                    name="kode_barang"
                    value={formData.kode_barang}
                    onChange={handleChange}
                    placeholder="Kode Barang" 
                    className="input mb-4" 
                /><br />

                <input 
                    type="number" 
                    name="JumlahBarang"
                    value={formData.JumlahBarang}
                    onChange={handleChange}
                    placeholder="Quantity" 
                    className="input mb-4" 
                /><br />
                
                <select 
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="select select-primary mb-4"
                >
                    <option value="">Pilih Kategori</option>
                    <option value="Properti">Properti</option>
                    <option value="Gear">Gear</option>
                </select><br />

                <select 
                    name="statusBarang"
                    value={formData.statusBarang}
                    onChange={handleChange}
                    className="select select-primary mb-4"
                >
                    <option value="">Pilih Status</option>
                    <option value="Normal">Normal</option>
                    <option value="Rusak">Rusak</option>
                </select><br />
                
                <button 
                    type="submit" 
                    className="btn btn-accent mb-4 text-white"
                >
                    Update
                </button>

                <Link to="/">
                    <button className="btn btn-error mb-4 text-white ml-4">
                        Cancel
                    </button>
                </Link>
            </form>
        </div>
    );
};

export default EditBarang;