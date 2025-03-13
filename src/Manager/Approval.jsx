const Approval = () => {

  const items = Array(5).fill({
    name: "Nama Barang",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    link: "Link barangnya",
    urgent: true
  });

    return (  
    
    // Title
    <div className="flex-1 p-4 bg-white shadow-md rounded-lg h-screen overflow-auto text-black">
      <center>
    <h2 className="text-xl font-bold mb-4">Approval</h2>
    </center>

    {/* Card */}
    <div className="flex flex-wrap gap-3 justify-center">
      {items.map((item, index) => (
        <div key={index} className="card bg-base-100 w-64 shadow-md text-sm">
          <figure className="h-32">
            <img src={item.image} alt="Barang" className="h-full object-cover" />
          </figure>
          <div className="card-body p-3">
            <h2 className="card-title text-base">{item.name}</h2>
            <p className="text-xs">{item.link}</p>
            <div className="card-actions justify-end">
              {item.urgent && <div className="badge badge-outline badge-error text-xs">Urgent</div>}
              <button className="btn btn-primary btn-sm">Sudah Dibeli</button>
            </div>
          </div>
        </div>
      ))}
</div>

    </div>
    );
}
 
export default Approval;