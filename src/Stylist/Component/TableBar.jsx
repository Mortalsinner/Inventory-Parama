import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '../../CreateClient';
import DeleteBarang from '../DeleteBarang';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const TableBar = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [barangData, setBarangData] = useState([]);
  const itemsPerPage = 8; // Reduced slightly to fit better with larger rows

  useEffect(() => {
    fetchBarang();
  }, []);

  async function fetchBarang() {
    try {
      const { data, error } = await supabase
        .from('Barang')
        .select('*');

      if (error) throw error;

      const updatedData = data.map(item => {
        const publicUrl = item.fotoBarang
          ? supabase
            .storage
            .from('fotobarang')
            .getPublicUrl(item.fotoBarang).data.publicUrl
          : null;
        return { ...item, publicUrl };
      });

      setBarangData(updatedData || []);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  const filteredItems = barangData.filter(item =>
    item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.idBarang.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Inventory Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        head: [["Kode", "Nama", "Kategori", "Jumlah", "Status"]],
        body: barangData.map(item => [
          item.idBarang,
          item.namaBarang,
          item.kategori,
          item.JumlahBarang,
          item.statusBarang
        ]),
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 41, 59] } // Dark slate
      });

      doc.save('inventory-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate PDF'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const success = await DeleteBarang(id);
      if (success) {
        setBarangData(prev => prev.filter(barang => barang.idBarang !== id));
        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
      } else {
        Swal.fire('Error!', 'Failed to delete the item.', 'error');
      }
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 h-screen overflow-hidden flex flex-col">

      {/* Card Container */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full overflow-hidden">

        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory List</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium ml-4">Manage and track your inventory assets with precision</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search items by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-3.5 w-72 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link to="AddBarang">
                  <button className="px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm tracking-wide">
                    <div className="p-1 bg-white/10 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    ADD ITEM
                  </button>
                </Link>

                <button
                  onClick={generatePDF}
                  className="px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm tracking-wide"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  EXPORT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-500 sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] w-28">Preview</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Code</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Asset Name</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Stock</th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedItems.length > 0 ? (
                displayedItems.map((item, index) => (
                  <tr key={item.idBarang} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-8 py-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-slate-100 group-hover:ring-blue-200 transition-all duration-500 transform group-hover:scale-105">
                        {item.publicUrl ? (
                          <img
                            src={item.publicUrl}
                            alt={item.namaBarang}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150?text=No+Img";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                            <svg className="w-6 h-6 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 tracking-wider">#{item.idBarang}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{item.namaBarang}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.kategori === 'Gear' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                        <span className="text-sm font-semibold text-slate-600">
                          {item.kategori}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shadow-sm ${item.JumlahBarang < 5
                          ? 'bg-red-50 text-red-600 ring-1 ring-red-100'
                          : 'bg-green-50 text-green-600 ring-1 ring-green-100'
                        }`}>
                        {item.JumlahBarang}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${item.statusBarang === 'Normal'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {item.statusBarang}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <Link to={`/home/EditBarang/${item.idBarang}`}>
                          <button className="p-2.5 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all duration-300 active:scale-90" title="Edit">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.idBarang)}
                          className="p-2.5 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all duration-300 active:scale-90"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-600">No assets found</h3>
                      <p className="text-sm text-slate-400 max-w-xs mx-auto">We couldn't find any items matching your search criteria. Try a different keyword.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-bold text-slate-800">{filteredItems.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            >
              PREVIOUS
            </button>
            <div className="flex items-center gap-1.5 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableBar;
