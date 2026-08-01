import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Admin from './pages/Admin';
import Login from './pages/Login';

function Nav() {
  const location = useLocation();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-icon">📅</span>
          CitaBook
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Inicio
          </Link>
          <Link to="/reservar" className={location.pathname === '/reservar' ? 'active' : ''}>
            Reservar
          </Link>
          <Link
            to="/admin"
            className={location.pathname.startsWith('/admin') ? 'active' : ''}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reservar" element={<Booking />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="footer">
          <p>CitaBook — Sistema de citas para negocios locales</p>
        </footer>
      </div>
    </AuthProvider>
  );
}
