import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { FamilyMember } from '../types';
import { formatCurrency } from '../lib/utils';
import Layout from '../components/Layout';
import { Users, UserPlus, Trash2, Edit2, Check, X, Shield, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function MembersPage() {
  const { familyId, role } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', pocketMoney: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMoney, setEditMoney] = useState('');

  useEffect(() => {
    if (!familyId) return;
    const unsub = onSnapshot(collection(db, 'families', familyId, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FamilyMember)));
    });
    return unsub;
  }, [familyId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId) return;
    
    try {
      const memberId = `member_${Date.now()}`;
      await setDoc(doc(db, 'families', familyId, 'members', memberId), {
        name: newMember.name,
        email: newMember.email,
        uid: '', // To be linked on first login
        role: 'member',
        monthlyPocketMoney: Number(newMember.pocketMoney),
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewMember({ name: '', email: '', pocketMoney: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const updatePocketMoney = async (memberId: string) => {
    if (!familyId) return;
    try {
      await updateDoc(doc(db, 'families', familyId, 'members', memberId), {
        monthlyPocketMoney: Number(editMoney)
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!familyId || !confirm('Are you sure you want to remove this member?')) return;
    try {
      await deleteDoc(doc(db, 'families', familyId, 'members', memberId));
    } catch (err) {
      console.error(err);
    }
  };

  if (role !== 'admin') return <Layout><div>Access Denied</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Human Resources</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Family Members</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-emerald"
          >
            + Add Member
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, idx) => (
            <motion.div 
              key={member.id}
              layout
              className="card-density relative overflow-hidden"
            >
              {member.role === 'admin' && (
                <div className="absolute top-0 right-0 p-2 bg-slate-900 text-emerald-400 border-b border-l border-slate-800">
                  <Shield className="w-3 h-3" />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center gap-3">
                <div className={cn(
                  "w-16 h-16 border flex items-center justify-center text-2xl font-bold",
                  member.role === 'admin' ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-400"
                )}>
                   {member.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.email}</p>
                </div>

                <div className="w-full pt-4 border-t border-slate-50 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocation</span>
                    {editingId === member.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editMoney}
                          onChange={(e) => setEditMoney(e.target.value)}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-1 focus:ring-slate-900 outline-none"
                          autoFocus
                        />
                        <button onClick={() => updatePocketMoney(member.id)} className="text-emerald-600"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-red-500"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{formatCurrency(member.monthlyPocketMoney)}</span>
                        {member.role !== 'admin' && (
                          <button 
                            onClick={() => {
                              setEditingId(member.id);
                              setEditMoney(member.monthlyPocketMoney.toString());
                            }} 
                            className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {member.role !== 'admin' && (
                    <button 
                      onClick={() => removeMember(member.id)}
                      className="mt-4 w-full py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Terminate Association
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-md w-full p-8 border border-slate-200 shadow-2xl z-10"
            >
              <h2 className="text-xl font-bold uppercase tracking-widest mb-1">Onboard Member</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Assign credentials and allocation</p>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    placeholder="Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Contact Email</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    placeholder="email@domain.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Monthly Pocket Allowance</label>
                  <input
                    type="number"
                    value={newMember.pocketMoney}
                    onChange={(e) => setNewMember({...newMember, pocketMoney: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                    placeholder="Amount"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
                  >
                    Confirm Onboarding
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
