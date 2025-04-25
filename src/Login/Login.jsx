import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#11365b] to-blue-900">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-96 transform transition-all hover:scale-105">
                {/* Logo dan Judul */}
                <div className="text-center mb-8">
                    <img src="/LogParama.jpg" alt="Parama Logo" className="w-20 h-20 mx-auto mb-4 rounded-lg"/>
                    <h2 className="text-2xl font-bold text-[#11365b]">Welcome Back!</h2>
                    <p className="text-gray-500 text-sm">Silakan masuk ke akun Anda</p>
                </div>

                {/* Form Login */}
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            placeholder="Masukan username" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#11365b] focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input 
                            type="password" 
                            placeholder="Masukan password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#11365b] focus:border-transparent transition-all"
                        />
                    </div>

                    <button 
                        className="w-full bg-[#11365b] text-white py-2 rounded-lg hover:bg-blue-800 transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11365b]"
                    >
                        Login
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Parama Kreatif House | Inventory System
                </div>
            </div>
        </div>
    );
}
 
export default Login;