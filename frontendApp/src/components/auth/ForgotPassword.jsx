import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/user/forgot-password', { email, newPassword });
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update password.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Password Updated</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Your password has been updated. You can now log in with your new password.
          </p>
          <Link to="/login" className="btn btn-primary">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Enter your email and set a new password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type={showNew ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 