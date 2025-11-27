
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Client, ClientInvoice, Project, AnalyticsGoals } from '../types';
import { formatCurrency } from '../utils';
import { Target, TrendingUp, Users, Briefcase } from 'lucide-react';

interface AnalyticsDashboardProps {
    clients: Client[];
    invoices: ClientInvoice[];
    projects: Project[];
    goals: AnalyticsGoals;
    onUpdateGoals: (g: AnalyticsGoals) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ clients, invoices, projects, goals, onUpdateGoals }) => {
    
    // Calculated Metrics
    const totalSales = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const churnedClients = clients.filter(c => c.status === 'Churned').length;
    const totalClients = activeClients + churnedClients;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 100;
    
    // Chart Data Mockup (Monthly sales)
    const chartData = [
        { name: 'Aug', sales: 4000 },
        { name: 'Sep', sales: 5500 },
        { name: 'Oct', sales: totalSales },
        { name: 'Nov', sales: 0 },
    ];

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-brand-red" />
                Performance Analytics
            </h2>

            {/* Goals Input Section */}
            <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-red" /> Set Monthly Targets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Revenue Goal ($)</label>
                        <input 
                            type="number" 
                            value={goals.monthlyRevenue} 
                            onChange={e => onUpdateGoals({...goals, monthlyRevenue: Number(e.target.value)})}
                            className="w-full bg-brand-black border border-brand-surface text-white p-2 rounded mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Retention Goal (%)</label>
                        <input 
                            type="number" 
                            value={goals.clientRetention} 
                            onChange={e => onUpdateGoals({...goals, clientRetention: Number(e.target.value)})}
                            className="w-full bg-brand-black border border-brand-surface text-white p-2 rounded mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Active Projects</label>
                        <input 
                            type="number" 
                            value={goals.projectCount} 
                            onChange={e => onUpdateGoals({...goals, projectCount: Number(e.target.value)})}
                            className="w-full bg-brand-black border border-brand-surface text-white p-2 rounded mt-1"
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface">
                    <div className="flex justify-between">
                         <span className="text-brand-gray text-xs uppercase font-bold">Client Sales</span>
                         <span className={`text-xs font-bold ${totalSales >= goals.monthlyRevenue ? 'text-emerald-500' : 'text-brand-red'}`}>
                            {((totalSales / goals.monthlyRevenue) * 100).toFixed(0)}% of Goal
                         </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(totalSales)}</h3>
                    <div className="w-full bg-brand-surface h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-brand-red h-full" style={{ width: `${Math.min((totalSales / goals.monthlyRevenue) * 100, 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface">
                    <div className="flex justify-between">
                         <span className="text-brand-gray text-xs uppercase font-bold">Retention Rate</span>
                         <Users className="w-4 h-4 text-brand-gray" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-2">{retentionRate.toFixed(1)}%</h3>
                    <p className="text-xs text-brand-gray mt-1">{activeClients} Active / {totalClients} Total</p>
                </div>

                <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface">
                    <div className="flex justify-between">
                         <span className="text-brand-gray text-xs uppercase font-bold">BDS Projects</span>
                         <Briefcase className="w-4 h-4 text-brand-gray" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mt-2">{projects.length}</h3>
                    <p className="text-xs text-brand-gray mt-1">Goal: {goals.projectCount}</p>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-brand-dark p-6 rounded-xl border border-brand-surface flex-1 min-h-[300px]">
                <h3 className="text-lg font-bold text-white mb-6">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: '#27272a' }}
                        />
                        <Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
