import { useState, useEffect } from "react";
import { supabase } from "../CreateClient";
import Swal from "sweetalert2";

const TableUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    Username: "",
    Password: "",
    Role: "Admin",
    id: null
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .order("Username", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      Swal.fire("Error", "Gagal mengambil data user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({
        Username: user.Username,
        Password: user.Password,
        Role: user.Role || "Admin",
        id: user.iduser
      });
      setIsEditing(true);
    } else {
      setFormData({ Username: "", Password: "", Role: "Admin", id: null });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("User")
          .update({
            Username: formData.Username,
            Password: formData.Password,
            Role: formData.Role
          })
          .eq("id", formData.id);
        if (error) throw error;
        Swal.fire("Berhasil", "Data user berhasil diperbarui", "success");
      } else {
        const { error } = await supabase
          .from("User")
          .insert([{
            Username: formData.Username,
            Password: formData.Password,
            Role: formData.Role
          }]);
        if (error) throw error;
        Swal.fire("Berhasil", "User baru berhasil ditambahkan", "success");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error.message);
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: `User ${user.Username} akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#fff",
      color: "#1e293b"
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from("User")
          .delete()
          .eq("iduser", user.iduser);
        if (error) throw error;
        Swal.fire("Terhapus!", "User telah dihapus.", "success");
        fetchUsers();
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const filteredUsers = users.filter((u) =>
    u.Username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex-1 bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* Header section */}
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Manajemen User</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium ml-4">Kelola akses dan akun sistem inventaris Anda</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/20 active:scale-95"
          >
            <div className="p-1 bg-white/10 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            TAMBAH USER
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden h-[calc(100vh-14rem)]">
          {/* Search and Filters */}
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <div className="relative group max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Cari username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-500 sticky top-0 z-10 backdrop-blur-md">
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Username</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Password</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic">
                      Memuat data user...
                    </td>
                  </tr>
                ) : displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic">
                      Tidak ada user ditemukan.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((u) => (
                    <tr key={u.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                      <td className="px-8 py-5">
                        <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{u.Username}</div>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-mono text-xs">{u.Password}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${u.Role === 'Admin'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {u.Role || 'User'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="p-2.5 rounded-xl bg-white text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-slate-100 shadow-sm active:scale-90"
                            title="Edit User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-2.5 rounded-xl bg-white text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-slate-100 shadow-sm active:scale-90"
                            title="Hapus User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Halaman <span className="text-slate-800">{currentPage}</span> dari <span className="text-slate-800">{totalPages || 1}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded-xl bg-white text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors border border-indigo-500 shadow-lg shadow-indigo-600/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white border border-slate-100 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] overflow-hidden p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
              <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {isEditing ? "Perbarui User" : "Tambah User"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Username</label>
                <input
                  type="text"
                  value={formData.Username}
                  onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 uppercase placeholder-slate-300"
                  placeholder="MASUKAN USERNAME"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Password</label>
                <input
                  type="text"
                  value={formData.Password}
                  onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                  required
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder-slate-300"
                  placeholder="Masukan Password"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-[0.2em] mb-2.5 ml-1">Role</label>
                <div className="relative">
                  <select
                    value={formData.Role}
                    onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Stylist">Stylist</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl font-bold text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  {isEditing ? "SIMPAN PERUBAHAN" : "TAMBAH USER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableUser;