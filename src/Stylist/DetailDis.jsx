import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from '../CreateClient';

const DetailDis = () => {
  const { KodeStok } = useParams(); // diasumsikan ini adalah idDetailDistribusi
  const [distribusi, setDistribusi] = useState(null);
  const [stokBarang, setStokBarang] = useState([]);
  const [barangMap, setBarangMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // Ambil data distribusi
      const { data: distribusiData, error: distribusiError } = await supabase
        .from('Distribusi_Barang')
        .select('*')
        .eq('idDetailDistribusi', KodeStok)
        .single();
      if (!distribusiError) setDistribusi(distribusiData);

      // Ambil semua barang untuk mapping namaBarang
      const { data: barangData, error: barangError } = await supabase
        .from('Barang')
        .select('idBarang, namaBarang, fotoBarang');
      if (!barangError) {
        const map = {};
        barangData.forEach(b => { map[b.idBarang] = b; });
        setBarangMap(map);
      }

      // Ambil stok barang berdasarkan idDetailDistribusi
      const { data: stokData, error: stokError } = await supabase
        .from('Stok_Barang')
        .select('*')
        .eq('idDetailDistribusi', KodeStok);
      if (!stokError) setStokBarang(stokData);
    };
    fetchData();
  }, [KodeStok]);

  return (
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">
        Detail Distribusi Barang
      </h2>
      {distribusi && (
        <div className="mb-6">
          <p><b>Nama Sekolah:</b> {distribusi.namaSekolah}</p>
          <p><b>Status Pengiriman:</b> {distribusi.statusPengiriman}</p>
          <p><b>Create By:</b> {distribusi.create_By}</p>
        </div>
      )}
      <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="border border-gray-300 p-2">Nama Barang</th>
            <th className="border border-gray-300 p-2">Foto Barang</th>
            <th className="border border-gray-300 p-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {stokBarang.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">{barangMap[item.idBarang]?.namaBarang || '-'}</td>
              <td className="border border-gray-300 p-2 text-center">
                <img src={barangMap[item.idBarang]?.fotoBarang || "https://via.placeholder.com/50"} alt="Barang" className="mx-auto" width={50} />
              </td>
              <td className="border border-gray-300 p-2 text-center">{item.qtyBarang}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/distribusi">
        <button className="btn btn-error ml-4 mt-4 text-white">Back</button>
      </Link>
    </div>
  );
};

export default DetailDis;