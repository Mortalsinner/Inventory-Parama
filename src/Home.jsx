import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useEffect } from 'react';
import { supabase, testConnection } from './CreateClient';
// Import File
import Sidenav from'./Stylist/Component/Nav.jsx';
import TableBar from'./Stylist/Component/TableBar.jsx';
import Distribusi from './Stylist/Distribusi.jsx';
import AddBarang from './Stylist/AddBarang.jsx';
import AddDistribusi from './Stylist/AddDistribusi.jsx';
import DetailDis from './Stylist/DetailDis.jsx';
import EditBarang from './Stylist/EditBarang.jsx';

function Home() {
  useEffect(() => {
    testConnection();
  }, []);
  
  return (
    <div className="flex h-screen">
      <Routes>
        <Route
          path="/*"
          element={
            <div className="flex h-screen w-full">
              <Sidenav />
              <div className="flex-1 p-4 overflow-auto lg:ml-6">
                <Routes>
                  <Route path="/" element={<TableBar />} />
                  <Route path="/home/distribusi" element={<Distribusi />} />
                  <Route path="home/AddBarang" element={<AddBarang />} />
                  <Route path="home/AddDistribusi" element={<AddDistribusi />} />
                  <Route path="home/DetailDis" element={<DetailDis />} />
                  <Route path="home/EditBarang/:id" element={<EditBarang />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default Home;

     
       
    
