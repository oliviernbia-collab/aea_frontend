import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-800 dark:text-blue-300" />
      </div>
    );
  }

  if (!user) return <Navigate to="/connexion" replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-center px-4">
        <i className="fa-solid fa-lock text-4xl text-slate-400" />
        <p className="text-slate-600 dark:text-slate-300">Vous n'avez pas les droits pour acceder a cette page.</p>
      </div>
    );
  }

  return children;
}
