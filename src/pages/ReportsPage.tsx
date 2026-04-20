import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Expense, FamilyMember } from '../types';
import { formatCurrency, formatMonth } from '../lib/utils';
import Layout from '../components/Layout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { Calendar, Download, Trophy, Target, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#000000', '#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function ReportsPage() {
  const { familyId, role } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(formatMonth(new Date()));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;

    const unsubMembers = onSnapshot(collection(db, 'families', familyId, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember)));
    });

    const q = query(
      collection(db, 'families', familyId, 'expenses'),
      where('month', '==', selectedMonth)
    );
    
    const unsubExpenses = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setLoading(false);
    });

    return () => {
      unsubMembers();
      unsubExpenses();
    };
  }, [familyId, selectedMonth]);

  const memberSpending = members.map(member => {
    const total = expenses
      .filter(ex => ex.memberId === member.uid || ex.memberName === member.name)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: member.name, total };
  });

  const categorySpendingMap: Record<string, number> = {};
  expenses.forEach(ex => {
    categorySpendingMap[ex.category] = (categorySpendingMap[ex.category] || 0) + ex.amount;
  });
  const categoryData = Object.entries(categorySpendingMap).map(([name, value]) => ({ name, value }));

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const highestSpender = [...memberSpending].sort((a, b) => b.total - a.total)[0];
  const lowestSpender = [...memberSpending].filter(m => m.total > 0).sort((a, b) => a.total - b.total)[0];

  const exportCSV = () => {
    const headers = ['Date', 'Member', 'Category', 'Amount', 'Description'];
    const rows = expenses.map(ex => [
      ex.date ? new Date(ex.date.seconds * 1000).toLocaleDateString() : '',
      ex.memberName,
      ex.category,
      ex.amount,
      ex.description || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `family_expenses_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (role !== 'admin') return <Layout><div>Access Denied</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Fiscal Intelligence</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Family Insights</h1>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-8 pr-3 py-2 bg-white border border-slate-200 text-[11px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-slate-900 outline-none"
              />
            </div>
            <button 
              onClick={exportCSV}
              className="btn-slate"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="card-density">
            <div className="label-density">Monthly Total</div>
            <div className="text-3xl font-bold mt-1 text-slate-900">{formatCurrency(totalSpent)}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-density">
            <div className="label-density">Principal Consumer</div>
            <div className="text-xl font-bold mt-1 truncate uppercase">{highestSpender?.name || 'N/A'}</div>
            <div className="text-[10px] text-red-500 font-bold uppercase">Critical Velocity</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-density">
            <div className="label-density">Optimum efficiency</div>
            <div className="text-xl font-bold mt-1 truncate uppercase">{lowestSpender?.name || 'N/A'}</div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase">Efficiency Lead</div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <div className="card-density">
             <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase text-slate-500">Resource Consumption by Entity</h3>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberSpending}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '10px' }} 
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="total" fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Pie Chart */}
          <div className="card-density">
             <div className="flex items-center gap-2 mb-6">
                <PieIcon className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase text-slate-500">Sector Distribution</h3>
             </div>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', fontSize: '10px' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
