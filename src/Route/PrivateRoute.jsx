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
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log("Session:", session);

            if (error) {
                throw error;
            }

            if (session) {
                console.log("User metadata:", session.user.user_metadata);

                // Ambil role user dari tabel User berdasarkan Username
                const { data: userData, error: userError } = await supabase
                    .from('User')
                    .select('Role')
                    .eq('Username', session.user.user_metadata.Username)
                    .maybeSingle();

                console.log("Query result userData:", userData, "userError:", userError);

                if (userError) throw userError;

                setUserRole(userData ? userData.Role : null);
                setIsAuthenticated(!!userData);
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