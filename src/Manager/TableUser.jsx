import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";


const TableUser = () => {
    // Pagination
      const [currentPage, setCurrentPage] = useState(1);
      const [searchTerm, setSearchTerm] = useState("");
      const itemsPerPage = 10;
      const totalItems = 50;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
    
      const filteredItems = [...Array(totalItems)].map((_, index) => ({
        name: `Nama ${index + 1}`,
        qty: 12345,
        status: "Tersedia",
      })).filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
      const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return ( 

    // Title
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
    <h2 className="text-xl font-bold mb-4">List User</h2>

   {/* Searchbar */}
   <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-4 border border-gray-300 rounded bg-white"
      />
      <Link to="/AddUser">
      <button className="btn btn-accent mb-4 text-white"> + Tambah User</button>
      </Link>
    

    {/* Main Content */}
    <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="border border-gray-300 p-2">Username</th>
            <th className="border border-gray-300 p-2">Password</th>
            <th className="border border-gray-300 p-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {displayedItems.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{item.name}</td>
              <td className="border border-gray-300 p-2 text-center">{item.qty}</td>
              <td className="border border-gray-300 p-2 text-center">
              <button className="btn btn-soft btn-warning">Detail</button>
              </td>
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
 
export default TableUser;