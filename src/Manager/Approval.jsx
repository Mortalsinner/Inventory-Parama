const Approval = () => {
    return (  
    
    // Title
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
    <h2 className="text-xl font-bold mb-4">Approval</h2>


    {/* Card */}
    <div className="card bg-base-100 w-96 shadow-sm">
    <figure>
    <img
      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
      alt="Shoes" />
    </figure>
    <div className="card-body">
        <h2 className="card-title">Nama Barang</h2>
        <p>Link barangnya</p>
        <div className="card-actions justify-end">
        <div className="badge badge-outline">Status barangnya</div>
        <button className="btn btn-primary">Buy Now</button>
        </div>
  </div>
</div>


    </div>
    );
}
 
export default Approval;