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
        fetchStok();
    }, []);

    const fetchStok = async () => {
        try {
            const { data, error } = await supabase
                .from('Stok')
                .select('namaSekolah, statusBarang, KodeStok'); // tambahkan KodeStok
            if (error) throw error;
            setStokData(data || []);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengambil data Stok'
            });
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
                head: [["Nama Sekolah", "Status"]],
                body: filteredItems.map(item => [
                    item.namaSekolah || "-",
                    item.statusBarang || "-"
                ]),
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 66, 66] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
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
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
            <h2 className="text-xl font-bold mb-4">Distribusi Barang ke Sekolah</h2>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Cari sekolah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-50 mr-4 p-2 border border-gray-300 rounded bg-white"
                />
                <div className="flex gap-2">
                    <Link to="AddSekolah">
                        <button className="btn btn-accent text-white">+ Tambah Sekolah</button>
                    </Link>
                    <button 
                        onClick={generatePDF}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Print to PDF
                    </button>
                </div>
            </div>
            <table className="w-full border-collapse text-black bg-white rounded-lg overflow-hidden shadow-lg">
                <thead>
                    <tr className="bg-[#11365b] text-white">
                        <th className="p-3 font-semibold text-sm uppercase">Nama Sekolah</th>
                        <th className="p-3 font-semibold text-sm uppercase">Status</th>
                        <th className="p-3 font-semibold text-sm uppercase">Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedItems.map((item, index) => (
                        <tr key={index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            {/* Hidden input untuk KodeStok */}
                            <input type="hidden" name="KodeStok" value={item.KodeStok} />
                            <td className="p-3">{item.namaSekolah}</td>
                            <td className="p-3 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    item.statusBarang === 'Tersedia' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {item.statusBarang}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                                {/* Detail Distribusi */}
                                <Link to={`DetailDis/${item.KodeStok}`}>
                                <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                                Detail Distribusi
                                </button>
                                </Link>&nbsp;
                                {/* Add Distribusi */}
                                <Link to="AddStok">
                                    <button className="px-4 py-2 bg-accent text-white rounded hover:bg-green-400 transition-colors">+ Distribusi</button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center items-center gap-4 mt-6">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-4 py-2 bg-[#11365b] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="bg-[#11365b] px-4 py-2 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default TableDistribusi;
