import { useState, useEffect } from "react";
import { supabase } from "../CreateClient";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const Approval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pengajuan_pembelian")
        .select("*, User(Username)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error.message);
      Swal.fire("Error", "Gagal mengambil data pengajuan", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

      // Filter approved requests for current month
      const monthItems = requests.filter(item => {
        const itemDate = new Date(item.created_at);
        return item.status === 'Approved' &&
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear;
      });

      if (monthItems.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Informasi',
          text: `Tidak ada pengeluaran yang disetujui pada bulan ${monthNames[currentMonth]} ${currentYear}.`
        });
        return;
      }

      const doc = new jsPDF();
      const totalExpenditure = monthItems.reduce((sum, item) => sum + (parseInt(item.harga || 0) * parseInt(item.qty || 1)), 0);

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text('LAPORAN PENGELUARAN BULANAN', 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text(`${monthNames[currentMonth]} ${currentYear}`, 105, 30, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dicetak pada: ${now.toLocaleString('id-ID')}`, 14, 40);

      // Table
      autoTable(doc, {
        startY: 45,
        head: [['No', 'Barang', 'Pemohon', 'Qty', 'Harga Satuan', 'Total']],
        body: monthItems.map((item, index) => [
          index + 1,
          item.nama_barang,
          item.User?.Username || 'Anonim',
          item.qty,
          `Rp ${parseInt(item.harga || 0).toLocaleString('id-ID')}`,
          `Rp ${(parseInt(item.harga || 0) * parseInt(item.qty || 1)).toLocaleString('id-ID')}`
        ]),
        foot: [[{ content: 'TOTAL PENGELUARAN', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: `Rp ${totalExpenditure.toLocaleString('id-ID')}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } }]],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 10 },
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right' }
        }
      });

      // Berdasarkan Bukan sekarang
      const fileName = `Laporan-Pengeluaran-${monthNames[currentMonth]}-${currentYear}.pdf`;
      doc.save(fileName);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Laporan PDF telah diunduh.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire("Error", "Gagal membuat laporan PDF", "error");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const action = newStatus === "Approved" ? "menyetujui" : "menolak";
    const result = await Swal.fire({
      title: `Apakah Anda yakin?`,
      text: `Anda akan ${action} pengajuan ini.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: newStatus === "Approved" ? "#10b981" : "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Lanjutkan!",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1e293b"
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("pengajuan_pembelian")
          .update({ status: newStatus })
          .eq("id", id);

        if (error) throw error;

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Pengajuan telah ${newStatus === "Approved" ? "disetujui" : "ditolak"}.`,
          timer: 1500,
          showConfirmButton: false
        });

        fetchRequests();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.User?.Username || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* Header section */}
      <div className="p-8 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Persetujuan Pembelian</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4">Evaluasi dan tindak lanjuti pengajuan pengadaan barang</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={generateMonthlyReport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-xs tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              EKSPOR LAPORAN
            </button>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {["Pending", "Approved", "Rejected", "All"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-400 hover:text-slate-600"
                    }`}
                >
                  {s === "Pending" ? "Menunggu" : s === "Approved" ? "Disetujui" : s === "Rejected" ? "Ditolak" : "Semua"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden h-[calc(100vh-12rem)]">
          {/* Search bar */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <div className="relative group max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari barang atau pemohon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-500 sticky top-0 z-10 backdrop-blur-md">
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Detail Pengajuan</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Jumlah</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Estimasi Harga</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 italic text-sm font-medium">Memuat pengajuan...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-slate-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada pengajuan ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <div className="mb-1">
                          <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors tracking-tight">{req.nama_barang}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg">
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-indigo-500">
                              P
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{req.User?.Username || "Anonim"}</span>
                          </div>
                          {req.Link_Pembelian && (
                            <a href={req.Link_Pembelian} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">
                              Lihat Link Referensi
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-sm font-black text-slate-800 border border-slate-100">{req.qty}</span>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-slate-600">
                        Rp {parseInt(req.harga || 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          req.status === "Rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          }`}>
                          {req.status === "Approved" ? "DISETUJUI" : req.status === "Rejected" ? "DITOLAK" : "MENUNGGU"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {req.status === "Pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Approved")}
                              className="p-3 bg-white text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
                              title="Setujui"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, "Rejected")}
                              className="p-3 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-sm border border-slate-100 transition-all active:scale-95"
                              title="Tolak"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sudah Dinilai</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Approval;