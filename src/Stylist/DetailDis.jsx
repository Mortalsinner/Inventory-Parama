import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from '../CreateClient';

const DetailDis = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [stokData, setStokData] = useState([]);
  const [barangMap, setBarangMap] = useState({});
  const itemsPerPage = 10;
  const { KodeStok } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      // Ambil semua barang untuk mapping foto/nama
      const { data: barangData, error: barangError } = await supabase
        .from('Barang')
        .select('idBarang, namaBarang, fotoBarang, statusBarang');
      if (barangError) return;

      // Buat map namaBarang -> data barang
      const barangMap = {};
      barangData.forEach(barang => {
        barangMap[barang.namaBarang] = barang;
      });
      setBarangMap(barangMap);

      // Ambil detail stok barang berdasarkan KodeStok
      const { data: detailData, error: detailError } = await supabase
        .from('Detail_Stok_Barang')
        .select('*')
        .eq('KodeStok', KodeStok);
      if (!detailError && detailData) {
        setStokData(detailData);
      }
    };
    fetchData();
  }, [KodeStok]);

  const filteredItems = stokData
    .map(item => ({
      ...item,
      namaBarang: item.NamaBarang,
      fotoBarang: barangMap[item.NamaBarang]?.fotoBarang || "",
      statusBarang: barangMap[item.NamaBarang]?.statusBarang || "",
      qtyBarang: item.qtyBarang
    }))
    .filter(item =>
      (item.namaBarang || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">
        {KodeStok ? `Detail Distribusi KodeStok: ${KodeStok}` : "Detail Stok Barang"}
      </h2>

      <input
        type="text"
        placeholder="Cari barang..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded bg-white"
      />

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
                <img src={item.fotoBarang || "https://via.placeholder.com/50"} alt="Barang" className="mx-auto" />
              </td>
              <td className="border border-gray-300 p-2">{item.namaBarang}</td>
              <td className="border border-gray-300 p-2 text-center">{item.qtyBarang}</td>
              <td className="border border-gray-300 p-2 text-center">{item.statusBarang}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>

      <button className="btn btn-accent mt-4 text-white"> Print to PDF</button>

      <Link to="/Distribusi">
        <button className="btn btn-error ml-4 mt-4 text-white">Back</button>
      </Link>
    </div>
  );
};

export default DetailDis;