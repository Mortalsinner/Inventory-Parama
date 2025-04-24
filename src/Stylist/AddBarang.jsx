import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useState } from 'react';
import { supabase } from '../CreateClient';
import { useNavigate } from 'react-router-dom';

const AddBarang = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fotoBarang: null,
    namaBarang: '',
    kode_barang: '',
    JumlahBarang: '',
    kategori: '',
    statusBarang: ''
  });

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
      // Validasi field
      if (!formData.namaBarang || !formData.JumlahBarang || !formData.statusBarang ||
        !formData.kode_barang || !formData.kategori) {
        alert('Mohon isi semua field yang diperlukan!');
        return;
      }

      let fotoPath = null;

      // Upload file jika ada
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
          console.error('Upload error:', uploadError);
          alert('Gagal upload gambar: ' + uploadError.message);
          return;
        }

        fotoPath = filePath; // hanya simpan path-nya saja (bukan URL!)
      }

      // Simpan data ke tabel
      const { error: insertError } = await supabase
        .from('Barang')
        .insert([{
          fotoBarang: fotoPath, // path bukan URL
          kode_barang: formData.kode_barang,
          namaBarang: formData.namaBarang,
          JumlahBarang: formData.JumlahBarang,
          kategori: formData.kategori,
          statusBarang: formData.statusBarang,
          created_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      alert('Data berhasil ditambahkan!');
      navigate('/');
    } catch (error) {
      console.error('Error submitting data:', error.message);
      alert(`Gagal menambahkan data: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">Insert Barang</h2>

      <form onSubmit={handleSubmit}>
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
          Submit
        </button>

        <Link to="/">
          <button className="btn btn-error mb-4 text-white ml-4">
            Cancel
          </button>
        </Link>
      </form>
    </div>
  );
}

export default AddBarang;
