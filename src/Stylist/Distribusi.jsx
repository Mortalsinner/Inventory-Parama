import { useState } from "react";
import '../App.css';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import Swal from 'sweetalert2';
import autoTable from 'jspdf-autotable';

const Distribusi = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 7;
    const totalItems = 50;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const filteredItems = [...Array(totalItems)].map((_, index) => ({
        name: `Sekolah ${index + 1}`,
        qty: 10,
        status: "Tersedia",
    })).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text('Laporan Distribusi Barang ke Sekolah', 14, 20);
            doc.setFontSize(12);
            doc.text(`Tanggal: ${new Date().toLocaleDateString()}`, 14, 30);

            // Generate table
            autoTable(doc, {
                head: [["Nama Sekolah", "Jumlah Barang", "Status"]],
                body: filteredItems.map(item => [
                    item.name,
                    item.qty.toString(),
                    item.status
                ]),
                startY: 40,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 66, 66] },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            // Save PDF
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
        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white shadow-xl rounded-lg h-screen overflow-auto">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Daftar Distribusi Barang ke Sekolah</h2>

                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-50 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                    <div className="flex gap-2">
                        <Link to="/AddDistribusi">
                            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Distribusi Barang
                            </button>
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

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full border-collapse ">
                        <thead>
                            <tr className="bg-[#11365b] text-white">
                                <th className="p-3 font-semibold text-sm uppercase">Nama Sekolah</th>
                                <th className="p-3 font-semibold text-sm uppercase">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedItems.map((item, index) => (
                                <tr key={index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3 text-center">
                                        <Link to="/DetailDis">
                                            <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                                                Detail
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
                        className="px-4 py-2 bg-[#11365b] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Distribusi;
