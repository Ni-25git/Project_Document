import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await api.post('/user/register', registerData);
      // Automatically log in after registration
      const loginRes = await api.post('/user/login', {
        email: registerData.email,
        password: registerData.password
      });
      const { token, loginUser } = loginRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loginUser));
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-center">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Join us and start managing your documents
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '20px' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-links">
            <span style={{ color: '#666' }}>Already have an account? </span>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 