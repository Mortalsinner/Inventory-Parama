import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';

// Import File
import Sidenav from './Stylist/Component/Nav.jsx';
import TableBar from './Stylist/Component/TableBar.jsx';
import Distribusi from './Stylist/Distribusi.jsx';
import CreateClient from './Stylist/CreateClient.jsx';
import EditBarang from './Stylist/EditBarang.jsx';
import AddBarang from './Stylist/AddBarang.jsx';
import AddDistribusi from './Stylist/AddDistribusi.jsx';
import TableDistribusi from './Stylist/Component/TableDistribusi.jsx';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidenav />
        <div className="flex-1 p-4 overflow-auto lg:ml-6">
          <Routes>
            <Route path="/home/*" element={<TableBar />} />
            <Route path="/distribusi/*" element={<TableDistribusi />} />
            {/* Inventory */}
            <Route path="AddBarang" element={<AddBarang />} />
            <Route path="CreateClient" element={<CreateClient />} />
            <Route path="EditBarang/:id" element={<EditBarang />} />
            {/* Distribusi */}
            <Route path="AddDistribusi" element={<AddDistribusi />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
