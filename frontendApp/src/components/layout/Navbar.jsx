import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Home, Users, LogOut, Bell, Settings, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const Navbar = ({ user, logout }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userMenuRef = useRef(null);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <FileText size={24} style={{ marginRight: '8px' }} />
        DocManager
      </Link>

      <div className="navbar-nav">
        <Link 
          to="/dashboard" 
          className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <Home size={16} style={{ marginRight: '6px' }} />
          Dashboard
        </Link>
        
        <Link 
          to="/documents" 
          className={`nav-link ${isActive('/documents') ? 'active' : ''}`}
        >
          <FileText size={16} style={{ marginRight: '6px' }} />
          Documents
        </Link>

        <div className="user-menu">
          <button
            className="nav-link"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative' }}
          >
            <Bell size={16} style={{ marginRight: '6px' }} />
            Notifications
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              className="nav-link"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div className="user-avatar">
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span>{user?.username || 'User'}</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'white',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '200px',
                zIndex: 1000,
                padding: '8px 0'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <User size={14} style={{ color: '#666' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {user?.username || 'User'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: '#666' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {user?.email || 'No email'}
                    </span>
                    {user?.isEmailVerified ? (
                      <CheckCircle size={12} style={{ color: '#28a745' }} title="Email verified" />
                    ) : (
                      <AlertCircle size={12} style={{ color: '#ffc107' }} title="Email not verified" />
                    )}
                  </div>
                </div>
                
                <button
                  className="nav-link"
                  onClick={handleLogout}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 