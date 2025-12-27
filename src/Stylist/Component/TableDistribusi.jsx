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
                                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Distribusi</h2>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-4">Pantau dan kelola distribusi aset ke sekolah-sekolah</p>
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
                                    placeholder="Cari sekolah..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 w-72 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <Link to="AddSekolah">
                                    <button className="px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl hover:shadow-xl hover:shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm tracking-wide">
                                        <div className="p-1 bg-white/10 rounded-lg">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                        TAMBAH SEKOLAH
                                    </button>
                                </Link>

                                <button
                                    onClick={generatePDF}
                                    className="px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 flex items-center gap-2.5 font-bold text-sm tracking-wide"
                                >
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    EKSPOR
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
                                <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em]">Nama Sekolah</th>
                                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-center">Status Pengiriman</th>
                                <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {displayedItems.length > 0 ? (
                                displayedItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 ring-1 ring-indigo-100/50">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                </div>
                                                <span className="font-bold text-slate-800 tracking-tight text-lg">{item.namaSekolah}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`inline-flex px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.1em] border ${item.statusPengiriman === 'dikirim'
                                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                : item.statusPengiriman === 'diterima'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {item.statusPengiriman}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="dropdown dropdown-end">
                                                <button tabIndex={0} className="p-3 bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 group-hover:border-indigo-100 cursor-pointer active:scale-90">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                                </button>
                                                <ul tabIndex={0} className="dropdown-content z-[20] menu p-4 shadow-2xl bg-white/95 backdrop-blur-xl rounded-[1.5rem] w-64 border border-slate-100 mt-2 space-y-1.5 transform origin-top-right transition-all">
                                                    <li className="menu-title px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Manajemen Data</li>
                                                    <li>
                                                        <Link to={`AddStok/${item.idDetailDistribusi}`} className="hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl py-3 px-4 transition-colors flex items-center gap-3">
                                                            <div className="p-1.5 bg-indigo-100/50 rounded-lg text-indigo-600">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            </div>
                                                            <span className="text-sm font-bold">Distribusikan Barang</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`DetailDis/${item.idDetailDistribusi}`} className="hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl py-3 px-4 transition-colors flex items-center gap-3">
                                                            <div className="p-1.5 bg-blue-100/50 rounded-lg text-blue-600">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </div>
                                                            <span className="text-sm font-bold">Lihat Inventaris</span>
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to={`ubahStatusDistribusi/${item.idDetailDistribusi}`} className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl py-3 px-4 transition-colors flex items-center gap-3">
                                                            <div className="p-1.5 bg-emerald-100/50 rounded-lg text-emerald-600">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </div>
                                                            <span className="text-sm font-bold">Ubah Status</span>
                                                        </Link>
                                                    </li>
                                                    <div className="h-px bg-slate-100 my-1 mx-2"></div>
                                                    <li>
                                                        <button onClick={() => handleDelete(item.idDetailDistribusi)} className="hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl py-3 px-4 transition-colors flex items-center gap-3">
                                                            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </div>
                                                            <span className="text-sm font-bold">Hapus Data</span>
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
                                            <h3 className="text-lg font-bold text-slate-600">Tidak ada data distribusi</h3>
                                            <p className="text-sm text-slate-400">Saat ini tidak ada data distribusi aktif yang tercatat.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-800">
                            Menampilkan <span className="text-indigo-600">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="text-indigo-600">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span>
                        </p>
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                            Total Data: {filteredItems.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-6 py-3 border border-slate-200 rounded-2xl text-[10px] font-black tracking-[0.15em] text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                        >
                            SEBELUMNYA
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    return page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                })
                                .map((page, index, array) => {
                                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                    return (
                                        <div key={page} className="flex items-center gap-2">
                                            {showEllipsis && <span className="text-slate-300 font-bold px-1">...</span>}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-11 h-11 rounded-2xl text-sm font-black transition-all transform hover:scale-105 active:scale-90 ${currentPage === page
                                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'
                                                    : 'text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-100'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black tracking-[0.15em] hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                        >
                            SELANJUTNYA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TableDistribusi;
