import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from '../CreateClient';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Detail Distribusi Barang', 14, 20);
    doc.setFontSize(12);
    if (distribusi) {
      doc.text(`Nama Sekolah: ${distribusi.namaSekolah || '-'}`, 14, 30);
      doc.text(`Status Pengiriman: ${distribusi.statusPengiriman || '-'}`, 14, 38);
    }
    autoTable(doc, {
      head: [["Nama Barang", "Qty"]],
      body: stokBarang.map(item => [
        barangMap[item.idBarang]?.namaBarang || '-',
        item.qtyBarang
      ]),
      startY: 48,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    // Nama file PDF sesuai nama sekolah
    const namaSekolah = distribusi?.namaSekolah ? distribusi.namaSekolah.replace(/\s+/g, '_') : 'detail-distribusi';
    doc.save(`List_Property-${namaSekolah}.pdf`);
};

  return (
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <h2 className="text-xl font-bold mb-4">
        Detail Distribusi Barang
      </h2>
      {distribusi && (
        <div className="mb-6">
          <p><b>Nama Sekolah:</b> {distribusi.namaSekolah}</p>
          <p><b>Status Pengiriman:</b> {distribusi.statusPengiriman}</p>
        </div>
      )}
     
      <table className="w-full border-collapse border border-gray-300 text-black">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="border border-gray-300 p-2">Nama Barang</th>
            <th className="border border-gray-300 p-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {stokBarang.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-gray-300 p-2">{barangMap[item.idBarang]?.namaBarang || '-'}</td>
              <td className="border border-gray-300 p-2 text-center">{item.qtyBarang}</td>
            </tr>
          ))}
        </tbody>
      </table>

     
      <Link to="/distribusi">
        <button className="btn btn-error ml-4 mt-4 text-white">Back</button>
      </Link> &nbsp;
      <button
        onClick={handlePrintPDF}
        className="btn btn-primary ml-4 mt-4 text-white"
      >
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
        Print PDF
      </button>
    

    </div>
  );
};

export default DetailDis;