import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

// Import File
import Sidenav from './Manager/Component/Nav';
import TableUser from './Manager/TableUser';
import AddUser from './Manager/AddUser';
import AddBarang from './Stylist/AddBarang';

function HomeManager() {
  return (
    <Router>
      <div className="flex h-screen">
        <Routes>
          <Route
            path="/*"
            element={
              <div className="flex h-screen w-full">
                <Sidenav />
                <div className="flex-1 p-4 overflow-auto lg:ml-6">

                  <Routes>
                  <Route path="/" element={<TableUser />} />
                  <Route path="/AddUser" element={<AddUser />} />
                  </Routes>

                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default HomeManager;

     
       
    
