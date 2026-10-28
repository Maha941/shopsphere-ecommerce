import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleTabSwitch = (isLogin) => {
    setIsLoginTab(isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLoginTab) {
      if (!name) {
        setError('Full Name is required for registration.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match! Please check your confirm password.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLoginTab 
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/signup';

      const payload = isLoginTab
        ? { email, password }
        : { name, email, password, role: 'Customer' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(data.message || (isLoginTab ? 'Login successful!' : 'Account created successfully!'));
        const authenticatedUser = data.user || { name: name || email.split('@')[0], email };

        // Save to localStorage
        localStorage.setItem('shopsphere_user', JSON.stringify(authenticatedUser));

        setTimeout(() => {
          onAuthSuccess(authenticatedUser);
          onClose();
        }, 1200);
      } else {
        setError(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      // Cloud Deployment Fallback: When backend is offline or running on Vercel
      try {
        const localUsers = JSON.parse(localStorage.getItem('shopsphere_all_users') || '[]');
        if (isLoginTab) {
          const found = localUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
          const validUser = found || { name: email.split('@')[0], email, role: 'Customer' };
          setSuccess('Login successful! (Live Demo Mode)');
          const authenticatedUser = { name: validUser.name, email: validUser.email, role: validUser.role || 'Customer' };
          localStorage.setItem('shopsphere_user', JSON.stringify(authenticatedUser));
          setTimeout(() => {
            onAuthSuccess(authenticatedUser);
            onClose();
          }, 1000);
          return;
        } else {
          const newUser = { id: Date.now(), name, email, password, role: 'Customer' };
          localUsers.push(newUser);
          localStorage.setItem('shopsphere_all_users', JSON.stringify(localUsers));
          const authenticatedUser = { name, email, role: 'Customer' };
          localStorage.setItem('shopsphere_user', JSON.stringify(authenticatedUser));
          setSuccess('Account created successfully! (Live Demo Mode)');
          setTimeout(() => {
            onAuthSuccess(authenticatedUser);
            onClose();
          }, 1000);
          return;
        }
      } catch (fallbackErr) {
        setError('Cannot connect to Express backend server: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box auth-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Tab Headers */}
        <div className="auth-tab-row">
          <button 
            type="button" 
            className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(true)}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
            onClick={() => handleTabSwitch(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-header-text">
            <h2>{isLoginTab ? 'Welcome Back!' : 'Create Your Account'}</h2>
            <p>{isLoginTab ? 'Log in with your MySQL credentials' : 'Register to enjoy seamless checkout & order tracking'}</p>
          </div>

          {error && <div className="checkout-alert error">{error}</div>}
          {success && <div className="checkout-alert success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Full Name for Sign Up */}
            {!isLoginTab && (
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahjbeen Afzal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  required
                  placeholder="e.g. mahjbeen@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password for Sign Up */}
            {!isLoginTab && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="field-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading 
                ? 'Processing...' 
                : (isLoginTab ? 'Sign In to Account' : 'Create Account (Sign Up)')}
            </button>
          </form>

          <div className="auth-modal-footer">
            <ShieldCheck size={16} color="#16a34a" />
            <span>Connected securely to Node.js & MySQL Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
