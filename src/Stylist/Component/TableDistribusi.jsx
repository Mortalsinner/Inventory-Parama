import { useState, useEffect } from "react";
import '../../App.css';
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../CreateClient';

const TableDistribusi = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [stokData, setStokData] = useState([]);
    const itemsPerPage = 7;

    useEffect(() => {
        fetchDistribusiBarang();
    }, []);

    const fetchDistribusiBarang = async () => {
        try {
            const { data, error } = await supabase
                .from('Distribusi_Barang')
                .select('idDetailDistribusi, namaSekolah, statusPengiriman');
            if (error) throw error;
            setStokData(data || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengambil data Distribusi Barang'
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Apakah anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('Distribusi_Barang')
                    .delete()
                    .eq('idDetailDistribusi', id);

                if (error) throw error;

                Swal.fire(
                    'Terhapus!',
                    'Data berhasil dihapus.',
                    'success'
                );
                fetchDistribusiBarang();
            } catch (error) {
                console.error('Error deleting data:', error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal menghapus data'
                });
            }
        }
    };

    const filteredItems = stokData.filter(item =>
        (item.namaSekolah || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Laporan Distribusi Barang ke Sekolah', 14, 20);
            doc.setFontSize(12);
            doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 14, 30);

            autoTable(doc, {
                head: [["Nama Sekolah", "Status Pengiriman"]],
                body: filteredItems.map(item => [
                    item.namaSekolah || "-",
                    item.statusPengiriman || "-"
                ]),
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [30, 41, 59] }, // Dark slate
                alternateRowStyles: { fillColor: [248, 250, 252] }
            });

            doc.save('laporan-distribusi.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal membuat PDF'
            });
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
                                <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Distribution</h2>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-4">Monitor and manage asset distribution to schools</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search schools..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 w-72 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <Link to="AddSekolah">
                                    <button className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm tracking-wide">
                                        <div className="p-1 bg-white/10 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        ADD SCHOOL
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
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">School Name</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Delivery Status</th>
                                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {displayedItems.length > 0 ? (
                                displayedItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                </div>
                                                <span className="font-bold text-slate-700">{item.namaSekolah}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${item.statusPengiriman === 'dikirim'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : item.statusPengiriman === 'diterima'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {item.statusPengiriman}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="dropdown dropdown-end">
                                                <button tabIndex={0} className="p-2.5 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 group-hover:border-indigo-100 cursor-pointer">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                                </button>
                                                <ul tabIndex={0} className="dropdown-content z-[20] menu p-3 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl w-60 border border-slate-100 mt-2 space-y-1">
                                                    <li className="menu-title px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">General Actions</li>
                                                    <li>
                                                        <Link to={`AddStok/${item.idDetailDistribusi}`} className="hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl py-2.5 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            <span className="text-sm font-bold">Distribute Item</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`DetailDis/${item.idDetailDistribusi}`} className="hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl py-2.5 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            <span className="text-sm font-bold">View Details</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`ubahStatusDistribusi/${item.idDetailDistribusi}`} className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl py-2.5 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                            <span className="text-sm font-bold">Update Status</span>
                                                        </Link>
                                                    </li>
                                                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                                    <li>
                                                        <button onClick={() => handleDelete(item.idDetailDistribusi)} className="hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl py-2.5 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            <span className="text-sm font-bold">Delete Entry</span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="p-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-600">No distribution data</h3>
                                            <p className="text-sm text-slate-400">There are currently no active distributions recorded.</p>
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
                        Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-bold text-slate-800">{filteredItems.length}</span> entries
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
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
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
}

export default TableDistribusi;
