import { useState } from "react";

const TableBar = () => {
    return ( 

        <div className="ml-10 mr-7 p-5 bg-white shadow-md rounded-lg mt-8">
        <h2 className="text-xl font-bold mb-4">Inventory Table</h2>
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
            <tr>
              <td className="border border-gray-300 p-2 text-center">
                <img src="https://via.placeholder.com/50" alt="Barang" className="mx-auto" />
              </td>
              <td className="border border-gray-300 p-2">Barang Contoh</td>
              <td className="border border-gray-300 p-2 text-center">10</td>
              <td className="border border-gray-300 p-2 text-center">Tersedia</td>
            </tr>
          </tbody>
        </table>
      </div>


     );
}
 
export default TableBar;