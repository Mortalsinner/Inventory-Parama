import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const AddBarang = () => {
    return ( 


        // Title
        <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
        <h2 className="text-xl font-bold mb-4">Insert Barang</h2>

        {/* Form */}
        <label className="input mb-4">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></g></svg>
                <input type="search" className="grow" placeholder="Masukan Nama Barang atau Props" />
            <kbd className="kbd kbd-sm">⌘</kbd>
            <kbd className="kbd kbd-sm">K</kbd>
        </label><br />

        <label className="input mb-4">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></g></svg>
            <input type="text" className="grow" placeholder="index.php" />
        </label><br />

        <label className="input mb-4">
        Path
        <input type="text" className="grow" placeholder="src/app/" />
        <span className="badge badge-neutral badge-xs">Optional</span>
        </label><br />

        <button className="btn btn-accent mb-4 text-white"> Submit</button>

        <Link to="/">
        <button className="btn btn-error mb-4 text-white ml-4"> Cancel</button>
        </Link>
    </div>


     );
}
 
export default AddBarang;