import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { LogIn, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-slate-200 shadow-xl p-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 mx-auto rounded-lg flex items-center justify-center mb-4">
             <div className="w-6 h-6 bg-emerald-500 rounded-sm italic font-bold text-white text-xs flex items-center justify-center">F</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase tracking-widest">FamilyLedger</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Unified House Management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold uppercase tracking-tight">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Access Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authorizing...' : 'Enter System'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
              <span className="px-2 bg-white text-slate-400">External Provider</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-6 w-full py-3 border border-slate-200 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            Continue with Identity
          </button>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          New Unit? <Link to="/register" className="text-emerald-600 hover:underline">Register New Ledger</Link>
        </p>
      </motion.div>
    </div>
  );
}
