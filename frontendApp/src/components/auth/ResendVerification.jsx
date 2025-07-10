import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/user/resend-verification', { email });
      toast.success(response.data.message);
      
      // Show verification link for development (remove in production)
      if (response.data.verificationLink) {
        console.log('Verification link:', response.data.verificationLink);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification email';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-center">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Resend Verification Email</h1>
          <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
            Enter your email address to receive a new verification link
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
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
    </div>
  );
};

export default ResendVerification; 