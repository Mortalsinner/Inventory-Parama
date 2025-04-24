import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { supabase } from '../../CreateClient';

const TableBar = () => {
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
        .from('Barang')  // Changed to lowercase 'barang'
        .select('*');    // First try with selecting all columns

      if (error) {
        console.error('Fetch error:', error.message);
        throw error;
      }
      
      console.log('Fetched data:', data); // Debug log
      setBarangData(data || []);
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

    return ( 


      // Title
      <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">Inventory Table</h2>





      {/* Searchbar */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded bg-white"
      />
      <Link to="/AddBarang">
      <button className="btn btn-accent mb-4 text-white"> + Add Barang</button>
      </Link>

      {/* Main Content */}
      <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-900 text-white">
          <th className="border border-gray-300 p-2">Foto Barang</th>
            <th className="border border-gray-300 p-2">Kode Barang</th>
            <th className="border border-gray-300 p-2">Nama Barang</th>
            <th className="border border-gray-300 p-2">Kategori</th>
            <th className="border border-gray-300 p-2">Jumlah</th>
            {/* <th className="border border-gray-300 p-2">Sekolah Alokasi</th> */}
            <th className="border border-gray-300 p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedItems.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-gray-300 p-2">
    {item.fotoBarang ? (
      <img 
        src={supabase.storage
          .from('fotobarang')
          .getPublicUrl(item.fotoBarang)
          .data.publicUrl
        } 
        alt={item.namaBarang}
        className="w-20 h-20 object-cover rounded"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/150?text=No+Image";
        }}
      />
    ) : (
      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
        No Image
      </div>
    )}
  </td>
              <td className="border border-gray-300 p-2">{item.kode_barang}</td>
              <td className="border border-gray-300 p-2">{item.namaBarang}</td>
              <td className="border border-gray-300 p-2">{item.kategori}</td>
              <td className="border border-gray-300 p-2 text-center">{item.JumlahBarang}</td>
              {/* <td className="border border-gray-300 p-2 text-center">{item.sekolahAlokasi}</td> */}
              <td className="border border-gray-300 p-2 text-center">{item.statusBarang}</td>
            </tr>
          ))}
        </tbody>
      </table>



        {/* Pagination */}
       
      <div className="flex justify-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-gray-300 rounded-md disabled:opacity-50"
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-3 py-1 bg-gray-300 rounded-md disabled:opacity-50"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>



     );
}
 
export default TableBar;