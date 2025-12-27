import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { supabase } from '../CreateClient';
import Swal from 'sweetalert2';
import Logo from '.././Asset/LogParama.jpg'

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
                    // Simpan data user ke localStorage
                    localStorage.setItem('user', JSON.stringify(data));

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
                text: 'Username atau Password salah! '
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white/10 backdrop-blur-2xl p-12 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/20 transform transition-all hover:scale-[1.01] duration-500">
                    {/* Logo and Judul */}
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 mx-auto mb-8 p-1.5 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-[2rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img src={Logo} alt="Parama Logo" className="w-full h-full object-cover rounded-[1.75rem]" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight mb-3">Selamat Datang</h2>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Sistem Inventaris</p>
                            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                        </div>
                    </div>

                    {/* Form Login */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    name="Username"
                                    value={formData.Username}
                                    onChange={handleChange}
                                    placeholder="Masukan Username"
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-white placeholder-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type="Password"
                                    name="Password"
                                    value={formData.Password}
                                    onChange={handleChange}
                                    placeholder="Masukan Password"
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-bold text-white placeholder-slate-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            MASUK KE SISTEM
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                            © {new Date().getFullYear()} Parama Kreatif House<br />
                            <span className="text-indigo-500/50">Inventory Management System v2.0</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;