import React, { useCallback, useRef, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { AppSettings } from '../types';
import { persistAllToLocal } from '../utils';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
  onImportData?: (payload: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, isOpen, onClose, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (onImportData) onImportData(json);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Invalid JSON file. Please provide a valid export JSON.');
    }
  }, [onImportData]);

  const handleChange = (key: keyof AppSettings, value: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none">
      {/* overlay - fade in/out - captures clicks to close */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* sliding panel - transforms in from the right */}
      <aside
        className={`absolute right-0 top-0 bottom-0 w-96 bg-brand-dark border-l border-brand-surface p-6 overflow-y-auto transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isOpen}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Settings</h3>
          <button onClick={onClose} aria-label="Close" className="text-sm px-3 py-1 bg-brand-surface rounded">Close</button>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-black p-4 rounded-lg border border-brand-surface text-sm text-brand-gray mb-6">
            Configure how the system ranks Vendor Invoices for payment.
          </div>

          {[
            { label: 'Vendor Importance', key: 'weightImportance', desc: 'Weight of Critical/High tags' },
            { label: 'Invoice Age', key: 'weightAge', desc: 'Prioritize older bills' },
            { label: 'Amount Impact', key: 'weightAmount', desc: 'Prioritize larger bills' }
          ].map((item) => (
            <div key={item.key}>
              <div className="flex justify-between mb-2">
                <label className="font-semibold text-white flex items-center gap-2">
                  {item.label}
                </label>
                <span className="font-mono bg-brand-black px-2 py-0.5 rounded text-sm text-brand-red border border-brand-surface">
                  {settings[item.key as keyof AppSettings]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings[item.key as keyof AppSettings]}
                onChange={(e) => handleChange(item.key as keyof AppSettings, parseInt(e.target.value))}
                className="w-full h-2 bg-brand-surface rounded-lg appearance-none cursor-pointer accent-brand-red"
              />
              <p className="text-xs text-brand-gray mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-bold mb-2">Import / Export Data</h4>
          <div
            className={`border-dashed border-2 rounded p-4 text-center ${isDragging ? 'border-brand-red/50 bg-brand-surface/30' : 'border-brand-surface'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            role="button"
            aria-label="Drop JSON file to import"
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="application/json" onChange={onFileChange} />
            <p className="text-sm text-brand-gray mb-2">Drag & drop a data JSON here to replace the app data locally.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 bg-brand-surface text-brand-gray rounded text-sm">Upload JSON</button>
              <button onClick={() => { if (confirm('This will overwrite your local data with defaults from public/data.json. Proceed?')) window.location.reload(); }} className="px-3 py-1 bg-brand-surface text-brand-gray rounded text-sm">Reset To Seed</button>
            </div>
          </div>
          <p className="mt-4 text-xs text-brand-gray">Importing replaces current app data locally (localStorage). To persist changes to public/data.json run the local script (dev-only).</p>
        </div>
      </aside>
    </div>
  );
};

export default SettingsPanel;