

import Sidenav from'./Component/Nav.jsx';
import TableBar from'./Component/TableBar.jsx';

const BarangDis = () => {
    return ( 
    <div className="flex h-screen">
      <Sidenav />
      <div className="flex-1 p-4 overflow-auto">
        <TableBar />
      </div>
    </div>

     );
}
 
export default BarangDis;