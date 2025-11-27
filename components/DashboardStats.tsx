import React from 'react';
import { VendorInvoice, InvoiceStatus, Importance } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp, AlertOctagon, DollarSign, Wallet } from 'lucide-react';

interface DashboardStatsProps {
  invoices: VendorInvoice[];
  availableCash: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ invoices, availableCash }) => {
  const approvedTotal = invoices
    .filter(i => i.status === InvoiceStatus.APPROVED)
    .reduce((sum, i) => sum + i.amount, 0);
  
  const criticalTotal = invoices
    .filter(i => i.importance === Importance.CRITICAL)
    .reduce((sum, i) => sum + i.amount, 0);

  const utilization = availableCash > 0 ? (approvedTotal / availableCash) * 100 : 0;
  const isDanger = utilization > 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      
      {/* Cash Position */}
      <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface shadow-lg relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="w-16 h-16 text-emerald-500" />
        </div>
        <p className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Available Cash</p>
        <h3 className="text-3xl font-bold text-white">{formatCurrency(availableCash)}</h3>
        <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Live Balance
        </p>
      </div>

      {/* Burn Rate / Approved */}
      <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface shadow-lg">
         <p className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Projected Outflow</p>
         <h3 className={`text-3xl font-bold ${isDanger ? 'text-brand-red' : 'text-white'}`}>
           {formatCurrency(approvedTotal)}
         </h3>
         <div className="w-full bg-brand-surface h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full ${isDanger ? 'bg-brand-red' : 'bg-emerald-500'}`} 
              style={{ width: `${Math.min(utilization, 100)}%` }}
            ></div>
         </div>
         <p className="text-[10px] text-brand-gray mt-1 text-right">{utilization.toFixed(1)}% of Budget</p>
      </div>

      {/* Critical Debt */}
      <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface shadow-lg">
        <div className="flex justify-between items-start">
           <div>
             <p className="text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Critical Liabilities</p>
             <h3 className="text-2xl font-bold text-white">{formatCurrency(criticalTotal)}</h3>
           </div>
           <AlertOctagon className="text-brand-red w-6 h-6" />
        </div>
        <p className="text-xs text-brand-gray mt-2">Mandatory Payments (Rent/Utils)</p>
      </div>

      {/* Net Position Estimate */}
      <div className="bg-brand-dark p-5 rounded-xl border border-brand-surface shadow-lg flex flex-col justify-between">
         <p className="text-xs font-bold text-brand-gray uppercase tracking-wider">Est. Net Position</p>
         <h3 className={`text-2xl font-bold ${availableCash - approvedTotal < 0 ? 'text-brand-red' : 'text-emerald-400'}`}>
            {formatCurrency(availableCash - approvedTotal)}
         </h3>
         <p className="text-xs text-brand-gray">After approved run</p>
      </div>
    </div>
  );
};