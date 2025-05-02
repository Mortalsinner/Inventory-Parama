import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

// Import File
import Sidenav from'./Stylist/Component/Nav.jsx';
import TableBar from'./Stylist/Component/TableBar.jsx';
import Distribusi from './Stylist/Distribusi.jsx';
import CreateClient from './Stylist/CreateClient.jsx';
import EditBarang from './Stylist/EditBarang.jsx';


function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidenav />
        <div className="flex-1 p-4 overflow-auto lg:ml-6">
          <Routes>
            <Route path="/" element={<TableBar />} />
            <Route path="/distribusi" element={<Distribusi />} />
            <Route path="/CreateClient" element={<CreateClient />} />
            <Route path="/EditBarang/:idBarang" element={<EditBarang />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


export default App;

     
       
    
