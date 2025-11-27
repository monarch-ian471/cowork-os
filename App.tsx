
import React, { useState, useMemo } from 'react';
import { DashboardStats } from './components/DashboardStats';
import { VendorPayables } from './components/InvoiceWaterline';
import { SettingsPanel } from './components/SettingsPanel';
import { LoginPage } from './components/LoginPage';
import { AssetTracker } from './components/AssetTracker';
import { ClientManager } from './components/ClientManager';
import { ProjectManager } from './components/ProjectManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { VendorInvoice, AppSettings, Importance, InvoiceStatus, User, Client, ClientInvoice, Asset, Project, AnalyticsGoals } from './types';
import { processInvoices, generateId } from './utils';
import { LayoutDashboard, Users, Package, CreditCard, Settings, LogOut, Briefcase, BarChart3 } from 'lucide-react';

const INITIAL_VENDOR_INVOICES: VendorInvoice[] = [
  { id: '1', vendorName: 'Landlord Holdings', category: 'Rent', invoiceDate: '2023-10-01', dueDate: '2023-10-05', amount: 8500.00, importance: Importance.CRITICAL, status: InvoiceStatus.HOLD },
  { id: '2', vendorName: 'City Power & Light', category: 'Utilities', invoiceDate: '2023-09-28', dueDate: '2023-10-10', amount: 1200.50, importance: Importance.CRITICAL, status: InvoiceStatus.HOLD },
  { id: '3', vendorName: 'SecureGuard Inc', category: 'Security', invoiceDate: '2023-10-01', dueDate: '2023-10-15', amount: 2500.00, importance: Importance.HIGH, status: InvoiceStatus.HOLD },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'CL-001', name: 'TechFlow Solutions', email: 'billing@techflow.io', officeNumber: '101', contractStart: '2023-01-01', contractEnd: '2024-12-31', status: 'Active' },
  { id: 'CL-002', name: 'Design Studio 9', email: 'hello@ds9.com', officeNumber: '102', contractStart: '2023-03-01', contractEnd: '2024-06-30', status: 'Active' },
];

const INITIAL_CLIENT_INVOICES: ClientInvoice[] = [
  { id: 'INV-001', clientId: 'CL-001', clientName: 'TechFlow Solutions', description: 'Oct Rent', amount: 2500, invoiceDate: '2023-10-01', dueDate: '2023-10-06', status: 'Paid', isReceiptIssued: true, source: 'Internal' },
];

const INITIAL_PROJECTS: Project[] = [
    { id: 'PRJ-001', name: 'Startup Accelerator Batch 1', clientName: 'Ministry of Tech', contractValue: 50000, contactPerson: 'Sarah Connor', startDate: '2023-06-01', endDate: '2023-12-31', status: 'Active', invoicingNotes: 'Invoice quarterly. Contact Sarah for PO.' }
];

