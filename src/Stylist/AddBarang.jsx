import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const AddBarang = () => {
    return ( 


        // Title
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
        <h2 className="text-xl font-bold mb-4">Insert Barang</h2>

        {/* Form */}
        <input type="file" className="file-input mb-4" /><br />

        <input type="text" placeholder="Nama Barang" className="input mb-4" /> <br />

        <input type="text" placeholder="Quantity" className="input mb-4" /> <br />
        
        <input type="text" placeholder="Type here" className="input mb-4" /> <br />
        
        
        <button className="btn btn-accent mb-4 text-white"> Submit</button>

        <Link to="/">
        <button className="btn btn-error mb-4 text-white ml-4"> Cancel</button>
        </Link>
    </div>


     );
}
 
export default AddBarang;