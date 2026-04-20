import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import Layout from '../components/Layout';
import { User, Mail, Shield, Save, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { user, familyId, role } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [familyName, setFamilyName] = useState('');
  const [income, setIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    const fetchFamily = async () => {
      const famDoc = await getDoc(doc(db, 'families', familyId));
      if (famDoc.exists()) {
        setFamilyName(famDoc.data().familyName);
        setIncome(famDoc.data().monthlyIncome.toString());
      }
    };
    fetchFamily();
  }, [familyId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        // Also update member doc
        if (familyId) {
          await updateDoc(doc(db, 'families', familyId, 'members', user.uid), {
            name: name
          });
          
          if (role === 'admin') {
            await updateDoc(doc(db, 'families', familyId), {
              familyName,
              monthlyIncome: Number(income)
            });
          }
        }
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-gray-500">Manage your account and family settings.</p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="glass-panel p-8 rounded-[40px] space-y-8">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-bold text-gray-400">
                {name[0] || '?'}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user?.displayName || 'Family Member'}</h2>
                <div className="flex items-center gap-1 justify-center text-sm text-gray-400 mt-1">
                   <Mail className="w-3 h-3" />
                   {user?.email}
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-gray-50">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold"
                      required
                    />
                  </div>
               </div>

               {role === 'admin' && (
                 <>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Family Group Name</label>
                        <input
                          type="text"
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Monthly Income Target</label>
                        <input
                          type="number"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold"
                          required
                        />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 p-4 bg-black/5 rounded-2xl">
                      <Shield className="w-5 h-5 text-black" />
                      <p className="text-xs font-medium text-gray-600">You are the Family Administrator. You can manage members and view all reports.</p>
                   </div>
                 </>
               )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-3xl font-bold text-xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                Updated Successfully
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
