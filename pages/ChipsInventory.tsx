import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Cpu, Signal, Wifi, Smartphone, Save, X } from 'lucide-react';
import { SatelliteChip } from '../types';

const ChipsInventory: React.FC = () => {
    const [chips, setChips] = useState<SatelliteChip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingChip, setEditingChip] = useState<SatelliteChip | null>(null);
    const [formData, setFormData] = useState<Partial<SatelliteChip>>({
        type: 'Iridium',
        status: 'Disponible'
    });

    useEffect(() => {
        fetchChips();
    }, []);

    const fetchChips = async () => {
        try {
            const res = await fetch('/api/chips');
            const data = await res.json();
            setChips(data);
        } catch (error) {
            console.error('Error fetching chips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingChip
                ? `/api/chips/${editingChip.id}`
                : '/api/chips';

            const method = editingChip ? 'PUT' : 'POST';

            const body = {
                ...formData,
                id: editingChip ? editingChip.id : `CHIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                fetchChips();
                setShowModal(false);
                setEditingChip(null);
                setFormData({ type: 'Iridium', status: 'Disponible' });
            }
        } catch (error) {
            console.error('Error saving chip:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este chip?')) return;
        try {
            await fetch(`/api/chips/${id}`, { method: 'DELETE' });
            fetchChips();
        } catch (error) {
            console.error('Error deleting chip:', error);
        }
    };

    const openEdit = (chip: SatelliteChip) => {
        setEditingChip(chip);
        setFormData(chip);
        setShowModal(true);
    };

    const filteredChips = chips.filter(chip => {
        const matchesSearch = chip.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chip.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || chip.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Chips Satelitales</h1>
                    <p className="text-slate-500 font-medium">Gestión de tarjetas SIM Iridium e Inmarsat</p>
                </div>
                <button
                    onClick={() => { setEditingChip(null); setFormData({ type: 'Iridium', status: 'Disponible' }); setShowModal(true); }}
                    className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/30"
                >
                    <Plus className="w-5 h-5" /> Nuevo Chip
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por número o notas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Filter className="w-5 h-5 text-slate-400" />
                    {['all', 'Disponible', 'Prestado', 'Mantenimiento', 'Baja'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                                    ? 'bg-[#1e3a8a] text-white shadow-md'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                        >
                            {status === 'all' ? 'Todos' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChips.map(chip => (
                    <div key={chip.id} className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border border-slate-100 group relative">
                        <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${chip.status === 'Disponible' ? 'bg-green-100 text-green-700' :
                                chip.status === 'Prestado' ? 'bg-blue-100 text-blue-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {chip.status}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${chip.type === 'Iridium' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {chip.type === 'Iridium' ? <Wifi className="w-7 h-7" /> : <Signal className="w-7 h-7" />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{chip.type}</p>
                                <h3 className="text-lg font-black text-slate-800">{chip.number}</h3>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {chip.plan && (
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                                    <Cpu className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{chip.plan}</span>
                                </div>
                            )}
                            {chip.notes && (
                                <div className="text-sm text-slate-500 italic px-2">
                                    "{chip.notes}"
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                            <button onClick={() => openEdit(chip)} className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                <Edit className="w-4 h-4" /> Editar
                            </button>
                            <button onClick={() => handleDelete(chip.id)} className="flex-1 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-[#1e3a8a]">
                                {editingChip ? 'Editar Chip' : 'Nuevo Chip'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Chip</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Iridium', 'Inmarsat'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type as any })}
                                            className={`py-4 rounded-xl font-bold transition-all ${formData.type === type
                                                    ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20'
                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número de Chip / SIM</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.number || ''}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#1e3a8a]/20 font-bold text-lg"
                                    placeholder="Ej: 8901..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#1e3a8a]/20 font-bold text-sm"
                                    >
                                        <option value="Disponible">Disponible</option>
                                        <option value="Prestado">Prestado</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                        <option value="Baja">Baja</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan / Contrato</label>
                                    <input
                                        type="text"
                                        value={formData.plan || ''}
                                        onChange={e => setFormData({ ...formData, plan: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#1e3a8a]/20 font-medium text-sm"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones</label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#1e3a8a]/20 font-medium text-sm"
                                    placeholder="Detalles adicionales..."
                                    rows={3}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" /> Guardar Chip
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChipsInventory;
