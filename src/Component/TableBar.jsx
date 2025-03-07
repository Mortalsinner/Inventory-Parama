import { useState } from "react";

const TableBar = () => {

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const totalItems = 50;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const filteredItems = [...Array(totalItems)].map((_, index) => ({
    name: `Barang ${index + 1}`,
    qty: 10,
    status: "Tersedia",
  })).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return ( 


      // Title
      <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto">
      <h2 className="text-xl font-bold mb-4">Inventory Table</h2>


      {/* Searchbar */}
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />


      {/* Main Content */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Foto Barang</th>
            <th className="border border-gray-300 p-2">Nama Barang</th>
            <th className="border border-gray-300 p-2">Qty</th>
            <th className="border border-gray-300 p-2">Status Barang</th>
          </tr>
        </thead>
        <tbody>
          {displayedItems.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2 text-center">
                <img src="https://via.placeholder.com/50" alt="Barang" className="mx-auto" />
              </td>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2 text-center">{item.qty}</td>
              <td className="border border-gray-300 p-2 text-center">{item.status}</td>
            </tr>
          ))}


        {/* Pagination */}
        </tbody>
      </table>
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