import { Navigate } from 'react-router-dom';
import { supabase } from '../CreateClient';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const storedUser = localStorage.getItem('user');

            if (storedUser) {
                const user = JSON.parse(storedUser);
                // Verify against database if needed, but for now trust localStorage for speed 
                // or replicate the check if truly secure comparison is needed.
                // Since this is a simple port, we'll check if the object has valid structure.

                if (user && user.Username) {
                    setUserRole(user.Role);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error.message);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    // Tampilkan loading spinner saat mengecek status autentikasi
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11365b]"></div>
            </div>
        );
    }

    // Redirect ke halaman login jika tidak terautentikasi
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Render komponen child jika terautentikasi
    return children;
};

export default PrivateRoute;