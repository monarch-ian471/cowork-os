
import React, { useMemo, useState } from 'react';
import { VendorInvoice, InvoiceStatus, Importance } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';
import { ArrowUp, ArrowDown, Lock, Zap, Shield, Home, Briefcase, Plus } from 'lucide-react';

interface VendorPayablesProps {
  invoices: VendorInvoice[];
  onToggleStatus: (invoiceId: string) => void;
  onAddInvoice: (invoice: VendorInvoice) => void;
  availableCash: number;
}

export const VendorPayables: React.FC<VendorPayablesProps> = ({ invoices, onToggleStatus, onAddInvoice, availableCash }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newBill, setNewBill] = useState<Partial<VendorInvoice>>({ importance: Importance.MEDIUM, category: 'Services' });

  const approvedList = useMemo(() => invoices.filter(i => i.status === InvoiceStatus.APPROVED), [invoices]);
  const holdList = useMemo(() => invoices.filter(i => i.status === InvoiceStatus.HOLD), [invoices]);
  
  let runningTotal = 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newBill.vendorName && newBill.amount) {
        onAddInvoice({
            id: generateId('VEND'),
            vendorName: newBill.vendorName,
            amount: Number(newBill.amount),
            category: newBill.category as any,
            importance: newBill.importance as Importance,
            invoiceDate: newBill.invoiceDate || new Date().toISOString().split('T')[0],
            dueDate: newBill.dueDate || new Date().toISOString().split('T')[0],
            status: InvoiceStatus.HOLD, // Always start as HOLD, let the engine rank it
            isManualOverride: false
        });
        setIsFormOpen(false);
        setNewBill({ importance: Importance.MEDIUM, category: 'Services' });
    }
  };

  const getIcon = (cat: string) => {
    switch(cat) {
      case 'Electricity': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Security': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'Rent': return <Home className="w-4 h-4 text-brand-red" />;
      default: return <Briefcase className="w-4 h-4 text-brand-gray" />;
    }
  };

  const renderRow = (invoice: VendorInvoice, isApproved: boolean) => {
    runningTotal += isApproved ? invoice.amount : 0;
    const isOverBudget = isApproved && runningTotal > availableCash;

    // Dark theme importance badges
    const importanceColor = {
        [Importance.CRITICAL]: 'bg-red-950/40 text-red-500 border-red-900',
        [Importance.HIGH]: 'bg-orange-950/40 text-orange-500 border-orange-900',
        [Importance.MEDIUM]: 'bg-yellow-950/40 text-yellow-500 border-yellow-900',
        [Importance.LOW]: 'bg-blue-950/40 text-blue-500 border-blue-900',
    }[invoice.importance];

    return (
      <div 
        key={invoice.id} 
        className={`
            group flex items-center justify-between p-4 border-b border-brand-surface 
            hover:bg-brand-surface/20 transition-colors relative
            ${invoice.isManualOverride ? 'bg-amber-900/10' : ''}
            ${isOverBudget ? 'border-l-4 border-l-brand-red' : 'border-l-4 border-l-transparent'}
        `}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-brand-surface text-brand-gray font-bold text-xs border border-brand-black shadow-inner">
            {Math.round(invoice.score || 0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-white truncate">{invoice.vendorName}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${importanceColor}`}>
                {invoice.importance}
              </span>
              {invoice.isManualOverride && (
                 <span className="text-amber-500" title="Locked">
                    <Lock className="w-3 h-3" />
                 </span>
              )}
            </div>
            <div className="flex text-xs text-brand-gray gap-4 items-center">
               <div className="flex items-center gap-1">{getIcon(invoice.category)} {invoice.category}</div>
               <span>Due: {formatDate(invoice.dueDate)}</span>
               <span className={`${invoice.ageDays! > 30 ? 'text-brand-red' : ''}`}>Age: {invoice.ageDays}d</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="font-bold text-white font-mono">{formatCurrency(invoice.amount)}</div>
                {isApproved && (
                    <div className="text-[10px] text-brand-gray">Cumul: <span className={isOverBudget ? 'text-brand-red' : 'text-emerald-500'}>{formatCurrency(runningTotal)}</span></div>
                )}
            </div>
            
            <button
                onClick={() => onToggleStatus(invoice.id)}
                className={`
                    p-2 rounded-lg border transition-all
                    ${isApproved 
                        ? 'border-brand-red/30 text-brand-red hover:bg-brand-red/10' 
                        : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}
                `}
            >
                {isApproved ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-dark rounded-xl shadow-xl border border-brand-surface flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-brand-surface bg-brand-black/20 flex justify-between items-center">
        <div>
            <h3 className="font-bold text-white">Vendor Priority Queue</h3>
            <span className="text-xs text-brand-gray">Auto-ranked by Importance & Aging</span>
        </div>
        <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand-red text-white text-xs font-bold rounded hover:bg-brand-redHover transition-colors"
        >
            <Plus className="w-4 h-4" /> New Vendor Bill
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pb-20 custom-scrollbar">
        {/* Approved */}
        <div className="relative">
            {approvedList.map(inv => renderRow(inv, true))}
        </div>

        {/* The Waterline */}
        <div className="sticky top-0 z-10 flex items-center gap-4 py-3 px-4 bg-brand-black border-y border-brand-red/50 my-2 shadow-lg">
            <div className="h-px bg-brand-red/50 flex-1"></div>
            <span className="text-xs font-bold text-brand-red uppercase tracking-widest bg-brand-black px-3 py-1 rounded border border-brand-red">
                CASH LIMIT CUT-OFF
            </span>
            <div className="h-px bg-brand-red/50 flex-1"></div>
        </div>

        {/* Hold */}
        <div className="bg-brand-black/40 min-h-[200px]">
            {holdList.length === 0 && (
                <div className="p-8 text-center text-brand-gray italic">All bills covered.</div>
            )}
            {holdList.map(inv => renderRow(inv, false))}
        </div>
      </div>

      {/* Add Bill Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Register Vendor Bill</h3>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <input required placeholder="Vendor Name" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewBill({...newBill, vendorName: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input required type="number" placeholder="Amount" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewBill({...newBill, amount: Number(e.target.value)})} />
                        <select className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewBill({...newBill, category: e.target.value as any})}>
                            <option value="Services">Services</option>
                            <option value="Rent">Rent</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Security">Security</option>
                            <option value="Tax">Tax</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold mb-2 block">Priority Level (Affects Ranking)</label>
                        <select 
                            className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" 
                            onChange={e => setNewBill({...newBill, importance: e.target.value as Importance})}
                            value={newBill.importance}
                        >
                            <option value={Importance.CRITICAL}>Critical (Top Priority)</option>
                            <option value={Importance.HIGH}>High</option>
                            <option value={Importance.MEDIUM}>Medium</option>
                            <option value={Importance.LOW}>Low</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-brand-gray">Invoice Date</label>
                            <input type="date" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewBill({...newBill, invoiceDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-brand-gray">Due Date</label>
                            <input type="date" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewBill({...newBill, dueDate: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-brand-gray hover:text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded font-bold">Add to Queue</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
