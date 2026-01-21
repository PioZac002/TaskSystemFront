import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading, initialized } = useAuthStore();

    if (! initialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Verifying session... </p>
                </div>
            </div>
        );
    }

    if (! isAuthenticated) {
        console.log('❌ [ProtectedRoute] Not authenticated, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;