import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHostLoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
        const { data, error } = await supabase
          .from('users')
          .select('id, is_admin, role')
          .eq('username', email)
          .eq('password_hash', hex)
          .single();
        if (error || !data || !(data.is_admin || data.role === 'admin')) {
          setError('Invalid admin credentials');
          return;
        }
        // minimal local session
        localStorage.setItem('adminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Signup disabled. Contact administrator.');
      }
    } catch (err:any) {
      setError(err.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Host/Admin Login' : 'Host/Admin Signup'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">{mode === 'login' ? 'Login' : 'Create Account'}</Button>
          </form>
          {/* Google login removed for admin */}
          <button className="text-xs text-muted-foreground mt-3" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
          </button>
          <p className="text-xs text-muted-foreground mt-4">Use this page to login as a host/admin. Customer logins remain available on the standard Login/Signup pages.</p>
        </CardContent>
      </Card>
    </div>
  );
}


