import { useEffect, useState } from "react";
import { auth } from ".././../../lib/firebaseConfig"; // Ensure this points to your firebase config
import { getUserRole } from ".././../../lib/auth";    // Utility function to fetch the user's role
import { useRouter } from "next/router";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const role = await getUserRole(user.uid);
                    if (role === "admin") {
                        setIsAdmin(true);
                    } else {
                        router.push("/login"); // Redirect non-admin users to login
                    }
                } else {
                    router.push("/login"); // Redirect if not logged in
                }
            } catch (error) {
                console.error("Error checking admin role:", error);
                router.push("/login"); // Redirect on error
            } finally {
                setLoading(false);
            }
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return <div>Loading...</div>; // Loading indicator while role is being checked
    }

    if (!isAdmin) {
        return <div>Access Denied</div>; // Fallback if not an admin
    }

    return <>{children}</>; // Render the protected content if admin
};

export default AdminRoute;