type View = 'DASHBOARD' | 'VENDORS' | 'CLIENTS' | 'ASSETS' | 'PROJECTS' | 'ANALYTICS';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  
  // ----- GLOBAL STATE (Database Simulation) -----
  const [cashBalance, setCashBalance] = useState<number>(15000);
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>(INITIAL_VENDOR_INVOICES);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>(INITIAL_CLIENT_INVOICES);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  const [analyticsGoals, setAnalyticsGoals] = useState<AnalyticsGoals>({
      monthlyRevenue: 10000,
      clientRetention: 90,
      projectCount: 5
  });

  const [settings, setSettings] = useState<AppSettings>({
    weightImportance: 60,
    weightAge: 30,
    weightAmount: 10,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ----- VENDOR LOGIC -----
  const processedVendorInvoices = useMemo(() => {
    return processInvoices(vendorInvoices, settings, cashBalance);
  }, [vendorInvoices, settings, cashBalance]);

  const handleToggleVendorStatus = (id: string) => {
    setVendorInvoices(prev => {
      const target = prev.find(i => i.id === id);
      if (!target) return prev;
      const newStatus = target.status === InvoiceStatus.APPROVED ? InvoiceStatus.HOLD : InvoiceStatus.APPROVED;
      return prev.map(inv => inv.id === id ? { ...inv, status: newStatus, isManualOverride: true } : inv);
    });
  };

  const handleAddVendorInvoice = (invoice: VendorInvoice) => {
      setVendorInvoices(prev => [...prev, invoice]);
  };

  // ----- CLIENT LOGIC -----
  const handleAddClient = (client: Client) => setClients([...clients, client]);
  const handleAddClientInvoice = (inv: ClientInvoice) => setClientInvoices([...clientInvoices, inv]);
  const handleToggleReceipt = (id: string) => {
      setClientInvoices(prev => prev.map(inv => {
          if (inv.id === id) return { ...inv, isReceiptIssued: !inv.isReceiptIssued };
          return inv;
      }));
  };

  // ----- ASSET LOGIC -----
  const handleAddAsset = (asset: Asset) => setAssets([...assets, asset]);
  const handleBulkAddAssets = (newAssets: Asset[]) => setAssets([...assets, ...newAssets]);

  // ----- PROJECT LOGIC -----
  const handleAddProject = (project: Project) => setProjects([...projects, project]);


  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-brand-black text-white font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark border-r border-brand-surface flex flex-col">
        <div className="p-6 border-b border-brand-surface">
          <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tighter">
            <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white">
              CW
            </div>
            COWORK OS
          </h1>
          <p className="text-xs text-brand-gray mt-2 ml-1">v2.1 • {user.role === 'ADMIN_OPS' ? 'OPS' : 'FINANCE'}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => setCurrentView('DASHBOARD')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'DASHBOARD' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-surface uppercase tracking-wider">Management</div>
          
          <button onClick={() => setCurrentView('CLIENTS')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'CLIENTS' ? 'bg-brand-surface text-white border border-brand-gray/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Clients & Billing</span>
          </button>

          <button onClick={() => setCurrentView('VENDORS')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'VENDORS' ? 'bg-brand-surface text-white border border-brand-gray/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Vendor Payables</span>
          </button>

          <button onClick={() => setCurrentView('ASSETS')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'ASSETS' ? 'bg-brand-surface text-white border border-brand-gray/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <Package className="w-5 h-5" />
            <span className="font-medium">Inventory</span>
          </button>

           <button onClick={() => setCurrentView('PROJECTS')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'PROJECTS' ? 'bg-brand-surface text-white border border-brand-gray/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">BDS Projects</span>
          </button>

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-brand-surface uppercase tracking-wider">Reports</div>

          <button onClick={() => setCurrentView('ANALYTICS')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${currentView === 'ANALYTICS' ? 'bg-brand-surface text-white border border-brand-gray/20' : 'text-brand-gray hover:text-white hover:bg-brand-surface'}`}>
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </button>
        </nav>

        <div className="p-4 border-t border-brand-surface">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-gray/30 flex items-center justify-center text-xs font-bold text-brand-gray">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-bold text-white truncate">{user.name}</div>
               <div className="text-xs text-brand-gray truncate">Logged in securely</div>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="flex items-center gap-3 px-4 py-2 w-full text-brand-gray hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Handover Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="bg-brand-black/90 backdrop-blur-md border-b border-brand-surface p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentView === 'DASHBOARD' && 'Financial Overview'}
              {currentView === 'VENDORS' && 'Vendor Payables'}
              {currentView === 'CLIENTS' && 'Client Management'}
              {currentView === 'ASSETS' && 'Asset Inventory'}
              {currentView === 'PROJECTS' && 'BDS Programs'}
              {currentView === 'ANALYTICS' && 'Strategic Analytics'}
            </h2>
          </div>
          
          {currentView === 'VENDORS' && (
            <div className="flex items-center gap-6">
               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-brand-gray hover:text-white transition-colors"
                  title="Configure Algorithm"
                >
                  <Settings className="w-5 h-5" />
                </button>
              <div className="text-right">
                <label className="block text-[10px] font-bold text-brand-gray uppercase mb-1">Bank Balance</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray">$</span>
                  <input 
                    type="number" 
                    value={cashBalance}
                    onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)}
                    className="pl-6 pr-4 py-2 bg-brand-dark border border-brand-surface rounded-lg text-lg font-bold text-white w-40 focus:border-brand-red outline-none transition-colors text-right"
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        {/* View Router */}
        <div className="flex-1 overflow-hidden relative">
          
          {currentView === 'DASHBOARD' && (
             <div className="p-6 h-full overflow-y-auto">
                <DashboardStats invoices={processedVendorInvoices} availableCash={cashBalance} />
                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl">
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <div className="space-y-2">
                            <button onClick={() => setCurrentView('CLIENTS')} className="w-full text-left p-3 hover:bg-brand-surface rounded border border-transparent hover:border-brand-gray/20 transition-all flex justify-between items-center group">
                                <span className="text-brand-gray group-hover:text-white">New Tenant Onboarding</span>
                                <Users className="w-4 h-4 text-brand-surface group-hover:text-white" />
                            </button>
                            <button onClick={() => setCurrentView('VENDORS')} className="w-full text-left p-3 hover:bg-brand-surface rounded border border-transparent hover:border-brand-gray/20 transition-all flex justify-between items-center group">
                                <span className="text-brand-gray group-hover:text-white">Run Payment Batch</span>
                                <CreditCard className="w-4 h-4 text-brand-surface group-hover:text-white" />
                            </button>
                            <button onClick={() => setCurrentView('PROJECTS')} className="w-full text-left p-3 hover:bg-brand-surface rounded border border-transparent hover:border-brand-gray/20 transition-all flex justify-between items-center group">
                                <span className="text-brand-gray group-hover:text-white">Register New Contract</span>
                                <Briefcase className="w-4 h-4 text-brand-surface group-hover:text-white" />
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {currentView === 'VENDORS' && (
             <div className="p-6 h-full overflow-hidden flex flex-col">
                <VendorPayables 
                    invoices={processedVendorInvoices} 
                    onToggleStatus={handleToggleVendorStatus} 
                    onAddInvoice={handleAddVendorInvoice}
                    availableCash={cashBalance}
                />
             </div>
          )}

          {currentView === 'CLIENTS' && (
            <ClientManager 
                clients={clients} 
                invoices={clientInvoices}
                onAddClient={handleAddClient}
                onAddInvoice={handleAddClientInvoice}
                onToggleReceipt={handleToggleReceipt}
            />
          )}

          {currentView === 'ASSETS' && (
            <AssetTracker 
                assets={assets} 
                onAddAsset={handleAddAsset} 
                onBulkAdd={handleBulkAddAssets} 
            />
          )}
          
          {currentView === 'PROJECTS' && (
            <ProjectManager 
                projects={projects}
                onAddProject={handleAddProject}
            />
          )}

          {currentView === 'ANALYTICS' && (
              <AnalyticsDashboard 
                clients={clients}
                invoices={clientInvoices}
                projects={projects}
                goals={analyticsGoals}
                onUpdateGoals={setAnalyticsGoals}
              />
          )}

        </div>
      </main>

      <SettingsPanel 
        settings={settings} 
        setSettings={setSettings} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <section className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 italic">
        <footer className="mt-24 text-sm font-mono text-neutral-600">
              <p>Designed & Built by Monarch</p>
              <p className="mt-2 text-xs">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </section>
    </div>
  );
};

export default App;
