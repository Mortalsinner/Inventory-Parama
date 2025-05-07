import logo from './logo.svg';
import './App.css';
import { Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { supabase, testConnection } from './CreateClient';
// Import File
import Sidenav from './Stylist/Component/Nav.jsx';
import TableBar from './Stylist/Component/TableBar.jsx';
import AddSekolah from './Stylist/AddSekolah.jsx';
import AddBarang from './Stylist/AddBarang.jsx';
import DetailDis from './Stylist/DetailDis.jsx';
import EditBarang from './Stylist/EditBarang.jsx';

function Home() {
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <div className="flex h-screen">
      <Sidenav />
      <div className="flex-1 p-4 overflow-auto lg:ml-6">
        <Routes>
          <Route path="/" element={<TableBar />} />
          <Route path="AddBarang" element={<AddBarang />} />
          <Route path="AddSekolah" element={<AddSekolah />} />
          <Route path="DetailDis" element={<DetailDis />} />
          <Route path="EditBarang/:idBarang" element={<EditBarang />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;

     
       
    
