import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import axios from 'axios';
import '@/modules/auth/Auth.css';
import ThangkaImage from '/register-page.jpg'; // Using a different premium asset for variety

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    country: 'Nepal',
    zipCode: '',
    phone: ''
  });
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.post('/api/users/send-otp', {
        email: formData.email,
        firstName: formData.firstName
      });
      setStep(2);
      setSuccessMessage(`Verification code sent to ${formData.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    const registerData = {
      ...formData,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        phone: formData.phone
      },
      otp
    };

    try {
      const response = await axios.post('/api/users/register', registerData);
      login(response.data, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-screen-container">
      <div className="split-image-side">
        <img src={ThangkaImage} alt="Sacred Thangka Art" />
        <div className="split-image-overlay"></div>
      </div>

      <div className="split-form-side">
        <div className="form-card-container reveal active">
          <div className="form-header">
            <h1 className="garamond">{step === 1 ? 'Join ZhenKala' : 'Verification Required'}</h1>
            <p>{step === 1 ? 'Begin your journey through Himalayan sacred art.' : 'We\'ve sent a 6-digit code to your email.'}</p>
          </div>

          {error && <div className="error-message-box">{error}</div>}
          {successMessage && !error && <div className="success-message-box">{successMessage}</div>}

          {step === 1 ? (
            <form className="auth-form" onSubmit={handleSendOTP}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="form-control"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="form-control"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  className="form-control"
                  placeholder="123 Sacred Path"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    className="form-control"
                    placeholder="Kathmandu"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State / Province</label>
                  <input
                    type="text"
                    id="state"
                    className="form-control"
                    placeholder="Bagmati"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    className="form-control"
                    placeholder="44600"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    className="form-control"
                    placeholder="Nepal"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-control"
                  placeholder="+977 1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-form-primary" disabled={isLoading}>
                {isLoading ? 'Verifying email...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <div className="verification-container">
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="otp-input-wrapper">
                  <label htmlFor="otp">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    id="otp"
                    maxLength="6"
                    placeholder="000000"
                    className="otp-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>

                <button type="submit" className="btn-form-primary" disabled={isLoading}>
                  {isLoading ? 'Finalizing...' : 'Create My Account'}
                </button>
              </form>

              <div className="otp-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Edit Registration Details
                </button>
                <button
                  type="button"
                  className="btn-resend"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
