import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else navigate('/');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
    // On success, Supabase will redirect automatically
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button
        onClick={handleGoogleLogin}
        className="mt-4 bg-blue-600 text-white p-2 rounded w-80"
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <div className="flex flex-col items-center mt-4 gap-2">
        <span>
          Don t have an account? <Link to="/signup" className="text-blue-600 underline">Sign up</Link>
        </span>
        <span>
          <Link to="/forgot-password" className="text-blue-600 underline">Forgot password?</Link>
        </span>
      </div>
    </div>
  );
} 