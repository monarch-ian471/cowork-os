import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DashboardStats } from './components/DashboardStats';
import { VendorPayables } from './components/InvoiceWaterline';
import SettingsPanel from './components/SettingsPanel'; // default import
import { LoginPage } from './components/LoginPage';
import { AssetTracker } from './components/AssetTracker';
import { ClientManager } from './components/ClientManager';
import { ProjectManager } from './components/ProjectManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { VendorInvoice, AppSettings, Importance, InvoiceStatus, User, Client, ClientInvoice, Asset, Project, AnalyticsGoals, View } from './types';
import { processInvoices, generateId } from './utils';
import { LayoutDashboard, Users, Package, CreditCard, Settings, LogOut, Briefcase, BarChart3 } from 'lucide-react';
import { LS_KEYS, DEFAULT_SEED } from './constants';
import { loadSeedData, readLocalData, persistAllToLocal, downloadJSON } from './utils';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LS_KEYS.LOGO) || null;
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (logoUrl) {
      try {
        localStorage.setItem(LS_KEYS.LOGO, logoUrl);
      } catch (e) { /* ignore localStorage errors */ }
    } else {
      try {
        localStorage.removeItem(LS_KEYS.LOGO);
      } catch (e) { /* ignore localStorage errors */ }
    }
  }, [logoUrl]);

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    // reset input so re-uploading same file retriggers onChange
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = () => setLogoUrl(null);

  // ----- GLOBAL STATE (Database Simulation) -----
  // Replace direct initial arrays with empty states; we'll load them
  const [cashBalance, setCashBalance] = useState<number>(DEFAULT_SEED.defaults.cashBalance);
  const [vendorInvoices, setVendorInvoices] = useState<VendorInvoice[]>(DEFAULT_SEED.vendorInvoices);
  const [clients, setClients] = useState<Client[]>(DEFAULT_SEED.clients);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>(DEFAULT_SEED.clientInvoices);
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_SEED.assets);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_SEED.projects);
  const [companyInfo, setCompanyInfo] = useState<{ name?: string; builtBy?: string; copyrightYear?: number}>({
    name: DEFAULT_SEED.company.name,
    builtBy: DEFAULT_SEED.company.builtBy,
    copyrightYear: DEFAULT_SEED.company?.copyrightYear ?? new Date().getFullYear()
  });

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

  // Load seed data and local overrides once during mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const seed = await loadSeedData();
      const local = readLocalData();

      const source = local || seed || null;
      if (!source) return;

      if (!cancelled) {
        setCashBalance(source.defaults?.cashBalance ?? 15000);
        setVendorInvoices(source.vendorInvoices ?? []);
        setClients(source.clients ?? []);
        setClientInvoices(source.clientInvoices ?? []);
        setAssets(source.assets ?? []);
        setProjects(source.projects ?? []);
        setCompanyInfo({
          name: source.company?.name ?? 'CoWork OS',
          builtBy: source.company?.builtBy ?? 'Monarch',
          copyrightYear: source.company?.copyrightYear ?? new Date().getFullYear()
        });

        // override settings/analytics goals
        if (source.defaults?.settings) setSettings(source.defaults.settings);
        if (source.defaults?.analyticsGoals) setAnalyticsGoals(source.defaults.analyticsGoals);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  // Save current app data to localStorage whenever these change
  useEffect(() => {
    const payload = {
      company: companyInfo,
      defaults: {
        cashBalance,
        settings,
        analyticsGoals,
      },
      users: [], // you can keep users if you need; not overwriting
      vendorInvoices,
      clients,
      clientInvoices,
      assets,
      projects
    };
    persistAllToLocal(payload);
  }, [companyInfo, cashBalance, vendorInvoices, clients, clientInvoices, assets, projects, settings, analyticsGoals]);

  // Utility to export data
  const handleExportData = () => {
    const payload = {
      company: companyInfo,
      defaults: {
        cashBalance,
        settings,
        analyticsGoals
      },
      vendorInvoices,
      clients,
      clientInvoices,
      assets,
      projects,
    };
    downloadJSON(payload, 'cowork-data-export.json');
  };

  // Update all add handlers to persist by virtue of the useEffect above
  const handleAddClient = (client: Client) => {
    setClients(prev => {
      const newState = [...prev, client];
      // persistAllToLocal can be called now or let effect handle it
      return newState;
    });
  };
  const handleAddClientInvoice = (inv: ClientInvoice) => setClientInvoices(prev => [...prev, inv]);
  const handleAddVendorInvoice = (invoice: VendorInvoice) => setVendorInvoices(prev => [...prev, invoice]);
  const handleAddAsset = (asset: Asset) => setAssets(prev => [...prev, asset]);
  const handleBulkAddAssets = (newAssets: Asset[]) => setAssets(prev => [...prev, ...newAssets]);
  const handleAddProject = (project: Project) => setProjects(prev => [...prev, project]);

  // Additionally allow user to reset and re-load seed
  const handleResetToSeed = async () => {
    localStorage.removeItem(LS_KEYS.DATA);
    const seed = await loadSeedData();
    if (!seed) return;
    setCashBalance(seed.defaults?.cashBalance ?? 15000);
    setVendorInvoices(seed.vendorInvoices ?? []);
    setClients(seed.clients ?? []);
    setClientInvoices(seed.clientInvoices ?? []);
    setAssets(seed.assets ?? []);
    setProjects(seed.projects ?? []);
    setCompanyInfo({
      name: seed.company?.name ?? 'CoWork OS',
      builtBy: seed.company?.builtBy ?? 'Monarch',
      copyrightYear: seed.company?.copyrightYear ?? new Date().getFullYear()
    });
    if (seed.defaults?.settings) setSettings(seed.defaults.settings);
    if (seed.defaults?.analyticsGoals) setAnalyticsGoals(seed.defaults.analyticsGoals);
  };

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

  // ----- CLIENT LOGIC -----
  const handleToggleReceipt = (id: string) => {
      setClientInvoices(prev => prev.map(inv => {
          if (inv.id === id) return { ...inv, isReceiptIssued: !inv.isReceiptIssued };
          return inv;
      }));
  };

  // ----- ASSET LOGIC -----
  // ----- PROJECT LOGIC -----

  // Utility to import data JSON into app state (invoked by SettingsPanel)
  const handleImportData = async (payload: any) => {
    // simple validation - must be object
    if (!payload || typeof payload !== 'object') {
      // eslint-disable-next-line no-alert
      alert('Invalid import payload; import cancelled.');
      return;
    }
    try {
      setCompanyInfo({
        name: payload.company?.name ?? companyInfo.name,
        builtBy: payload.company?.builtBy ?? companyInfo.builtBy,
        copyrightYear: payload.company?.copyrightYear ?? companyInfo.copyrightYear,
      });

      setCashBalance(payload.defaults?.cashBalance ?? cashBalance);
      if (payload.defaults?.settings) setSettings(payload.defaults.settings);
      if (payload.defaults?.analyticsGoals) setAnalyticsGoals(payload.defaults.analyticsGoals);

      setVendorInvoices(payload.vendorInvoices ?? []);
      setClients(payload.clients ?? []);
      setClientInvoices(payload.clientInvoices ?? []);
      setAssets(payload.assets ?? []);
      setProjects(payload.projects ?? []);

      // persist now to localStorage as JSON
      persistAllToLocal(payload);
      // eslint-disable-next-line no-alert
      alert('Data imported locally. Export to persist to file or use the dev save script to overwrite public/data.json.');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Failed to import: ' + String(err));
    }
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="flex h-screen bg-brand-black text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark border-r border-brand-surface flex flex-col">
          <div className="p-6 border-b border-brand-surface">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded overflow-hidden bg-brand-surface flex items-center justify-center border border-transparent transition-all group hover:border-brand-red/40 focus-within:border-brand-red/40"
                  title="Company logo"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Cowork logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-brand-red flex items-center justify-center text-white font-black">CW</div>
                  )}
                </div>

                <div>
                  <h1 className="text-xl font-black text-white tracking-tighter">COWORK OS</h1>
                  <p className="text-xs text-brand-gray mt-1">v2.1 • {user.role === 'ADMIN_OPS' ? 'OPS' : 'FINANCE'}</p>
                </div>
              </div>

              <div className="flex gap-2 items-center mt-1">
                <input
                  ref={logoInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                  aria-label="Upload company logo"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs px-3 py-1 bg-brand-surface text-brand-gray hover:text-white rounded"
                  title="Upload logo"
                >
                  Upload
                </button>
                {logoUrl && (
                  <button
                    onClick={handleRemoveLogo}
                    className="text-xs px-3 py-1 text-brand-red bg-brand-red/10 hover:bg-brand-red/20 rounded"
                    title="Remove logo"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
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

          <div className="p-4 border-t border-brand-surface flex flex-col">
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

            {/* Footer moved into sidebar, centered below handover session to avoid overlapping visuals */}
            <div className="mt-4 pt-3 text-center text-xs text-white/50">
              <p>{companyInfo.builtBy ? `Designed & Built by ${companyInfo.builtBy}` : 'Designed & Built by Monarch'}</p>
              <p className="mt-1 text-[10px]">© {companyInfo.copyrightYear ?? new Date().getFullYear()} All rights reserved.</p>
            </div>
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

          {/* Right-side controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-brand-gray hover:text-white transition-colors"
              title="Configure Algorithm"
            >
              <Settings className="w-5 h-5" />
            </button>

            {currentView === 'VENDORS' && (
              <div className="flex items-center gap-6">
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
          </div>
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
        onImportData={handleImportData}
      />
    </div>
  );
};

export default App;
