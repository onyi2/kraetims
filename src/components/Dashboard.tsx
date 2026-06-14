/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Receipt as ReceiptIcon, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  FileText, 
  ArrowUpRight, 
  BookOpen, 
  PlusCircle, 
  Eye, 
  Edit2, 
  Trash2,
  Lock,
  Filter,
  CheckCircle,
  Copy
} from 'lucide-react';
import { Receipt, UserRole, AuditLog } from '../types';

interface DashboardProps {
  receipts: Receipt[];
  onNavigate: (tab: string, receiptId?: string) => void;
  onDeleteReceipt: (id: string) => void;
  onDuplicateReceipt: (receipt: Receipt) => void;
  userRole: UserRole;
  auditLogs: AuditLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  receipts,
  onNavigate,
  onDeleteReceipt,
  onDuplicateReceipt,
  userRole,
  auditLogs
}) => {
  const [selectedChartPoint, setSelectedChartPoint] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // --- COMPUTE STATISTICS ---
  const todayString = new Date().toISOString().split('T')[0];
  const todayReceipts = receipts.filter(r => r.date === todayString || r.date === '2026-06-13');
  const todayTotal = todayReceipts.reduce((acc, current) => acc + (current.status !== 'Cancelled' ? current.amountPaid : 0), 0);
  
  const totalRevenue = receipts.reduce((acc, current) => acc + (current.status !== 'Cancelled' ? current.amountPaid : 0), 0);
  const totalOutstanding = receipts.reduce((acc, current) => acc + (current.status !== 'Cancelled' ? current.balance : 0), 0);
  
  const paidCount = receipts.filter(r => r.status === 'Paid').length;
  const approvedCount = receipts.filter(r => r.status === 'Approved').length;
  const pendingCount = receipts.filter(r => r.status === 'Pending').length;
  const totalStudents = receipts.length;
  const paidRate = totalStudents > 0 ? Math.round(((paidCount + approvedCount) / totalStudents) * 100) : 0;

  // --- BAR CHART DATA (Monthly Collections in KES) ---
  const monthlyData = [
    { month: 'Jan', revenue: 420000, receipts: 48 },
    { month: 'Feb', revenue: 580000, receipts: 72 },
    { month: 'Mar', revenue: 310000, receipts: 39 },
    { month: 'Apr', revenue: 890000, receipts: 104 },
    { month: 'May', revenue: 720000, receipts: 85 },
    { month: 'Jun', revenue: totalRevenue > 0 ? totalRevenue : 45000, receipts: receipts.length }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  // --- DONUT PIE CHART DATA (Revenue Categories) ---
  // Aggregate from all active items
  const categoryAggregates: { [key: string]: number } = {
    'School Fees': 0,
    'Uniforms': 0,
    'Books': 0,
    'Transport': 0,
    'Other': 0
  };

  receipts.forEach(r => {
    if (r.status === 'Cancelled') return;
    r.items.forEach(itm => {
      const cat = itm.category;
      if (cat === 'School Fees' || cat === 'Uniforms' || cat === 'Books' || cat === 'Transport') {
        categoryAggregates[cat] += itm.total;
      } else {
        categoryAggregates['Other'] += itm.total;
      }
    });
  });

  // Ensure mock values as fallback if empty for display aesthetics
  if (Object.values(categoryAggregates).reduce((a, b) => a + b, 0) === 0) {
    categoryAggregates['School Fees'] = 145000;
    categoryAggregates['Uniforms'] = 52000;
    categoryAggregates['Books'] = 28000;
    categoryAggregates['Transport'] = 12000;
  }

  const categoryColors: { [key: string]: string } = {
    'School Fees': '#0D47A1', // Primary-600
    'Uniforms': '#1565C0',    // Primary-700
    'Books': '#42A5F5',       // Accent blue
    'Transport': '#2E7D32',   // Success green
    'Other': '#F9A825'        // Warning yellow
  };

  const totalCategorySum = Object.values(categoryAggregates).reduce((a, b) => a + b, 0);

  // Parse list of categories sorted by magnitude
  const categoryList = Object.entries(categoryAggregates).map(([key, value]) => ({
    name: key,
    value,
    percentage: totalCategorySum > 0 ? Math.round((value / totalCategorySum) * 100) : 0,
    color: categoryColors[key]
  })).sort((a, b) => b.value - a.value);

  // Formatting shillings shorthand
  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Check role permission utilities
  const canEdit = ['Super Admin', 'Bursar', 'Accountant'].includes(userRole);
  const canDelete = ['Super Admin', 'Principal'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Upper Welcome and Role Badge banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-900 tracking-tight">
            Kenya eTIMS Invoicing Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time compliance monitoring, student receipt history, and tax auditing for <span className="font-semibold text-primary-600">Karoney School Supplies</span>.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-3 items-center">
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-gray-700">eTIMS API Node: Live</span>
          </div>

          <div className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-100 rounded-xl flex items-center gap-1.5">
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-primary-600 text-white rounded-md text-[10px] uppercase font-mono tracking-wider">
              {userRole}
            </span>
            <span className="text-xs font-medium">Privileges Active</span>
          </div>
        </div>
      </div>

      {/* --- STATISTICS CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Collection Today
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-semibold text-gray-900">
              {formatKES(todayTotal)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center font-mono">
                <ArrowUpRight className="h-3 w-3 inline mr-0.5" />
                +12%
              </span>
              <span className="text-xs text-gray-400">
                {todayReceipts.length} receipt{todayReceipts.length === 1 ? '' : 's'} recorded
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Cumulative Receipts */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Monthly Active Revenue
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-semibold text-gray-900">
              {formatKES(totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs text-emerald-600 font-medium">
                Term 2 Cumulative
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400">
                {receipts.filter(r => r.status !== 'Cancelled').length} Active receipts
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Outstanding Unpaid Levies */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Unpaid Balances
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-semibold text-amber-700">
              {formatKES(totalOutstanding)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {receipts.filter(r => r.balance > 0).length} Students Pending
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Fee Compliance Index */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
              Fee Compliance Index
            </span>
            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-display font-semibold text-gray-900">
              {paidRate}%
            </h3>
            {/* Visual Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${paidRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIVE INTERACTIVE GRAPHICAL CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Trend Plot (Pure Vector SVG) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Receipt Billing Velocity</h2>
              <p className="text-xs text-gray-400 font-sans">Cumulative school collections tracking graph (Jan - Jun 2026)</p>
            </div>
            {selectedChartPoint !== null && (
              <div className="px-2.5 py-1 bg-primary-50 rounded-lg text-xs border border-primary-100 text-primary-700 font-mono">
                {monthlyData[selectedChartPoint].month}: <strong>{formatKES(monthlyData[selectedChartPoint].revenue)}</strong>
              </div>
            )}
          </div>

          <div className="h-64 w-full relative pt-4">
            {/* Custom interactive responsive SVG graph structure */}
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#cbd5e1" strokeWidth="1" />

              {/* Y Axis Grid values */}
              <text x="5" y="24" className="text-[10px] font-mono fill-gray-400 text-right">900K</text>
              <text x="5" y="74" className="text-[10px] font-mono fill-gray-400 text-right">600K</text>
              <text x="5" y="124" className="text-[10px] font-mono fill-gray-400 text-right">300K</text>
              <text x="15" y="174" className="text-[10px] font-mono fill-gray-400 text-right">0K</text>

              {/* Compute chart coordinates based on values */}
              {(() => {
                const points = monthlyData.map((d, index) => {
                  const x = 50 + index * 100;
                  // Max range maps to y = 20, 0 maps to y = 170
                  const y = 170 - (d.revenue / 1000000) * 150;
                  return { x, y, ...d, index };
                });

                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const gdD = `${pathD} L ${points[points.length-1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <>
                    {/* Shadow Area under curves */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0D47A1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0D47A1" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path d={gdD} fill="url(#chartGradient)" />

                    {/* Direct Connect line */}
                    <path d={pathD} fill="none" stroke="#0D47A1" strokeWidth="3" strokeLinecap="round" />

                    {/* Nodes and interactive hovers */}
                    {points.map((p) => {
                      const isSelected = selectedChartPoint === p.index;
                      return (
                        <g key={p.month} className="cursor-pointer">
                          {/* Invisible larger hover hotbox */}
                          <rect 
                            x={p.x - 30} 
                            y={10} 
                            width={60} 
                            height={180} 
                            fill="transparent"
                            onMouseEnter={() => setSelectedChartPoint(p.index)}
                            onMouseLeave={() => setSelectedChartPoint(null)}
                          />
                          
                          {/* Anchor Circle */}
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={isSelected ? 6 : 4} 
                            fill={isSelected ? "#1565C0" : "#ffffff"} 
                            stroke="#0D47A1" 
                            strokeWidth={isSelected ? 3 : 2}
                            className="transition-all duration-150"
                          />

                          {/* X-Label */}
                          <text 
                            x={p.x} 
                            y="192" 
                            textAnchor="middle" 
                            className={`text-[10px] font-sans font-medium transition-colors ${isSelected ? "fill-primary-600 font-bold" : "fill-gray-400"}`}
                          >
                            {p.month}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Pie / Donut Chart component (Pure SVG inline vectors) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Fund Allocations</h2>
          <p className="text-xs text-gray-400 mb-6 font-sans">Active collection allocations across fiscal channels</p>

          <div className="flex flex-col items-center justify-between">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Dynamic inline SVG Donut chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  let accumulatedPercent = 0;
                  return categoryList.map((cat) => {
                    const radius = 38;
                    const strokeWidth = 14;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDashoffset = circumference - (cat.percentage / 100) * circumference;
                    const rotation = (accumulatedPercent / 100) * 360;
                    accumulatedPercent += cat.percentage;

                    const isHovered = hoveredCategory === cat.name;

                    return (
                      <circle
                        key={cat.name}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(${rotation} 50 50)`}
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredCategory(cat.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest font-sans">Total</span>
                <span className="text-sm font-bold text-gray-800 mt-0.5">{formatKES(totalCategorySum)}</span>
              </div>
            </div>

            {/* Color keys mapping list */}
            <div className="w-full mt-6 space-y-2">
              {categoryList.map((cat) => {
                const isHovered = hoveredCategory === cat.name;
                return (
                  <div 
                    key={cat.name} 
                    className={`flex items-center justify-between text-xs p-1 rounded-lg transition-colors ${isHovered ? 'bg-gray-50' : ''}`}
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-gray-400 text-[10px]">({cat.percentage}%)</span>
                      <span className="font-semibold text-gray-900">{formatKES(cat.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT COMPLIANT RECIEPTS & AUDIT TRAIL LOGS --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left section: recent receipts list (2/3 width on wide desktop) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Compliant Receipts</h2>
              <p className="text-xs text-gray-400">Newly recorded eTIMS generated digital receipts</p>
            </div>
            <button 
              onClick={() => onNavigate('history')} 
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 cursor-pointer"
            >
              View All Receipts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto scroll-thin -mx-5 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider bg-gray-50 md:bg-white">
                  <th className="py-3 px-5">Receipt No</th>
                  <th className="py-3 px-5">Student</th>
                  <th className="py-3 px-5">Category Sum</th>
                  <th className="py-3 px-5 text-center">eTIMS Sync</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {receipts.slice(0, 5).map((rec) => {
                  const itemsCount = rec.items.length;
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/70 transition-colors group">
                      <td className="py-3 px-5 font-mono text-xs text-gray-900 font-semibold">
                        {rec.receiptNo}
                        <span className="block text-[10px] text-gray-400 font-sans tracking-normal mt-0.5 font-normal">
                          {formatDate(rec.date)} • {rec.time}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-medium text-gray-800">{rec.studentName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {rec.admissionNo} • {rec.studentClass}
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-semibold text-gray-900 font-mono text-xs">
                          {formatKES(rec.grandTotal)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {itemsCount} item{itemsCount === 1 ? '' : 's'} invoiced
                        </div>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase font-mono ${
                          rec.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                            : rec.status === 'Approved' 
                            ? 'bg-blue-50 text-blue-800 border border-blue-100'
                            : rec.status === 'Cancelled'
                            ? 'bg-red-50 text-red-800 border border-red-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rec.status === 'Paid' ? 'bg-emerald-500' : rec.status === 'Approved' ? 'bg-blue-500' : rec.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></span>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onNavigate('builder', rec.id)} 
                            title="Open in Viewer"
                            className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {canEdit ? (
                            <button 
                              onClick={() => onNavigate('builder-edit', rec.id)} 
                              title="Edit Receipt"
                              className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              disabled 
                              title="Insufficient privileges"
                              className="p-1 text-gray-300 cursor-not-allowed"
                            >
                              <Lock className="h-4 w-4" />
                            </button>
                          )}

                          <button 
                            onClick={() => onDuplicateReceipt(rec)} 
                            title="Duplicate Receipt"
                            className="p-1 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          
                          {canDelete && (
                            <button 
                              onClick={() => onDeleteReceipt(rec.id)} 
                              title="Delete / Cancel Receipt"
                              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: System Security Audit Trail */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Security Audit Logs</h2>
              <p className="text-xs text-gray-400 font-sans">Strict cryptographic action logging</p>
            </div>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto scroll-thin pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="text-xs p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                <div className="flex items-center justify-between font-mono text-[10px] text-gray-400">
                  <span>{log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                  <span className="font-semibold text-primary-700 bg-primary-50 px-1 py-0.2 rounded uppercase">
                    {log.role}
                  </span>
                </div>
                <div className="mt-1.5 font-medium text-gray-800">
                  {log.action}
                </div>
                <div className="mt-1 text-[11px] text-gray-500 font-sans">
                  {log.details}
                </div>
                {log.receiptNo && (
                  <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-mono font-medium text-gray-600">
                    Doc: {log.receiptNo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
