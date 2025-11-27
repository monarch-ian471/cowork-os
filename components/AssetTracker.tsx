
import React, { useState } from 'react';
import { Asset } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Package, Plus, Search, Tag, Upload } from 'lucide-react';

interface AssetTrackerProps {
    assets: Asset[];
    onAddAsset: (asset: Asset) => void;
    onBulkAdd: (assets: Asset[]) => void;
}

export const AssetTracker: React.FC<AssetTrackerProps> = ({ assets, onAddAsset, onBulkAdd }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({});

  const handleAdd = () => {
    if (newAsset.name && newAsset.value) {
      onAddAsset({
        id: generateId('AST'),
        name: newAsset.name,
        category: (newAsset.category as any) || 'Furniture',
        value: Number(newAsset.value),
        purchaseDate: new Date().toISOString().split('T')[0],
        location: newAsset.location || 'Storage',
      });
      setIsAddOpen(false);
      setNewAsset({});
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          const lines = text.split('\n').slice(1); // Skip header
          const bulkAssets: Asset[] = [];
          
          lines.forEach(line => {
              const cols = line.split(',');
              if (cols.length >= 3) {
                  bulkAssets.push({
                      id: generateId('AST'),
                      name: cols[0]?.trim() || 'Unknown Item',
                      category: (cols[1]?.trim() as any) || 'Supplies',
                      value: parseFloat(cols[2]) || 0,
                      location: cols[3]?.trim() || 'Storage',
                      purchaseDate: new Date().toISOString().split('T')[0]
                  });
              }
          });
          
          if(bulkAssets.length > 0) onBulkAdd(bulkAssets);
      };
      reader.readAsText(file);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-brand-red" />
            Inventory & Assets
          </h2>
          <p className="text-brand-gray text-sm">Track office supplies, furniture, and equipment.</p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                 <button className="flex items-center gap-2 bg-brand-black border border-brand-surface hover:bg-brand-surface text-brand-gray px-4 py-2 rounded-lg transition-colors text-sm">
                    <Upload className="w-4 h-4" /> Bulk Import (CSV)
                 </button>
                 <input type="file" onChange={handleCSVUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv" />
            </div>
            
            <button 
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2 bg-brand-surface hover:bg-brand-gray/20 text-white px-4 py-2 rounded-lg border border-brand-surface transition-colors"
            >
                <Plus className="w-4 h-4" />
                Log Asset
            </button>
        </div>
      </div>

      <div className="bg-brand-dark border border-brand-surface rounded-xl overflow-hidden shadow-lg flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-black/50 text-brand-gray text-xs uppercase tracking-wider border-b border-brand-surface">
                <th className="p-4">Asset ID</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-surface">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-brand-surface/30 transition-colors group">
                  <td className="p-4 font-mono text-xs text-brand-gray group-hover:text-white">{asset.id}</td>
                  <td className="p-4 font-medium text-white">{asset.name}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-surface text-xs text-brand-gray border border-brand-black">
                      <Tag className="w-3 h-3" />
                      {asset.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-brand-gray">{asset.location}</td>
                  <td className="p-4 text-right font-mono text-white">{formatCurrency(asset.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-dark border border-brand-surface rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Log New Asset</h3>
            <div className="space-y-4">
              <input 
                placeholder="Asset Name" 
                className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded focus:border-brand-red outline-none"
                onChange={e => setNewAsset({...newAsset, name: e.target.value})}
              />
              <select 
                className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded focus:border-brand-red outline-none"
                onChange={e => setNewAsset({...newAsset, category: e.target.value as any})}
              >
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
                <option value="Supplies">Supplies</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              <input 
                placeholder="Value ($)" 
                type="number"
                className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded focus:border-brand-red outline-none"
                onChange={e => setNewAsset({...newAsset, value: e.target.value as any})}
              />
              <input 
                placeholder="Location" 
                className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded focus:border-brand-red outline-none"
                onChange={e => setNewAsset({...newAsset, location: e.target.value})}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-brand-gray hover:text-white">Cancel</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-red text-white rounded hover:bg-brand-redHover">Save Asset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
