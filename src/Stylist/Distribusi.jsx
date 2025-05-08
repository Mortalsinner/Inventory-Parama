import logo from '../logo.svg';
import '../App.css';
import { Routes, Route, Outlet } from "react-router-dom";
import { useEffect } from 'react';
import { supabase, testConnection } from '../CreateClient';
// Import File
import Sidenav from './Component/Nav.jsx';
import TableDistribusi from './Component/TableDistribusi.jsx';
import AddSekolah from './AddSekolah.jsx';
import AddStok from './AddStok.jsx';
import DetailDis from './DetailDis.jsx';

function Distribusi() {
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <div className="flex h-screen">
      <Sidenav />
      <div className="flex-1 p-4 overflow-auto lg:ml-6">
        <Routes>
          <Route path="/" element={<TableDistribusi />} />
          <Route path="AddSekolah" element={<AddSekolah />} />
          <Route path="AddStok/:KodeStok" element={<AddStok />} />
          <Route path="DetailDis/:KodeStok" element={<DetailDis />} />
        </Routes>
      </div>
    </div>
  );
}

export default Distribusi;

     
       
    
