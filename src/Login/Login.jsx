import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Username: '',
        Password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const { data, error } = await supabase
                .from('User')
                .select('*')
                .eq('Username', formData.Username)
                .eq('Password', formData.Password)
                .single();

            if (error) throw error;

            if (data) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: 'Selamat datang kembali!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    // Tambahkan console log untuk membaca session token
                    supabase.auth.getSession().then(({ data: sessionData }) => {
                        console.log('Session token:', sessionData?.session?.access_token);
                    });

                    // Arahkan ke halaman yang sesuai berdasarkan role
                    if (data.Role === 'Admin') {
                        navigate('/manager');
                    } else {
                        navigate('/home');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: 'Username atau Password salah!'
                });
            }
        } catch (error) {
            console.error('Error:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan saat login: ' + error.message
            });
        }
    };

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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input 
                            type="text" 
                            name="Username"
                            value={formData.Username}
                            onChange={handleChange}
                            placeholder="Masukan Username" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#11365b] focus:border-transparent transition-all"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input 
                            type="Password" 
                            name="Password"
                            value={formData.Password}
                            onChange={handleChange}
                            placeholder="Masukan Password" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#11365b] focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
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