import { useState } from "react";

const DetailDis = () => {
   // Pagination
     const [currentPage, setCurrentPage] = useState(1);
     const [searchTerm, setSearchTerm] = useState("");
     const itemsPerPage = 10;
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
      <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">Nama Sekolah nya</h2>

 {/* Main Content */}
      <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-900 text-white">
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
      </tbody>
      </table>


</div>

    );
}
 
export default DetailDis;