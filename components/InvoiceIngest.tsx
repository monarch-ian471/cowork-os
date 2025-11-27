import React, { useState } from 'react';
import { Plus, Upload, FileText } from 'lucide-react';
import { VendorInvoice, Importance, InvoiceStatus } from '../types';

interface InvoiceIngestProps {
  onAddInvoice: (invoice: VendorInvoice) => void;
  onBulkUpload: (invoices: VendorInvoice[]) => void;
}

export const InvoiceIngest: React.FC<InvoiceIngestProps> = ({ onAddInvoice, onBulkUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<VendorInvoice['category']>('Services');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [due, setDue] = useState(new Date().toISOString().split('T')[0]);
  const [importance, setImportance] = useState<Importance>(Importance.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: VendorInvoice = {
      id: Math.random().toString(36).substr(2, 9),
      vendorName: vendor,
      category: category,
      amount: parseFloat(amount),
      invoiceDate: date,
      dueDate: due,
      importance: importance,
      status: InvoiceStatus.HOLD, // Default to hold, let engine sort it
      isManualOverride: false
    };
    onAddInvoice(newInvoice);
    setVendor('');
    setAmount('');
    setCategory('Services');
    setIsOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple CSV parser for demo purposes (assumes: Vendor,Category,Amount,Date,Due,Importance)
      const lines = text.split('\n').slice(1); // skip header
      const newInvoices: VendorInvoice[] = [];
      
      lines.forEach(line => {
        const cols = line.split(',');
        if (cols.length >= 2) {
            newInvoices.push({
                id: Math.random().toString(36).substr(2, 9),
                vendorName: cols[0]?.trim() || 'Unknown',
                category: (cols[1]?.trim() as VendorInvoice['category']) || 'Services',
                amount: parseFloat(cols[2]) || 0,
                invoiceDate: cols[3]?.trim() || new Date().toISOString(),
                dueDate: cols[4]?.trim() || new Date().toISOString(),
                importance: (cols[5]?.trim() as Importance) || Importance.MEDIUM,
                status: InvoiceStatus.HOLD,
            });
        }
      });
      
      if (newInvoices.length > 0) {
          onBulkUpload(newInvoices);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-6 flex gap-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Invoice
      </button>

      <div className="relative overflow-hidden inline-block">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm">
            <Upload className="w-4 h-4" />
            Import CSV
        </button>
        <input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute left-0 top-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">New Invoice</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vendor Name</label>
                <input required type="text" value={vendor} onChange={e => setVendor(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. AWS Web Services" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount ($)</label>
                    <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value as VendorInvoice['category'])} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Security">Security</option>
                        <option value="Services">Services</option>
                        <option value="Tax">Tax</option>
                    </select>
                 </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Importance</label>
                    <select value={importance} onChange={e => setImportance(e.target.value as Importance)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                        {Object.values(Importance).map(imp => <option key={imp} value={imp}>{imp}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
                    <input type="date" value={due} onChange={e => setDue(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Invoice Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};