import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/user/verify-email/${token}`);
      setVerificationStatus('success');
      setMessage(response.data.message);
      toast.success('Email verified successfully!');
    } catch (error) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed');
      toast.error('Email verification failed');
    }
  };

  const resendVerification = async () => {
    navigate('/resend-verification');
  };

  return (
    <div className="auth-center">
      <div className="auth-container">
        <div className="auth-card">
          {verificationStatus === 'verifying' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="loading-spinner"></div>
              </div>
              <h1>Verifying Email</h1>
              <p style={{ color: '#666', textAlign: 'center' }}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <CheckCircle size={64} style={{ color: '#28a745' }} />
              </div>
              <h1>Email Verified!</h1>
              <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
                {message}
              </p>
              <Link to="/login" className="btn btn-primary">
                Continue to Login
              </Link>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <XCircle size={64} style={{ color: '#dc3545' }} />
              </div>
              <h1>Verification Failed</h1>
              <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
                {message}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={resendVerification}
                  className="btn btn-secondary"
                >
                  <Mail size={16} style={{ marginRight: '8px' }} />
                  Resend Verification Email
                </button>
                <Link to="/login" className="btn btn-primary">
                  <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 