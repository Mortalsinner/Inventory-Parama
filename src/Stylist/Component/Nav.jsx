import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from '../.././Asset/LogParama.jpg';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({ username: "Guest", role: "Staff" });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser({
        username: parsed.Username || "User",
        role: parsed.Role || "Staff"
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/home') {
      return location.pathname === '/home' || (location.pathname.startsWith('/home') && !location.pathname.includes('PengajuanBeli'));
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: "/home",
      label: "Daftar Barang",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      path: "/distribusi",
      label: "Distribusi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      )
    },
    {
      path: "/home/PengajuanBeli",
      label: "Pengajuan Pembelian",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex h-screen">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 p-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] focus:outline-none z-20 lg:hidden shadow-lg transition-all"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar Container */}
      <div className={`
        bg-[#0f172a]/95 backdrop-blur-xl text-slate-100 
        w-72 flex flex-col justify-between h-full fixed top-0 left-0 z-30
        transform transition-transform duration-500 ease-in-out shadow-2xl
        lg:relative lg:translate-x-0 lg:flex-shrink-0 border-r border-white/10
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Header / Logo */}
        <div className="p-8">
          <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => navigate('/home')}>
            <div className="relative">
              <img src={Logo} alt="Parama Logo" className="w-12 h-12 rounded-2xl shadow-2xl ring-2 ring-white/20 group-hover:ring-blue-500/50 transition-all duration-300 object-cover" />
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Parama</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Inventory Pro</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-white lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Navigation Links */}
          <nav className="mt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Utama</p>
            <ul className="space-y-1.5">
              {navItems.map((item) => {
                const highlight = isActive(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)} // mobile close
                      className={`
                        flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                        ${highlight
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 text-white"
                          : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
                        }
                      `}
                    >
                      <span className={`transition-all duration-300 ${highlight ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`}>
                        {item.icon}
                      </span>
                      <span className="font-semibold tracking-wide text-sm">{item.label}</span>

                      {highlight && (
                        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
                      )}

                      {!highlight && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User Profile / Footer */}
        <div className="p-6">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.05] transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xl transform group-hover:rotate-3 transition-transform">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1e293b] rounded-full shadow-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-wide">{user.username}</p>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{user.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 border border-white/5 hover:border-red-400/20 transition-all duration-300 text-xs font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              LOGOUT
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Parama</p>
          </div>
        </div>

      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}
