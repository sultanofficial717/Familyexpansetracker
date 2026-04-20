import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { motion } from 'motion/react';

export default function RegisterPage() {
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!familyName.trim()) {
      setError('Family name is required');
      return;
    }
    if (!income || Number(income) <= 0) {
      setError('Monthly income must be greater than 0');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const familyId = `fam_${uid}`;

      // 1. Create Family
      await setDoc(doc(db, 'families', familyId), {
        adminUid: uid,
        familyName,
        monthlyIncome: Number(income),
        createdAt: serverTimestamp(),
      });

      // 2. Create Admin Member
      await setDoc(doc(db, 'families', familyId, 'members', uid), {
        uid,
        name: 'Family Head',
        email,
        role: 'admin',
        monthlyPocketMoney: 0,
        createdAt: serverTimestamp(),
      });

      // 3. Create User Map
      await setDoc(doc(db, 'users', uid), {
        familyId,
        role: 'admin'
      });

      console.log('Registration successful:', uid);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMsg = err.code === 'auth/email-already-in-use'
        ? 'Email already registered. Please login instead.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Use at least 6 characters.'
        : err.message;
      setError(errorMsg);
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center uppercase tracking-widest">Register New Ledger</h1>
        <p className="text-[11px] font-bold text-slate-400 text-center mt-2 mb-8 uppercase tracking-widest">Initialize Family Management unit</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold uppercase tracking-tight">Error: {error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Family Descriptor</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              placeholder="e.g. Miller Family"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Monthly Resource Target (PKR)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              placeholder="Budget Goal"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Admin Access Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition-all text-sm font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Secure Admin Password</label>
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
            className="w-full py-4 bg-slate-900 text-white text-[12px] font-bold uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Initializing...' : 'Deploy Ledger'}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Active Unit? <Link to="/login" className="text-emerald-600 hover:underline">Return to Access</Link>
        </p>
      </motion.div>
    </div>
  );
}
