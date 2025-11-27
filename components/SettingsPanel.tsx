import React from 'react';
import { AppSettings } from '../types';
import { Sliders, HelpCircle } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof AppSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-brand-dark h-full shadow-2xl p-6 border-l border-brand-surface overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-red" />
            Priority Algorithm
          </h2>
          <button onClick={onClose} className="text-brand-gray hover:text-white text-2xl">
            &times;
          </button>
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

        <div className="mt-12 pt-6 border-t border-brand-surface">
             <button onClick={onClose} className="w-full py-3 bg-brand-red text-white rounded-lg hover:bg-brand-redHover font-semibold transition-colors shadow-lg shadow-brand-red/20">
                 Save Configuration
             </button>
        </div>
      </div>
    </div>
  );
};