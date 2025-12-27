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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-black text-xs tracking-widest uppercase">Memuat Data...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto py-10">
        <div className="flex items-center gap-5 mb-12">
          <button onClick={() => navigate('/distribusi')} className="p-4 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 shadow-slate-200/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Ubah Status Pengiriman</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4 mt-1">Perbarui status logistik dan unggah bukti pengiriman</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-col items-center gap-6 p-8 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] self-start ml-1">Foto Bukti Saat Ini</label>
              {fotoBuktiUrl ? (
                <div className="relative group">
                  <img src={fotoBuktiUrl} alt="Foto Bukti" className="w-48 h-48 object-cover rounded-[2rem] shadow-xl border-4 border-white transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 rounded-[2rem] bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="w-48 h-48 rounded-[2rem] bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400 border-2 border-dashed border-slate-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Tidak ada foto</span>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Status Pengiriman</label>
                <div className="relative">
                  <select
                    name="statusPengiriman"
                    value={statusPengiriman}
                    onChange={e => setStatusPengiriman(e.target.value)}
                    className="w-full px-7 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer shadow-sm"
                    required
                  >
                    <option value="">Pilih Status...</option>
                    <option value="belum dikirim">Belum Dikirim</option>
                    <option value="dikirim">Dikirim ke Lokasi</option>
                    <option value="diterima">Telah Diterima Sekolah</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 ml-1">Unggah Bukti Baru (Opsional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="w-full h-24 flex flex-col items-center justify-center px-4 py-6 bg-slate-50 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-500 transition-all">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="font-bold text-sm">{fotoBukti ? fotoBukti.name : "Pilih file gambar..."}</span>
                    </div>
                    <input type='file' className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/distribusi')}
                className="flex-1 py-5 px-6 rounded-[1.5rem] text-slate-400 font-black text-xs tracking-[0.2em] border border-slate-100 hover:bg-slate-50 hover:text-rose-500 transition-all active:scale-95"
                disabled={uploading}
              >
                BATALKAN
              </button>
              <button
                type="submit"
                className="flex-[2] py-5 px-6 rounded-[1.5rem] text-white font-black text-xs tracking-[0.2em] bg-indigo-600 shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex justify-center items-center gap-3 disabled:bg-slate-400 disabled:shadow-none"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    MENYIMPAN...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    SIMPAN PERUBAHAN
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UbahStatusDistribusi;