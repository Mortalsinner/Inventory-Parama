import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { supabase } from '../../CreateClient';
import DeleteBarang from '../DeleteBarang';
import EditBarang from '../EditBarang';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
// Update imports at the top
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const TableBar = () => {
  const navigate = useNavigate();
  const Swal = require('sweetalert2');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [barangData, setBarangData] = useState([]);
  const itemsPerPage = 10;

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
    item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const generatePDF = () => {
    try {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Inventory Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        // Generate the table
        autoTable(doc, {
            head: [["Kode", "Nama", "Kategori", "Jumlah", "Status"]],
            body: barangData.map(item => [
                item.kode_barang,
                item.namaBarang,
                item.kategori,
                item.JumlahBarang,
                item.statusBarang
            ]),
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Save the PDF
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

  return (
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">Inventory Table</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-50 mr-4 p-2 border border-gray-300 rounded bg-white"
        />
        <div className="flex gap-2">
          <Link to="/AddBarang">
            <button className="btn btn-accent text-white">+ Add Barang</button>
          </Link>
          <button 
            onClick={generatePDF}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print to PDF
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-black bg-white rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <th className="p-3 font-semibold text-sm uppercase">Foto Barang</th>
            <th className="p-3 font-semibold text-sm uppercase">Kode Barang</th>
            <th className="p-3 font-semibold text-sm uppercase">Nama Barang</th>
            <th className="p-3 font-semibold text-sm uppercase">Kategori</th>
            <th className="p-3 font-semibold text-sm uppercase">Jumlah</th>
            <th className="p-3 font-semibold text-sm uppercase">Status</th>
            <th className="p-3 font-semibold text-sm uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {displayedItems.map((item, index) => (
            <tr key={item.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <td className="p-3">
                {item.publicUrl ? (
                  <img
                    src={item.publicUrl}
                    alt={item.namaBarang}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </td>
              <td className="p-3 font-medium">{item.kode_barang}</td>
              <td className="p-3">{item.namaBarang}</td>
              <td className="p-3">
                <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{item.kategori}</span>
              </td>
              <td className="p-3 text-center font-medium">{item.JumlahBarang}</td>
              <td className="p-3 text-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.statusBarang === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.statusBarang}
                </span>
              </td>
              <td className="p-3 text-center">
                <div className="flex justify-center gap-2">
                  <Link to={`/EditBarang/${item.id}`}>
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
                      Edit
                    </button>
                  </Link>
                  <button 
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!'
                      });

                      if (result.isConfirmed) {
                        const success = await DeleteBarang(item.id);
                        if (success) {
                          setBarangData(prev => prev.filter(barang => barang.id !== item.id));
                          Swal.fire(
                            'Deleted!',
                            'Your item has been deleted.',
                            'success'
                          );
                        } else {
                          Swal.fire(
                            'Error!',
                            'Failed to delete the item.',
                            'error'
                          );
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update pagination styles */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableBar;
