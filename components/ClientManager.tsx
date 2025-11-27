
import React, { useState } from 'react';
import { Client, ClientInvoice } from '../types';
import { formatCurrency, generateId, getFifthBusinessDay, downloadCSV } from '../utils';
import { Users, Plus, Upload, CheckCircle, AlertCircle, ScanLine, FileDown, Receipt, ArrowDownCircle } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  invoices: ClientInvoice[];
  onAddClient: (client: Client) => void;
  onAddInvoice: (invoice: ClientInvoice) => void;
  onToggleReceipt: (id: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ 
  clients, invoices, onAddClient, onAddInvoice, onToggleReceipt 
}) => {
  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Forms
  const [newClient, setNewClient] = useState<Partial<Client>>({ status: 'Active' });
  const [newInvoice, setNewInvoice] = useState<Partial<ClientInvoice>>({ source: 'Internal' });

  // Add Client
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.email) {
      onAddClient({
        id: generateId('CL'),
        name: newClient.name,
        email: newClient.email,
        officeNumber: newClient.officeNumber || 'TBD',
        contractStart: newClient.contractStart || new Date().toISOString().split('T')[0],
        contractEnd: newClient.contractEnd || 'Ongoing',
        status: 'Active'
      });
      setIsClientModalOpen(false);
      setNewClient({ status: 'Active' });
    }
  };

  // Auto-calculate Due Date based on Invoice Date (5 business days from 1st of month logic or 5 days from inv date?)
  // Prompt says: "After 5 working days from the 1st day of the month"
  const handleInvoiceDateChange = (dateStr: string) => {
    const d = new Date(dateStr);
    const fifthBiz = getFifthBusinessDay(d);
    
    // If we are already past the 5th biz day, maybe set it to next month? 
    // For simplicity, we set it to the 5th biz day of the current month of the invoice
    setNewInvoice({ 
      ...newInvoice, 
      invoiceDate: dateStr, 
      dueDate: fifthBiz.toISOString().split('T')[0] 
    });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newInvoice.clientName && newInvoice.amount) {
      onAddInvoice({
        id: generateId('INV'),
        clientId: clients.find(c => c.name === newInvoice.clientName)?.id || 'EXT',
        clientName: newInvoice.clientName,
        description: newInvoice.description || 'Service Fee',
        amount: Number(newInvoice.amount),
        invoiceDate: newInvoice.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: newInvoice.dueDate || new Date().toISOString().split('T')[0],
        status: 'Sent',
        isReceiptIssued: false,
        source: newInvoice.source || 'Internal'
      });
      setIsInvoiceModalOpen(false);
      setNewInvoice({ source: 'Internal' });
    }
  };

  // Simulate External Scan
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        // Simulate extracted data
        setNewInvoice({
          clientName: 'External Partner LLC',
          description: 'Consulting Services (Scanned)',
          amount: 4500.00,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          source: 'External_Scan'
        });
        setIsInvoiceModalOpen(true);
      }, 1500);
    }
  };

  // Sorting: Pending/Overdue top, Paid bottom
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a.status === 'Paid' && b.status !== 'Paid') return 1;
    if (a.status !== 'Paid' && b.status === 'Paid') return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-brand-red" />
            Clients & Invoicing
          </h2>
          <p className="text-brand-gray text-sm">Manage tenants, track receivables, and issue receipts.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-2 bg-brand-surface hover:bg-brand-gray/20 text-white px-4 py-2 rounded-lg border border-brand-surface transition-colors text-sm"
            >
                <Plus className="w-4 h-4" /> Add Tenant
            </button>
            <button 
                onClick={() => downloadCSV(invoices, 'receivables_report.csv')}
                className="flex items-center gap-2 bg-brand-surface hover:bg-brand-gray/20 text-white px-4 py-2 rounded-lg border border-brand-surface transition-colors text-sm"
            >
                <FileDown className="w-4 h-4" /> Export Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Client List */}
        <div className="lg:col-span-1 bg-brand-dark border border-brand-surface rounded-xl p-4 overflow-y-auto flex flex-col">
          <h3 className="text-sm font-bold text-brand-gray uppercase mb-4 sticky top-0 bg-brand-dark pb-2 z-10">Active Tenants</h3>
          <div className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="p-3 rounded-lg border border-brand-surface hover:border-brand-gray/50 transition-colors bg-brand-black/20 group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{client.name}</div>
                    <div className="text-xs text-brand-gray">{client.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded uppercase tracking-wide border ${client.status === 'Active' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900' : 'bg-red-900/30 text-red-400 border-red-900'}`}>
                    {client.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-brand-gray">
                   <span>Unit: {client.officeNumber}</span>
                   <span>End: {client.contractEnd}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        <div className="lg:col-span-2 bg-brand-dark border border-brand-surface rounded-xl p-4 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-brand-gray uppercase">Receivables</h3>
             <div className="flex gap-2">
                 {/* External Upload */}
                 <div className="relative">
                    <button className="flex items-center gap-2 text-xs bg-brand-black border border-brand-surface text-brand-gray px-3 py-1 rounded hover:text-white transition-colors">
                        {isScanning ? <ScanLine className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {isScanning ? 'Scanning...' : 'Upload Ext. Invoice'}
                    </button>
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" />
                 </div>

                 <button 
                    onClick={() => { setNewInvoice({source: 'Internal'}); setIsInvoiceModalOpen(true); }}
                    className="flex items-center gap-2 text-xs bg-brand-red text-white px-3 py-1 rounded hover:bg-brand-redHover shadow-lg shadow-brand-red/20"
                >
                    <Plus className="w-3 h-3" /> Generate Invoice
                 </button>
             </div>
          </div>
          
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-brand-dark z-10">
                <tr className="text-brand-gray text-xs uppercase border-b border-brand-surface">
                    <th className="py-2 pl-2">Client</th>
                    <th className="py-2">Details</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-center">Receipt</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y divide-brand-surface/30">
                {sortedInvoices.map(inv => {
                    const isPaid = inv.status === 'Paid';
                    return (
                        <tr key={inv.id} className={`hover:bg-brand-surface/20 transition-colors ${isPaid ? 'opacity-60 bg-brand-black/20' : ''}`}>
                            <td className="py-3 pl-2">
                                <div className="font-medium text-white">{inv.clientName}</div>
                                <div className="text-[10px] text-brand-gray">{inv.id} • {inv.source === 'External_Scan' ? 'Ext' : 'Int'}</div>
                            </td>
                            <td className="py-3 text-xs text-brand-gray">
                                <div>{inv.description}</div>
                                <div>Due: {inv.dueDate}</div>
                            </td>
                            <td className="py-3">
                                {inv.status === 'Paid' ? (
                                    <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </span>
                                ) : inv.status === 'Overdue' ? (
                                    <span className="flex items-center gap-1 text-brand-red text-xs font-bold animate-pulse">
                                        <AlertCircle className="w-3 h-3" /> Overdue
                                    </span>
                                ) : (
                                    <span className="text-brand-gray text-xs border border-brand-surface px-2 py-0.5 rounded">Sent</span>
                                )}
                            </td>
                            <td className="py-3 text-right text-white font-mono">{formatCurrency(inv.amount)}</td>
                            <td className="py-3 text-center">
                                <button 
                                    onClick={() => onToggleReceipt(inv.id)}
                                    title="Toggle Receipt Issued"
                                    className={`p-1.5 rounded-full transition-all border ${inv.isReceiptIssued ? 'bg-emerald-500 text-brand-black border-emerald-500' : 'bg-transparent text-brand-gray border-brand-gray/30 hover:text-white'}`}
                                >
                                    <Receipt className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Onboard New Tenant</h3>
                <form onSubmit={handleClientSubmit} className="space-y-4">
                    <input required placeholder="Company Name" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewClient({...newClient, name: e.target.value})} />
                    <input required placeholder="Email Address" type="email" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewClient({...newClient, email: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                         <input placeholder="Office Unit" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewClient({...newClient, officeNumber: e.target.value})} />
                         <input placeholder="Contract End" type="date" className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewClient({...newClient, contractEnd: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 text-brand-gray hover:text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded font-bold">Add Tenant</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Generate Invoice</h3>
                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Client</label>
                        {newInvoice.source === 'External_Scan' ? (
                            <input disabled value={newInvoice.clientName} className="w-full bg-brand-black/50 border border-brand-surface text-white p-3 rounded" />
                        ) : (
                            <select className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewInvoice({...newInvoice, clientName: e.target.value})}>
                                <option value="">Select Client...</option>
                                {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        )}
                    </div>
                    
                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Description</label>
                        <input value={newInvoice.description || ''} className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewInvoice({...newInvoice, description: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs text-brand-gray uppercase font-bold">Amount</label>
                            <input type="number" value={newInvoice.amount || ''} className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} />
                         </div>
                         <div>
                            <label className="text-xs text-brand-gray uppercase font-bold">Invoice Date</label>
                            <input type="date" value={newInvoice.invoiceDate || ''} className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => handleInvoiceDateChange(e.target.value)} />
                         </div>
                    </div>

                    <div>
                        <label className="text-xs text-brand-gray uppercase font-bold">Due Date (Auto-calc)</label>
                        <input type="date" value={newInvoice.dueDate || ''} className="w-full bg-brand-black/50 border border-brand-surface text-gray-400 p-3 rounded" readOnly />
                        <p className="text-[10px] text-brand-gray mt-1">* Calculated as 5th business day of month</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 text-brand-gray hover:text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded font-bold">Save Invoice</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};
