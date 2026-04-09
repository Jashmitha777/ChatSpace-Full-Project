import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const initialState = { name: '', email: '', password: '' };

const AuthPage = () => {
  const { auth, login, register } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (auth?.token) {
    return <Navigate to="/chat" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSignup) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-panel auth-panel--hero">
        <h1>ChatSpace keeps teams connected across rooms and private conversations.</h1>
      </section>

      <section className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h2>{isSignup ? 'Create account' : 'Welcome back'}</h2>
          <p>{isSignup ? 'Start collaborating in a few seconds.' : 'Log in to continue chatting.'}</p>
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <label>
                Full name
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Alex Johnson"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="alex@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
              />
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
            </button>
          </form>

          <button
            className="link-button"
            type="button"
            onClick={() => {
              setIsSignup((current) => !current);
              setError('');
              setForm(initialState);
            }}
          >
            {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
