import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from '../CreateClient';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DetailDis = () => {
  const { KodeStok } = useParams(); // diasumsikan ini adalah idDetailDistribusi
  const [distribusi, setDistribusi] = useState(null);
  const [stokBarang, setStokBarang] = useState([]);
  const [barangMap, setBarangMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // Ambil data distribusi
      const { data: distribusiData, error: distribusiError } = await supabase
        .from('Distribusi_Barang')
        .select('*')
        .eq('idDetailDistribusi', KodeStok)
        .single();
      if (!distribusiError) setDistribusi(distribusiData);

      // Ambil semua barang untuk mapping namaBarang
      const { data: barangData, error: barangError } = await supabase
        .from('Barang')
        .select('idBarang, namaBarang, fotoBarang');
      if (!barangError) {
        const map = {};
        barangData.forEach(b => { map[b.idBarang] = b; });
        setBarangMap(map);
      }

      // Ambil stok barang berdasarkan idDetailDistribusi
      const { data: stokData, error: stokError } = await supabase
        .from('Stok_Barang')
        .select('*')
        .eq('idDetailDistribusi', KodeStok);

      if (!stokError) {
        // Add publicUrl to each stok item
        const enhancedStok = stokData.map(item => {
          // Find corresponding barang in the already fetched barangData
          // We can use the map we just built or find it in the array
          // Since barangData might not be in scope if I use const map, I should reuse barangData if possible.
          // Actually barangData is in scope of this function.

          const barang = barangData ? barangData.find(b => b.idBarang === item.idBarang) : null;
          let publicUrl = null;

          if (barang && barang.fotoBarang) {
            const { data } = supabase.storage
              .from('fotobarang')
              .getPublicUrl(barang.fotoBarang);
            publicUrl = data.publicUrl;
          }

          return { ...item, publicUrl };
        });
        setStokBarang(enhancedStok);
      }
    };
    fetchData();
  }, [KodeStok]);



  const getBase64FromUrl = async (url) => {
    try {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      });
    } catch (e) {
      console.error("Error converting to base64", e);
      return null;
    }
  };

  const handlePrintPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Detail Distribusi Barang', 14, 20);
    doc.setFontSize(12);
    if (distribusi) {
      doc.text(`Nama Sekolah: ${distribusi.namaSekolah || '-'}`, 14, 30);
      doc.text(`Status Pengiriman: ${distribusi.statusPengiriman || '-'}`, 14, 38);
      // Display PIC from the first item if available
      const picName = stokBarang.length > 0 ? (stokBarang[0].pic || '-') : '-';
      doc.text(`PIC: ${picName}`, 14, 46);
    }

    // Convert all images to base64
    const dataPromises = stokBarang.map(async (item) => {
      let imageBase64 = null;
      if (item.publicUrl) {
        imageBase64 = await getBase64FromUrl(item.publicUrl);
      }
      return {
        row: ['', barangMap[item.idBarang]?.namaBarang || '-', item.qtyBarang],
        image: imageBase64
      };
    });

    const results = await Promise.all(dataPromises);
    const tableBody = results.map(r => r.row);
    const tableImages = results.map(r => r.image);

    autoTable(doc, {
      head: [["Gambar", "Nama Barang", "Qty"]],
      body: tableBody,
      startY: 56, // Adjusted startY to accommodate PIC line
      styles: {
        fontSize: 10,
        valign: 'middle',
        minCellHeight: 24
      },
      headStyles: { fillColor: [17, 34, 51] }, // Darker header to match reference
      columnStyles: {
        0: { width: 30 }, // Fixed width for image column
        2: { halign: 'center' } // Center Qty
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === 'body') {
          const img = tableImages[data.row.index];
          if (img) {
            try {
              // Calculate position to center image
              const dim = 20;
              const x = data.cell.x + (data.cell.width - dim) / 2;
              const y = data.cell.y + (data.cell.height - dim) / 2;
              doc.addImage(img, 'JPEG', x, y, dim, dim);
            } catch (err) {
              console.error("Error adding image to PDF", err);
            }
          }
        }
      }
    });
    // Nama file PDF sesuai nama sekolah
    const namaSekolah = distribusi?.namaSekolah ? distribusi.namaSekolah.replace(/\s+/g, '_') : 'detail-distribusi';
    doc.save(`List_Property-${namaSekolah}.pdf`);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-indigo-600 rounded-full" />
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Detail Distribusi</h2>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{distribusi?.namaSekolah || 'Detail Jalur'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/distribusi">
              <button className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                KEMBALI KE DAFTAR
              </button>
            </Link>
            <button
              onClick={handlePrintPDF}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              CETAK LAPORAN
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/40 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tujuan/Sekolah</p>
              <p className="text-sm font-bold text-slate-700">{distribusi?.namaSekolah || '-'}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/40 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status Pengiriman</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tighter">
                {distribusi?.statusPengiriman || 'Tidak Diketahui'}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/40 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PIC / Staf</p>
              <p className="text-sm font-bold text-slate-700">{stokBarang.length > 0 ? (stokBarang[0].pic || 'Belum Ditugaskan') : 'Belum Ditugaskan'}</p>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm tracking-widest uppercase">Barang Terdistribusi</h3>
            <span className="text-[10px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
              {stokBarang.length} ASET
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400">
                <tr className="border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Visual</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Informasi Aset</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stokBarang.length > 0 ? (
                  stokBarang.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <div className="relative w-20 h-20 group-hover:scale-110 transition-transform duration-500">
                          {item.publicUrl ? (
                            <img
                              src={item.publicUrl}
                              alt="Asset"
                              className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150?text=Tanpa+Gambar";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded-2xl border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                              TANPA FOTO
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-bold text-slate-800 tracking-tight text-lg mb-1">
                          {barangMap[item.idBarang]?.namaBarang || '-'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase tracking-tighter">
                            ID: {item.idBarang}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 text-sm font-black text-slate-600 border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:scale-110 transition-all">
                          {item.qtyBarang}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-2">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <p className="font-bold text-slate-400">Belum ada barang di jalur distribusi ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DetailDis;