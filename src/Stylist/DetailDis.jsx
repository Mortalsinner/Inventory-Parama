import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from '../CreateClient';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from 'sweetalert2';

const DetailDis = () => {
  const { KodeStok } = useParams(); // diasumsikan ini adalah idDetailDistribusi
  const [distribusi, setDistribusi] = useState(null);
  const [stokBarang, setStokBarang] = useState([]);
  const [missingItems, setMissingItems] = useState([]);
  const [barangMap, setBarangMap] = useState({});

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
      .select('idBarang, namaBarang, fotoBarang, JumlahBarang');
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

    // Ambil data barang hilang
    const { data: missingData, error: missingError } = await supabase
      .from('Barang_Hilang')
      .select('*')
      .eq('idDetailDistribusi', KodeStok);

    if (!missingError) {
      setMissingItems(missingData);
    }
  };

  useEffect(() => {
    fetchData();
  }, [KodeStok]);

  const handleReportMissing = async (item) => {
    const barangName = barangMap[item.idBarang]?.namaBarang || 'barang';
    const beforeQty = item.qtyBarang;

    const { value: formValues } = await Swal.fire({
      title: 'Lapor Barang Hilang',
      html: `
        <div class="text-left space-y-4 p-2">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <span class="text-[10px] font-black uppercase text-slate-400">Nama Barang</span>
            <span class="text-sm font-bold text-slate-700">${barangName}</span>
          </div>
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <span class="text-[10px] font-black uppercase text-slate-400">Jumlah Sebelum</span>
            <span class="text-sm font-black text-indigo-600">${beforeQty} Unit</span>
          </div>
          <div class="py-2">
            <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Jumlah Hilang</label>
            <input id="swal-input-missing" type="number" class="swal2-input !m-0 !w-full" placeholder="Ketik jumlah..." min="1" max="${beforeQty}">
          </div>
          <div class="py-2">
            <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Alasan Kehilangan</label>
            <textarea id="swal-input-reason" class="swal2-textarea !m-0 !w-full !h-24" placeholder="Masukkan alasan..."></textarea>
          </div>
          <div id="after-summary" class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 transition-all">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black uppercase text-indigo-400">Total Hilang (Record)</span>
              <span id="after-qty" class="text-sm font-black text-indigo-600">0 Unit</span>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Laporkan',
      cancelButtonText: 'Batal',
      didOpen: () => {
        const input = document.getElementById('swal-input-missing');
        const afterQtySpan = document.getElementById('after-qty');
        const summaryBox = document.getElementById('after-summary');

        input.addEventListener('input', (e) => {
          const missingValue = parseInt(e.target.value) || 0;
          const afterValue = beforeQty - missingValue;

          if (missingValue > 0 && missingValue <= beforeQty) {
            afterQtySpan.textContent = `${missingValue} Unit`;
            afterQtySpan.className = 'text-sm font-black text-rose-600';
            summaryBox.className = 'bg-rose-50 p-4 rounded-2xl border border-rose-100 transition-all opacity-100';
          } else {
            afterQtySpan.textContent = `0 Unit`;
            afterQtySpan.className = 'text-sm font-black text-slate-400';
            summaryBox.className = 'bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all opacity-50';
          }
        });
      },
      preConfirm: () => {
        const missingQty = parseInt(document.getElementById('swal-input-missing').value);
        const reason = document.getElementById('swal-input-reason').value;

        if (!missingQty || missingQty <= 0) {
          Swal.showValidationMessage('Jumlah harus lebih dari 0!');
          return false;
        }
        if (missingQty > beforeQty) {
          Swal.showValidationMessage(`Jumlah hilang tidak boleh melebihi ${beforeQty}!`);
          return false;
        }
        if (!reason) {
          Swal.showValidationMessage('Alasan kehilangan wajib diisi!');
          return false;
        }
        return { missingQty, reason };
      }
    });

    if (formValues) {
      try {
        const { missingQty: qtyToSubtract, reason } = formValues;

        // 1. Record to Barang_Hilang table
        const { error: insertError } = await supabase
          .from('Barang_Hilang')
          .insert([{
            idBarang: item.idBarang,
            idDetailDistribusi: parseInt(KodeStok),
            jumlahHilang: qtyToSubtract,
            alasan: reason,
            pic: item.pic || '-',
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Laporan dicatat sebagai record. Stok distribusi tetap sesuai data awal.`,
          timer: 2000,
          showConfirmButton: false
        });

        fetchData();
      } catch (error) {
        console.error('Error reporting missing item:', error);
        Swal.fire('Error', 'Gagal melaporkan barang hilang: ' + error.message, 'error');
      }
    }
  };



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
      const missingQty = missingItems
        .filter(mi => mi.idBarang === item.idBarang && mi.pic === item.pic)
        .reduce((sum, mi) => sum + mi.jumlahHilang, 0);

      return {
        row: ['', barangMap[item.idBarang]?.namaBarang || '-', item.qtyBarang, missingQty],
        image: imageBase64
      };
    });

    const results = await Promise.all(dataPromises);
    const tableBody = results.map(r => r.row);
    const tableImages = results.map(r => r.image);

    autoTable(doc, {
      head: [["Gambar", "Nama Barang", "Qty", "Barang Hilang"]],
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

        {/* Info Card Summary */}
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status Saat Ini</p>
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

        {/* Delivery Evidence Section */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/40 mb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Dokumentasi Bukti Pengiriman</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'dikirim', label: 'Barang Dikirim', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_sent_icon_1766902837060.png' },
              { id: 'diterima', label: 'Sampai Sekolah', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_school_icon_1766902851401.png' },
              { id: 'kembali', label: 'Kembali Ke Kantor', icon: '/Users/carlo/.gemini/antigravity/brain/a8357e54-3320-4849-96fb-ba891d1039f9/delivery_office_icon_1766902867559.png' }
            ].map((stage) => {
              let photoUrl = null;
              if (distribusi?.fotoBukti) {
                try {
                  const parsed = JSON.parse(distribusi.fotoBukti);
                  photoUrl = parsed[stage.id];
                } catch (e) {
                  // Compatibility for old string format
                  if (stage.id === 'dikirim') photoUrl = distribusi.fotoBukti;
                }
              }

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className="relative w-full aspect-square rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-4">
                    {photoUrl ? (
                      <img src={photoUrl} alt={stage.label} className="w-full h-full object-cover rounded-[2rem] shadow-lg border-2 border-white" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <img src={stage.icon} alt="Icon" className="w-16 h-16 grayscale" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Belum Ada Bukti</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stage.label}</span>
                    {photoUrl && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-tighter border border-emerald-100">TERSEDIA</span>}
                  </div>
                </div>
              );
            })}
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
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Barang Hilang</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Aksi</th>
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
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] h-12 px-4 rounded-2xl text-sm font-black border transition-all ${missingItems.filter(mi => mi.idBarang === item.idBarang && mi.pic === item.pic).length > 0
                          ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                          }`}>
                          {missingItems
                            .filter(mi => mi.idBarang === item.idBarang && mi.pic === item.pic)
                            .reduce((sum, mi) => sum + mi.jumlahHilang, 0)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleReportMissing(item)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-100 shadow-sm"
                        >
                          Lapor Hilang
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-24 text-center">
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

        {/* Missing Items Section */}
        {missingItems.length > 0 && (
          <div className="mt-12 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-rose-100 overflow-hidden">
            <div className="p-8 border-b border-rose-50 bg-rose-50/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                <h3 className="font-black text-rose-800 text-sm tracking-widest uppercase">Barang Dilaporkan Hilang</h3>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-rose-100 text-rose-600 rounded-full border border-rose-200">
                {missingItems.length} LAPORAN
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-rose-50/30 text-rose-400">
                  <tr className="border-b border-rose-50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Nama Barang</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-center">Jumlah</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Alasan</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">PIC</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                  {missingItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/50 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-800 tracking-tight">
                          {barangMap[item.idBarang]?.namaBarang || '-'}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID: {item.idBarang}</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="inline-flex items-center justify-center px-4 py-1 rounded-xl bg-rose-50 text-rose-600 text-xs font-black border border-rose-100">
                          {item.jumlahHilang} Unit
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-slate-600 max-w-xs">{item.alasan || '-'}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-bold text-slate-700">{item.pic || '-'}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                          {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default DetailDis;