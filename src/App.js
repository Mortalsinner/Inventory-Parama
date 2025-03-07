import logo from './logo.svg';
import './App.css';
import Sidenav from'./Component/Nav.jsx';
import TableBar from'./Component/TableBar.jsx';


function App() {
  return (
    <div className="flex h-screen">
      <Sidenav />
      <div className="flex-1 p-4 overflow-auto">
        <TableBar />
      </div>
    </div>
  );
}

export default App;
