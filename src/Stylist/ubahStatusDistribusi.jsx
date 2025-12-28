import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const UbahStatusDistribusi = () => {
  const { KodeStok } = useParams(); // diasumsikan ini adalah idDetailDistribusi
  const navigate = useNavigate();
  const [statusPengiriman, setStatusPengiriman] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // States for 3 different proofs
  const [photos, setPhotos] = useState({
    dikirim: null,
    diterima: null,
    kembali: null
  });
  const [photoUrls, setPhotoUrls] = useState({
    dikirim: null,
    diterima: null,
    kembali: null
  });

  useEffect(() => {
    const fetchDistribusi = async () => {
      const { data, error } = await supabase
        .from('Distribusi_Barang')
        .select('statusPengiriman, fotoBukti')
        .eq('idDetailDistribusi', KodeStok)
        .single();
      if (!error && data) {
        setStatusPengiriman(data.statusPengiriman || '');
        if (data.fotoBukti) {
          try {
            const parsed = JSON.parse(data.fotoBukti);
            setPhotoUrls({
              dikirim: parsed.dikirim || null,
              diterima: parsed.diterima || null,
              kembali: parsed.kembali || null
            });
          } catch (e) {
            // Fallback if it's still a single string URL
            setPhotoUrls(prev => ({ ...prev, dikirim: data.fotoBukti }));
          }
        }
      }
      setLoading(false);
    };
    fetchDistribusi();
  }, [KodeStok]);

  const handleFileChange = (stage, e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotos(prev => ({ ...prev, [stage]: e.target.files[0] }));
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
    let newUrls = { ...photoUrls };

    try {
      // Upload each of the 3 photos if selected
      const stages = ['dikirim', 'diterima', 'kembali'];
      for (const stage of stages) {
        if (photos[stage]) {
          const fileExt = photos[stage].name.split('.').pop();
          const fileName = `bukti_${stage}_${KodeStok}_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase
            .storage
            .from('fotobukti')
            .upload(fileName, photos[stage], { cacheControl: '3600', upsert: false });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase
            .storage
            .from('fotobukti')
            .getPublicUrl(fileName);

          newUrls[stage] = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from('Distribusi_Barang')
        .update({
          statusPengiriman,
          fotoBukti: JSON.stringify(newUrls)
        })
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
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Visual Delivery Tracker */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { id: 'dikirim', label: 'Dikirim', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_sent_icon_1766902837060.png' },
                { id: 'diterima', label: 'Sekolah', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_school_icon_1766902851401.png' },
                { id: 'kembali', label: 'Kantor', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_office_icon_1766902867559.png' }
              ].map((stage, i) => {
                const isActive = statusPengiriman === stage.id || (stage.id === 'diterima' && statusPengiriman === 'diterima');
                // Simple logic for highlighting path
                const isPrevious = (stage.id === 'dikirim' && (statusPengiriman === 'diterima' || statusPengiriman === 'kembali')) ||
                  (stage.id === 'diterima' && statusPengiriman === 'kembali');

                return (
                  <div key={stage.id} className="relative flex flex-col items-center group">
                    {i < 2 && (
                      <div className={`absolute top-10 left-[60%] w-[80%] h-1 rounded-full z-0 transition-colors duration-500 ${isPrevious ? 'bg-indigo-500' : 'bg-slate-100'}`} />
                    )}
                    <div className={`w-20 h-20 rounded-3xl z-10 flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30 scale-110' : isPrevious ? 'bg-indigo-100' : 'bg-slate-50 border border-slate-100'}`}>
                      <img src={stage.icon} alt={stage.label} className={`w-12 h-12 object-contain transition-all duration-500 ${isActive ? 'brightness-110' : 'grayscale opacity-50'}`} />
                    </div>
                    <span className={`mt-4 text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{stage.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Photo Evidence Slots */}
            <div className="space-y-8">
              <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Dokumentasi Bukti (3 Tahap)</label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'dikirim', label: 'Saat Dikirim' },
                  { id: 'diterima', label: 'Sampai Sekolah' },
                  { id: 'kembali', label: 'Kembali/Selesai' }
                ].map((slot) => (
                  <div key={slot.id} className="space-y-4">
                    <div className="relative group">
                      {photoUrls[slot.id] ? (
                        <div className="relative aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                          <img src={photoUrls[slot.id]} alt={slot.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-[9px] font-bold">GANTI FOTO</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-300 group-hover:border-indigo-200 group-hover:bg-indigo-50/30 transition-all">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-[8px] font-black uppercase tracking-tighter">BELUM ADA FOTO</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(slot.id, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{slot.label}</p>
                      {photos[slot.id] && <p className="text-[8px] text-indigo-500 font-bold mt-1 truncate px-2">{photos[slot.id].name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8 pt-6 border-t border-slate-100">
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
                    <option value="kembali">Kembali Ke Kantor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
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