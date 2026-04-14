import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password });
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      const details = err.response?.data?.details;
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => d.msg || d.message).join(', ') || msg);
      } else {
        setError(msg || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-2xl border border-white/55 bg-white/65 p-8 shadow-glass-lg backdrop-blur-xl backdrop-saturate-150">
        <h1 className="font-display text-center text-2xl font-semibold text-stone-900">Create account</h1>
        <p className="mt-2 text-center text-sm text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-sky-900 underline decoration-sky-300/80 underline-offset-2 hover:text-stone-900">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <Alert>{error}</Alert>}
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-stone-500">At least six characters — boring, but it works.</p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Spinner className="h-4 w-4" /> Creating…
              </>
            ) : (
              'Register'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
