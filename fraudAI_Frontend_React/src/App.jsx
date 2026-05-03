import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOutUser, onAuthChange } from './firebase/config';
import LandingPage from './pages/LandingPage';
import DatasetAnalyzer from './pages/DatasetAnalyzer';
import UPISimulator from './pages/UPISimulator';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Fallback: If auth takes too long (e.g. network issue), stop loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-800 font-sans">
        {/* Navigation */}
        <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent brand-font">
                  SafePayAI
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Home</Link>
                <Link to="/dashboard" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
                <Link to="/analyzer" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Analyzer</Link>
                <Link to="/simulator" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Simulator</Link>
                <Link to="/history" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">History</Link>
              </div>

              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-emerald-400/50" />
                    <span className="text-slate-700 font-medium text-sm hidden lg:block">{user.displayName}</span>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2 text-sm shadow-md shadow-blue-500/20"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Sign in</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/analyzer" element={<DatasetAnalyzer />} />
            <Route path="/simulator" element={<UPISimulator user={user} onLogin={handleLogin} />} />
            <Route path="/history" element={<TransactionHistory user={user} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm font-medium">
            <p>SafePayAI — Powered by XGBoost, NGBoost & SHAP</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
