import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import DocumentEditor from './components/documents/DocumentEditor';
import DocumentList from './components/documents/DocumentList';
import Navbar from './components/layout/Navbar';
import ChangePassword from './components/dashboard/ChangePassword';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        {user && <Navbar user={user} logout={logout} />}
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login login={login} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/documents" element={user ? <DocumentList user={user} /> : <Navigate to="/login" />} />
            <Route path="/document/:id" element={user ? <DocumentEditor user={user} /> : <Navigate to="/login" />} />
            <Route path="/document/new" element={user ? <DocumentEditor user={user} /> : <Navigate to="/login" />} />
            <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
