import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { Family, FamilyMember, Expense } from '../types';
import Layout from '../components/Layout';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Plus, 
  ChevronRight,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, familyId, role } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    remainingBudget: 0,
  });

  useEffect(() => {
    if (!familyId) return;

    // Fetch Family
    const unsubFamily = onSnapshot(doc(db, 'families', familyId), (doc) => {
      if (doc.exists()) setFamily({ id: doc.id, ...doc.data() } as Family);
    });

    // Fetch Members
    const unsubMembers = onSnapshot(collection(db, 'families', familyId, 'members'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FamilyMember));
      setMembers(docs);
    });

    // Fetch recent expenses
    const expQuery = query(
      collection(db, 'families', familyId, 'expenses'),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubExpenses = onSnapshot(expQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
      setRecentExpenses(docs);
      
      const total = docs.reduce((acc, curr) => acc + curr.amount, 0);
      setStats(prev => ({ ...prev, totalSpent: total }));
    });

    return () => {
      unsubFamily();
      unsubMembers();
      unsubExpenses();
    };
  }, [familyId]);

  const budgetProgress = family ? (stats.totalSpent / family.monthlyIncome) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
            </p>
            <h2 className="text-2xl font-bold text-slate-800">{family?.familyName || 'Family'} Ledger</h2>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/add-expense"
              className="btn-emerald"
            >
              + Add Expense
            </Link>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-density">
            <div className="label-density">Monthly Income</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(family?.monthlyIncome || 0)}
            </div>
            <div className="mt-1 text-[10px] text-emerald-600 font-bold tracking-tight">Active Plan</div>
          </div>

          <div className="card-density">
            <div className="label-density">Total Spent</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalSpent)}
            </div>
            <div className="mt-1 text-[10px] text-slate-400">
              {family ? ((stats.totalSpent / family.monthlyIncome) * 100).toFixed(1) : 0}% of budget used
            </div>
          </div>

          <div className="card-density">
            <div className="label-density">Remaining</div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency((family?.monthlyIncome || 0) - stats.totalSpent)}
            </div>
            <div className="mt-1 text-[10px] text-slate-400 font-bold tracking-tight uppercase">
              Available Funds
            </div>
          </div>

          <div className="card-density">
            <div className="label-density">Savings Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {family ? (100 - (stats.totalSpent / family.monthlyIncome) * 100).toFixed(1) : 0}%
            </div>
            <div className="mt-1 text-[10px] text-slate-400">Monthly projection</div>
          </div>
        </div>

        {/* Split Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Family Members Allocation */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase text-slate-500">Member Allocation & Spending</h3>
              {role === 'admin' && (
                <Link to="/members" className="text-[10px] font-bold text-emerald-600 uppercase border-b border-emerald-600">
                  Manage Pocket Money
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((member, idx) => (
                <div key={member.id} className="bg-white border border-slate-200 p-3 flex gap-3 shadow-sm">
                  <div className={cn(
                    "w-12 h-12 border flex items-center justify-center font-bold",
                    idx % 3 === 0 ? "bg-slate-100 border-slate-200 text-slate-400" :
                    idx % 3 === 1 ? "bg-emerald-100 border-emerald-200 text-emerald-600" :
                    "bg-amber-100 border-amber-200 text-amber-600"
                  )}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold truncate">{member.name}</span>
                      <span className="text-[10px] font-mono font-bold uppercase shrink-0">Role: {member.role}</span>
                    </div>
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '60%' }}></div>
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                      <span>Monthly Holder</span>
                      <span>Alloc: {formatCurrency(member.monthlyPocketMoney)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Recent Activity</h3>
            <div className="flex-1 bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                      <th className="p-2 font-bold uppercase text-slate-400">Member</th>
                      <th className="p-2 font-bold uppercase text-slate-400">Category</th>
                      <th className="p-2 text-right font-bold uppercase text-slate-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-slate-400 uppercase font-bold text-[9px]">no entries</td>
                      </tr>
                    ) : (
                      recentExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2 font-medium">{expense.memberName}</td>
                          <td className="p-2 text-slate-500">{expense.category}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(expense.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">View All Activity</span>
                <Link to="/reports" className="text-[10px] text-emerald-600 font-bold uppercase cursor-pointer hover:underline">Full Report</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
