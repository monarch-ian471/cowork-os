
import React, { useState } from 'react';
import { Project } from '../types';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Briefcase, Plus, Calendar, User, DollarSign, Info } from 'lucide-react';

interface ProjectManagerProps {
    projects: Project[];
    onAddProject: (p: Project) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onAddProject }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState<Partial<Project>>({ status: 'Planning' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProject.name && newProject.contractValue) {
            onAddProject({
                id: generateId('PRJ'),
                name: newProject.name,
                clientName: newProject.clientName || 'Internal',
                contractValue: Number(newProject.contractValue),
                contactPerson: newProject.contactPerson || 'N/A',
                startDate: newProject.startDate || new Date().toISOString().split('T')[0],
                endDate: newProject.endDate || new Date().toISOString().split('T')[0],
                status: 'Active',
                invoicingNotes: newProject.invoicingNotes || ''
            });
            setIsModalOpen(false);
            setNewProject({ status: 'Planning' });
        }
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="text-brand-red" />
                        BDS Projects & Programs
                    </h2>
                    <p className="text-brand-gray text-sm">Track contracts, values, and project durations.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-brand-redHover transition-colors shadow-lg shadow-brand-red/20 font-bold"
                >
                    <Plus className="w-4 h-4" /> New Contract
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                {projects.map(project => (
                    <div key={project.id} className="bg-brand-dark border border-brand-surface rounded-xl p-5 hover:border-brand-gray/50 transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-white">{project.name}</h3>
                                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-900 text-[10px] px-2 py-0.5 rounded uppercase font-bold">{project.status}</span>
                            </div>
                            
                            <div className="text-sm text-brand-gray mb-4">{project.clientName}</div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-brand-gray">
                                    <User className="w-4 h-4" />
                                    <span>{project.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-brand-gray">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-white">
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                    <span>{formatCurrency(project.contractValue)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-brand-surface">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                                <p className="text-xs text-brand-gray italic">{project.invoicingNotes || "No notes available."}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-brand-dark border border-brand-surface p-6 rounded-xl w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Register New Contract</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-brand-gray uppercase font-bold">Project Name</label>
                                <input required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-brand-gray uppercase font-bold">Client</label>
                                    <input required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, clientName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs text-brand-gray uppercase font-bold">Contact Person</label>
                                    <input required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, contactPerson: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-brand-gray uppercase font-bold">Start Date</label>
                                    <input type="date" required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs text-brand-gray uppercase font-bold">End Date</label>
                                    <input type="date" required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-brand-gray uppercase font-bold">Contract Value</label>
                                <input type="number" required className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded" onChange={e => setNewProject({...newProject, contractValue: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="text-xs text-brand-gray uppercase font-bold">Invoicing/Receipt Notes</label>
                                <textarea className="w-full bg-brand-black border border-brand-surface text-white p-3 rounded h-20" onChange={e => setNewProject({...newProject, invoicingNotes: e.target.value})}></textarea>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-brand-gray hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded font-bold">Create Contract</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
