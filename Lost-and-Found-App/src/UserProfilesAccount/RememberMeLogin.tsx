
// A React login form with "Remember Me" functionality using Supabase

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// This component manages login and session persistence
export default function RememberMeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Create a Supabase client with the correct storage for session persistence
  function getSupabaseClient() {
    const storage = rememberMe ? localStorage : sessionStorage;
    return createClient(supabaseUrl, supabaseKey, {
      auth: { storage }
    });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Login successful!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setMessage('Logged out.');
  };

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: '2rem auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <label>
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
          Remember Me
        </label>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      <button type="button" onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
      {message && <div style={{ marginTop: 12 }}>{message}</div>}
    </form>
  );
}
