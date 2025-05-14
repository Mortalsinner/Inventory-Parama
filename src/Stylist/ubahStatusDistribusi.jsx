import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const UbahStatusDistribusi = () => {
  const { KodeStok } = useParams(); // diasumsikan ini adalah idDetailDistribusi
  const navigate = useNavigate();
  const [statusPengiriman, setStatusPengiriman] = useState('');
  const [loading, setLoading] = useState(true);
  const [fotoBukti, setFotoBukti] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fotoBuktiUrl, setFotoBuktiUrl] = useState(null);

  useEffect(() => {
    const fetchDistribusi = async () => {
      const { data, error } = await supabase
        .from('Distribusi_Barang')
        .select('statusPengiriman, fotoBukti')
        .eq('idDetailDistribusi', KodeStok)
        .single();
      if (!error && data) {
        setStatusPengiriman(data.statusPengiriman || '');
        setFotoBuktiUrl(data.fotoBukti || null);
      }
      setLoading(false);
    };
    fetchDistribusi();
  }, [KodeStok]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFotoBukti(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statusPengiriman) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Status Pengiriman wajib diisi!'
      });
      return;
    }
    setUploading(true);
    let fotoBuktiUrl = null;

    try {
      // Upload foto jika ada file yang dipilih
      if (fotoBukti) {
        const fileExt = fotoBukti.name.split('.').pop();
        const fileName = `bukti_${KodeStok}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('fotobukti')
          .upload(fileName, fotoBukti, {
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) throw uploadError;
        // Dapatkan public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('fotobukti')
          .getPublicUrl(fileName);
        fotoBuktiUrl = publicUrlData.publicUrl;
      }

      // Update statusPengiriman dan fotoBukti di database
      const { error } = await supabase
        .from('Distribusi_Barang')
        .update(
          fotoBuktiUrl
            ? { statusPengiriman, fotoBukti: fotoBuktiUrl }
            : { statusPengiriman }
        )
        .eq('idDetailDistribusi', KodeStok);
      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Sukses',
        text: 'Status pengiriman berhasil diubah!',
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
    setUploading(false);
  };

  if (loading) return <div>Loading...</div>;

  // Log data hasil fetch untuk debugging
  console.log("statusPengiriman:", statusPengiriman);
  console.log("fotoBuktiUrl:", fotoBuktiUrl);

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-lg h-screen overflow-auto">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Ubah Status Pengiriman
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto Bukti Saat Ini</label>
              {fotoBuktiUrl ? (
                <img src={fotoBuktiUrl} alt="Foto Bukti" className="w-32 h-32 object-cover rounded mb-2" />
              ) : (
                <span className="text-gray-500">Tidak ada foto bukti</span>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Pengiriman</label>
              <select
                name="statusPengiriman"
                value={statusPengiriman}
                onChange={e => setStatusPengiriman(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Foto Bukti</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/distribusi')}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
              disabled={uploading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={uploading}
            >
              {uploading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UbahStatusDistribusi;