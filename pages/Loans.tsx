
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { Equipment, Loan, User, EquipmentStatus, Employee, LoanItem, SatelliteChip } from '../types';
import {
   Printer, Save, Trash2, Plus, Search, CheckCircle,
   AlertTriangle, FileText, User as UserIcon, Shield,
   Clock, Hash, Smartphone, Send, ChevronRight, Laptop,
   Cpu, History, Download, ArrowUpRight, Check, X, Info, MapPin,
   Eye, BadgeCheck, ExternalLink
} from 'lucide-react';

interface LoansPageProps {
   user: User;
}

const RANGOS_SENAN = ["Agente", "Cabo 2do.", "Cabo 1ro.", "Sargento 2do.", "Sargento 1ro.", "Subteniente", "Teniente", "Capitán", "Mayor", "Subcomisionado", "Comisionado", "Civil"];
const MISSION_TYPES = ['Operativa', 'Administrativa', 'Capacitación', 'Mantenimiento', 'Comisión', 'Otro'];
const ACCESSORIES_LIST = ['Cargador', 'Cable USB/datos', 'Batería adicional', 'Estuche/maletín', 'Manual'];



// COMPONENTE: VISOR DE EXPEDIENTE (MODO LECTURA / EDICIÓN)
const LoanViewer: React.FC<{ loan: Loan, onClose: () => void, chips: SatelliteChip[], onUpdate: () => void }> = ({ loan, onClose, chips, onUpdate }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [editedLoan, setEditedLoan] = useState<Loan>(loan);
   const [saving, setSaving] = useState(false);

   useEffect(() => {
      setEditedLoan(loan);
   }, [loan]);

   const handleSave = async () => {
      try {
         setSaving(true);
         await storage.updateLoan(editedLoan);
         onUpdate();
         setIsEditing(false);
         alert('Préstamo actualizado correctamente');
      } catch (error) {
         console.error('Error updating loan:', error);
         alert('Error al actualizar el préstamo');
      } finally {
         setSaving(false);
      }
   };

   const updateItem = (idx: number, field: keyof LoanItem, value: any) => {
      const newItems = [...editedLoan.items];
      newItems[idx] = { ...newItems[idx], [field]: value };
      setEditedLoan({ ...editedLoan, items: newItems });
   };

   const toggleItemAccessory = (idx: number, acc: string) => {
      const newItems = [...editedLoan.items];
      const current = newItems[idx].accessories;
      newItems[idx].accessories = current.includes(acc) ? current.filter(a => a !== acc) : [...current, acc];
      setEditedLoan({ ...editedLoan, items: newItems });
   };

   return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
         <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-10">
               <div className="flex items-center gap-5">
                  <div className={`p-4 ${isEditing ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-3xl shadow-xl transition-colors`}>
                     {isEditing ? <Save className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                        {isEditing ? 'Editando Expediente' : 'Expediente de Orden'}
                     </h3>
                     <p className={`text-sm font-mono font-black ${isEditing ? 'text-amber-600' : 'text-blue-600'} tracking-tighter`}>{loan.idOrden}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  {!isEditing ? (
                     <>
                        <button onClick={() => setIsEditing(true)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-amber-500 hover:text-white transition-all" title="Editar Préstamo"><div className="flex items-center gap-2"><div className="w-1 h-1 bg-current rounded-full" /><div className="w-4 h-1 bg-current rounded-full" /></div></button>
                        <button onClick={() => window.print()} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Printer className="w-6 h-6" /></button>
                        <button onClick={onClose} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                     </>
                  ) : (
                     <>
                        <button onClick={handleSave} disabled={saving} className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2 font-bold px-6">
                           {saving ? 'Guardando...' : <><Save className="w-5 h-5" /> GUARDAR CAMBIOS</>}
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditedLoan(loan); }} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all font-bold">CANCELAR</button>
                     </>
                  )}
               </div>
            </div>

            <div className="p-16 space-y-16">
               {/* RESUMEN INSTITUCIONAL */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-slate-100 pb-16">
                  <div className="space-y-8">
                     <div className="flex items-center gap-3 text-blue-600 mb-6"><UserIcon className="w-5 h-5" /><h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Solicitante Conforme</h4></div>
                     <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem]">
                        {isEditing ? (
                           <div className="space-y-4">
                              <input value={editedLoan.solicitante.nombre} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, nombre: e.target.value } })} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold" placeholder="Nombre" />
                              <div className="grid grid-cols-2 gap-4">
                                 <select value={editedLoan.solicitante.rango} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, rango: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold">{RANGOS_SENAN.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                 <input value={editedLoan.solicitante.placa} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, placa: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Placa" />
                              </div>
                              <input value={editedLoan.solicitante.departamento} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, departamento: e.target.value } })} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Departamento" />
                              <div className="grid grid-cols-2 gap-4">
                                 <input value={editedLoan.solicitante.email} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, email: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Email" />
                                 <input value={editedLoan.solicitante.telefono} onChange={e => setEditedLoan({ ...editedLoan, solicitante: { ...editedLoan.solicitante, telefono: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Teléfono" />
                              </div>
                           </div>
                        ) : (
                           <>
                              <p className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{loan.solicitante.nombre}</p>
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{loan.solicitante.rango} • PLACA #{loan.solicitante.placa}</p>
                              <div className="h-px bg-slate-200 my-4" />
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{loan.solicitante.departamento}</p>
                              <p className="text-xs font-bold text-blue-600">{loan.solicitante.email} • {loan.solicitante.telefono}</p>
                           </>
                        )}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <div className="flex items-center gap-3 text-blue-600 mb-6"><Shield className="w-5 h-5" /><h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Responsable de Entrega</h4></div>
                     <div className="space-y-4 bg-slate-50 p-8 rounded-[2rem]">
                        {isEditing ? (
                           <div className="space-y-4">
                              <input value={editedLoan.entregaResponsable.nombre} onChange={e => setEditedLoan({ ...editedLoan, entregaResponsable: { ...editedLoan.entregaResponsable, nombre: e.target.value } })} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold" placeholder="Nombre" />
                              <div className="grid grid-cols-2 gap-4">
                                 <select value={editedLoan.entregaResponsable.rango} onChange={e => setEditedLoan({ ...editedLoan, entregaResponsable: { ...editedLoan.entregaResponsable, rango: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold">{RANGOS_SENAN.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                 <input value={editedLoan.entregaResponsable.placa} onChange={e => setEditedLoan({ ...editedLoan, entregaResponsable: { ...editedLoan.entregaResponsable, placa: e.target.value } })} className="bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Placa" />
                              </div>
                              <input value={editedLoan.entregaResponsable.departamento} onChange={e => setEditedLoan({ ...editedLoan, entregaResponsable: { ...editedLoan.entregaResponsable, departamento: e.target.value } })} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold" placeholder="Departamento" />
                           </div>
                        ) : (
                           <>
                              <p className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{loan.entregaResponsable.nombre}</p>
                              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{loan.entregaResponsable.rango} • PLACA #{loan.entregaResponsable.placa}</p>
                              <div className="h-px bg-slate-200 my-4" />
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{loan.entregaResponsable.departamento}</p>
                           </>
                        )}
                     </div>
                  </div>
               </div>

               {/* LISTADO DE EQUIPOS */}
               <div className="space-y-8">
                  <div className="flex items-center gap-3 text-blue-600"><Laptop className="w-5 h-5" /><h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Equipos Asignados en Orden</h4></div>
                  <div className="rounded-[2.5rem] border border-slate-200 overflow-visible shadow-sm">
                     <table className="w-full text-left">
                        <thead className="bg-[#1e3a8a] text-white text-[9px] font-black uppercase tracking-widest">
                           <tr><th className="px-8 py-5">Equipo</th><th className="px-8 py-5">S/N / Chip</th><th className="px-8 py-5">Condición</th><th className="px-8 py-5">Accesorios</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {(isEditing ? editedLoan.items : loan.items).map((it, idx) => (
                              <tr key={it.equipmentId} className="hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-6"><p className="text-sm font-black text-slate-800 uppercase">{it.brand} {it.model}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{it.category}</p></td>
                                 <td className="px-8 py-6">
                                    <p className="text-xs font-mono font-black text-blue-700 tracking-tight">S/N: {it.serialNumber}</p>
                                    {isEditing && (it.category.includes('Satelital') || it.brand.includes('Iridium') || it.brand.includes('Inmarsat')) ? (
                                       <div className="mt-2 text-left">
                                          <ChipSelector
                                              chips={chips}
                                              selectedChipId={it.chipId}
                                              selectedChipNumber={it.chipNumber}
                                              onSelect={(selectedChipId, selectedChipNumber) => {
                                                 if (!selectedChipId && !selectedChipNumber) {
                                                    updateItem(idx, 'chipId', undefined);
                                                    updateItem(idx, 'chipNumber', 'N/A');
                                                    return;
                                                 }
                                                 if (!selectedChipId && selectedChipNumber) {
                                                     updateItem(idx, 'chipId', undefined);
                                                     updateItem(idx, 'chipNumber', selectedChipNumber);
                                                     return;
                                                 }
                                                 const selectedChip = chips.find(c => c.id === selectedChipId);
                                                 updateItem(idx, 'chipId', selectedChipId);
                                                 updateItem(idx, 'chipNumber', selectedChip ? selectedChip.number : 'N/A');
                                              }}
                                           />
                                       </div>
                                    ) : (
                                       <p className="text-[9px] text-slate-400 font-bold uppercase">CHIP: {it.chipNumber}</p>
                                    )}
                                 </td>
                                 <td className="px-8 py-6">
                                    {isEditing ? (
                                       <select value={it.exitCondition} onChange={e => updateItem(idx, 'exitCondition', e.target.value)} className="bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold">
                                          <option value="Excelente">Excelente</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Con observaciones">Observaciones</option>
                                       </select>
                                    ) : (
                                       <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-blue-600 rounded-lg uppercase">{it.exitCondition}</span>
                                    )}
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex flex-wrap gap-1">
                                       {isEditing ? ACCESSORIES_LIST.map(acc => (
                                          <button key={acc} type="button" onClick={() => toggleItemAccessory(idx, acc)} className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase transition-all ${it.accessories.includes(acc) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{acc}</button>
                                       )) : it.accessories.map(acc => <span key={acc} className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 uppercase">{acc}</span>)}
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* MISIÓN */}
               <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-blue-400"><MapPin className="w-5 h-5" /><h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Detalles de Misión Táctica</h4></div>
                        {isEditing ? (
                           <select value={editedLoan.mission.tipo} onChange={e => setEditedLoan({ ...editedLoan, mission: { ...editedLoan.mission, tipo: e.target.value as any } })} className="bg-slate-800 text-white border-0 rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{MISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        ) : (
                           <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{loan.mission.tipo}</span>
                        )}
                     </div>
                     <div className="grid grid-cols-2 gap-10 pt-4">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino</p>
                           {isEditing ? (
                              <input value={editedLoan.mission.destino} onChange={e => setEditedLoan({ ...editedLoan, mission: { ...editedLoan.mission, destino: e.target.value } })} className="w-full bg-slate-800 text-white border-0 rounded-xl p-2 text-lg font-bold uppercase tracking-tight" />
                           ) : (
                              <p className="text-xl font-bold uppercase tracking-tight text-white">{loan.mission.destino}</p>
                           )}
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Retorno Programado</p>
                           {isEditing ? (
                              <input type="datetime-local" value={editedLoan.mission.fechaRetornoProgramada} onChange={e => setEditedLoan({ ...editedLoan, mission: { ...editedLoan.mission, fechaRetornoProgramada: e.target.value } })} className="w-full bg-slate-800 text-white border-0 rounded-xl p-2 text-lg font-bold" />
                           ) : (
                              <p className="text-xl font-bold uppercase tracking-tight text-blue-200">{new Date(loan.mission.fechaRetornoProgramada).toLocaleString()}</p>
                           )}
                        </div>
                     </div>
                     <div className="pt-6 border-t border-white/10">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Justificación</p>
                        {isEditing ? (
                           <textarea value={editedLoan.mission.motivo} onChange={e => setEditedLoan({ ...editedLoan, mission: { ...editedLoan.mission, motivo: e.target.value } })} className="w-full bg-slate-800 text-white border-0 rounded-xl p-3 text-sm italic font-medium opacity-80" rows={3} />
                        ) : (
                           <p className="text-sm italic font-medium opacity-80 leading-relaxed">"{loan.mission.motivo}"</p>
                        )}
                     </div>
                  </div>
               </div>

               {/* FIRMAS (Solo Lectura) */}
               <div className="grid grid-cols-2 gap-16 pt-20">
                  <div className="text-center space-y-2">
                     <div className="w-3/4 mx-auto border-b-2 border-slate-800 mb-4"></div>
                     <p className="text-sm font-black text-[#1e3a8a] uppercase tracking-widest">FIRMA DEL SOLICITANTE</p>
                     <p className="text-xs font-bold text-slate-500 uppercase">({loan.solicitante.nombre})</p>
                  </div>
                  <div className="text-center space-y-2">
                     <div className="w-3/4 mx-auto border-b-2 border-slate-800 mb-4"></div>
                     <p className="text-sm font-black text-[#1e3a8a] uppercase tracking-widest">FIRMA DE AUTORIZACIÓN DNI</p>
                     <p className="text-xs font-bold text-slate-500 uppercase">({loan.entregaResponsable.nombre})</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const ChipSelector: React.FC<{
   chips: SatelliteChip[];
   selectedChipId: string | undefined;
   selectedChipNumber?: string;
   onSelect: (chipId: string | null, chipNumber?: string) => void;
}> = ({ chips = [], selectedChipId, selectedChipNumber, onSelect }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [search, setSearch] = useState('');
   const wrapperRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   useEffect(() => {
      if (isOpen) {
         setTimeout(() => inputRef.current?.focus(), 50);
      }
   }, [isOpen]);

   const filteredChips = useMemo(() => {
      if (!search) return chips;
      const term = search.toLowerCase().trim();
      return chips.filter(c =>
         String(c.number).toLowerCase().includes(term) ||
         String(c.type).toLowerCase().includes(term)
      );
   }, [chips, search]);

   const selectedChip = chips.find(c => c.id === selectedChipId);
   const displayText = selectedChip ? `${selectedChip.type} - ${selectedChip.number}` : (selectedChipNumber && selectedChipNumber !== 'N/A' ? `Manual: ${selectedChipNumber}` : 'Asignar Chip Satelital...');

   return (
      <div className="relative mt-2 min-w-[180px]" ref={wrapperRef}>
         {!isOpen ? (
            <button
               type="button"
               onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(true);
                  setSearch('');
               }}
               className={`w-full p-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all shadow-sm ${selectedChipId || (selectedChipNumber && selectedChipNumber !== 'N/A') ? 'bg-blue-50 border-blue-200 text-blue-800 ring-1 ring-blue-100' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
            >
               <span className="truncate mr-2">{displayText}</span>
               <ChevronRight className="w-3 h-3 opacity-50 rotate-90 flex-shrink-0" />
            </button>
         ) : (
            <div className="absolute z-50 top-0 left-0 w-full bg-white rounded-xl shadow-2xl border border-blue-100 animate-in zoom-in-95 duration-200 overflow-hidden ring-4 ring-black/5">
               <div className="p-2 border-b border-slate-50 relative bg-slate-50/50">
                  <Search className="w-3 h-3 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                     ref={inputRef}
                     type="text"
                     className="w-full pl-8 pr-2 py-2 text-[10px] font-bold bg-white border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
                     placeholder="Buscar chip..."
                     value={search}
                     onClick={(e) => e.stopPropagation()}
                     onChange={e => setSearch(e.target.value)}
                  />
               </div>
               <div className="max-h-60 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                  <button
                     type="button"
                     onClick={(e) => { e.stopPropagation(); onSelect(null); setIsOpen(false); }}
                     className="w-full text-left px-3 py-2.5 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                     <X className="w-3 h-3" />
                     -- Quitar Asignación --
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  {filteredChips.length > 0 ? filteredChips.map(c => (
                     <button
                        key={c.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelect(c.id, c.number); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${c.id === selectedChipId ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                     >
                        <span className={`block text-xs font-black ${c.id === selectedChipId ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-700'}`}>{c.number}</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5">{c.type} <span className="text-slate-300">•</span> {c.status}</span>
                     </button>
                  )) : (
                     <div className="px-3 py-8 text-center">
                        <Search className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">No encontrado</p>
                        {search && (
                           <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onSelect(null, search); setIsOpen(false); }}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md"
                           >
                              USAR MANUALMENTE: "{search}"
                           </button>
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

const LoansPage: React.FC<LoansPageProps> = ({ user }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const view = new URLSearchParams(location.search).get('v') || 'list';

   // Basic component state
   const [orderId, setOrderId] = useState('');
   const [currentDateTime, setCurrentDateTime] = useState('');
   const [inventory, setInventory] = useState<Equipment[]>([]);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [loans, setLoans] = useState<Loan[]>([]);
   const [chips, setChips] = useState<SatelliteChip[]>([]);
   const [intelSearch, setIntelSearch] = useState('');
   const [showIntel, setShowIntel] = useState(false);
   const [listSearch, setListSearch] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);

   // Moved form state declarations up to avoid "used before declaration" errors in subsequent hooks
   const [solicitante, setSolicitante] = useState({ placa: '', nombre: '', rango: '', departamento: '', telefono: '', email: '' });
   const [responsable, setResponsable] = useState({ placa: '', nombre: '', rango: '', departamento: '' });
   const [items, setItems] = useState<LoanItem[]>([]);
   const [mission, setMission] = useState({ destino: '', fechaRetornoProgramada: '', motivo: '', tipo: 'Operativa' as any, tipoOtro: '' });
   const [liability, setLiability] = useState(false);
   const [signatures, setSignatures] = useState({ solicitanteSalida: '', responsableEntrega: '' });

   const [selectedViewerLoan, setSelectedViewerLoan] = useState<Loan | null>(null);

   useEffect(() => {
      refreshData();
      const timer = setInterval(() => setCurrentDateTime(new Date().toLocaleString('es-PA')), 1000);
      return () => clearInterval(timer);
   }, [view]);

   // Autocompletado Solicitante
   useEffect(() => {
      if (solicitante.placa.length >= 3) {
         const found = employees.find(e => e.badgeNumber === solicitante.placa);
         if (found) setSolicitante(s => ({ ...s, nombre: `${found.name} ${found.lastName}`, rango: found.rank, departamento: found.department, telefono: found.phone, email: found.institutionalEmail }));
      }
   }, [solicitante.placa, employees]);

   // Autocompletado Responsable
   useEffect(() => {
      if (responsable.placa.length >= 3) {
         const found = employees.find(e => e.badgeNumber === responsable.placa);
         if (found) setResponsable(r => ({ ...r, nombre: `${found.name} ${found.lastName}`, rango: found.rank, departamento: found.department }));
      }
   }, [responsable.placa, employees]);

   const refreshData = async () => {
      try {
         const [equipData, empData, loansData, chipsData] = await Promise.all([
            storage.getEquipment(),
            storage.getEmployees(),
            storage.getLoans(),
            storage.getSatelliteChips()
         ]);

         setInventory(equipData.filter(e => e.status === EquipmentStatus.AVAILABLE));
         setEmployees(empData);
         setLoans(loansData.sort((a: Loan, b: Loan) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime()));
         setChips(chipsData);

         if (view === 'new') {
            const now = new Date();
            setOrderId(`TEC-SENAN-${now.getTime().toString().slice(-6)}-${now.toLocaleDateString('es-PA').replace(/\//g, '')}`);
         }
      } catch (error) {
         console.error("Error loading data:", error);
         setError("Error al cargar datos. Verifique la conexión.");
      }
   };

   const filteredInventory = useMemo(() => {
      if (!intelSearch) return [];
      const term = intelSearch.toLowerCase();
      return inventory.filter(e => e.serialNumber.toLowerCase().includes(term) || e.brand.toLowerCase().includes(term) || e.model.toLowerCase().includes(term) || e.category.toLowerCase().includes(term)).slice(0, 5);
   }, [inventory, intelSearch]);

   const addEquipment = (equip: Equipment) => {
      if (items.some(i => i.equipmentId === equip.id)) return alert("Equipo ya añadido.");
      const newItem: LoanItem = {
         equipmentId: equip.id,
         serialNumber: equip.serialNumber,
         category: equip.category,
         brand: equip.brand,
         model: equip.model,
         chipNumber: equip.chipNumber || 'N/A',
         exitCondition: 'Excelente',
         accessories: []
      };
      setItems([...items, newItem]);
      setIntelSearch('');
      setShowIntel(false);
   };

   const durationText = useMemo(() => {
      if (!mission.fechaRetornoProgramada) return '--';
      const start = new Date();
      const end = new Date(mission.fechaRetornoProgramada);
      const diff = end.getTime() - start.getTime();
      if (diff < 0) return 'Fecha inválida';
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return `${days} días, ${hours} horas`;
   }, [mission.fechaRetornoProgramada]);

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!liability) return setError('Debe aceptar la cláusula de responsabilidad.');
      if (items.length === 0) return setError('Añada al menos un equipo.');
      if (items.length === 0) return setError('Añada al menos un equipo.');
      // Firmas manuales ahora, se elimina validación de firma digital
      if (new Date(mission.fechaRetornoProgramada) <= new Date()) return setError('La fecha de retorno debe ser futura.');

      const newLoan: Loan = {
         id: crypto.randomUUID(),
         idOrden: orderId,
         loanDate: new Date().toISOString(),
         exitTime: new Date().toLocaleTimeString(),
         status: 'active',
         solicitante,
         entregaResponsable: responsable,
         items,
         mission,
         signatures,
         notes: '',
         liabilityAccepted: liability
      };

      try {
         await storage.addLoan(newLoan);
         setSuccess(true);
         setTimeout(() => navigate('/loans?v=list'), 2000);
      } catch (error) {
         console.error("Error saving loan:", error);
         setError("Error al guardar el préstamo.");
      }
   };

   const toggleAccessory = (idx: number, acc: string) => {
      const newItems = [...items];
      const current = newItems[idx].accessories;
      newItems[idx].accessories = current.includes(acc) ? current.filter(a => a !== acc) : [...current, acc];
      setItems(newItems);
   };

   return (
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in">
         {selectedViewerLoan && <LoanViewer loan={selectedViewerLoan} onClose={() => setSelectedViewerLoan(null)} />}

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
            <div className="flex items-center gap-4">
               <div className="bg-[#1e3a8a] p-4 rounded-3xl shadow-xl text-white"><ArrowUpRight className="w-8 h-8" /></div>
               <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight uppercase">Préstamos DNI</h2>
                  <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Servicio Nacional Aeronaval</p>
               </div>
            </div>
            <div className="flex bg-white p-2 rounded-2xl border border-slate-200 shadow-sm gap-2">
               <button onClick={() => navigate('/loans?v=list')} className={`px-8 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${view === 'list' ? 'bg-[#1e3a8a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><History className="w-4 h-4" /> Historial</button>
               <button onClick={() => navigate('/loans?v=new')} className={`px-8 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${view === 'new' ? 'bg-[#1e3a8a] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Plus className="w-4 h-4" /> Nueva Orden</button>
            </div>
         </div>

         {view === 'list' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
               <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-6 group">
                  <Search className="w-7 h-7 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Buscar por placa, oficial o ID de orden..." className="flex-1 bg-transparent text-lg font-bold focus:outline-none" />
               </div>
               <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-[#1e3a8a] text-white uppercase text-[10px] font-black tracking-widest">
                        <tr><th className="px-10 py-7">Orden / Trazabilidad</th><th className="px-10 py-7">Solicitante</th><th className="px-10 py-7">Estado</th><th className="px-10 py-7 text-center">Acciones</th></tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loans.filter(l => l.idOrden.toLowerCase().includes(listSearch.toLowerCase()) || l.solicitante.nombre.toLowerCase().includes(listSearch.toLowerCase()) || l.solicitante.placa.includes(listSearch)).map(l => (
                           <tr key={l.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedViewerLoan(l)}>
                              <td className="px-10 py-7">
                                 <p className="font-mono font-black text-[#1e3a8a] text-sm tracking-tight">{l.idOrden}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(l.loanDate).toLocaleDateString()} {l.exitTime}</p>
                              </td>
                              <td className="px-10 py-7">
                                 <div className="space-y-1">
                                    <p className="font-black text-slate-800 text-base uppercase leading-none">{l.solicitante.nombre}</p>
                                    <p className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md inline-block">PLACA #{l.solicitante.placa}</p>
                                 </div>
                              </td>
                              <td className="px-10 py-7">
                                 <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${l.status === 'active' ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>{l.status === 'active' ? 'ACTIVO' : 'CERRADO'}</span>
                              </td>
                              <td className="px-10 py-7">
                                 <div className="flex justify-center gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedViewerLoan(l); }} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye className="w-5 h-5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); window.print(); }} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Printer className="w-5 h-5" /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {loans.length === 0 && (
                           <tr><td colSpan={4} className="py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No se han registrado trámites</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {view === 'new' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-top-6 duration-500">
               {success && <div className="bg-emerald-50 text-emerald-600 p-8 rounded-[3rem] font-black text-center uppercase tracking-widest animate-in zoom-in border border-emerald-100 shadow-lg shadow-emerald-900/10"><CheckCircle className="w-12 h-12 mx-auto mb-4" /> ¡Orden Registrada Exitosamente!</div>}
               {error && <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 border border-red-100 shadow-lg shadow-red-900/5"><AlertTriangle className="w-6 h-6" /> {error}</div>}

               <form onSubmit={handleSave} className="space-y-12 no-print">
                  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="bg-[#1e3a8a] p-3 rounded-2xl text-white shadow-lg"><FileText className="w-7 h-7" /></div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">Emisión de Orden</h3>
                           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mt-1"><Clock className="w-3 h-3" /> {currentDateTime}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <button type="button" onClick={() => window.location.reload()} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">LIMPIAR</button>
                        <button type="submit" className="px-12 py-4 bg-[#1e3a8a] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-900/30 hover:bg-[#1a3a70] transition-all flex items-center gap-3"><Save className="w-5 h-5" /> GUARDAR TRÁMITE</button>
                     </div>
                  </div>

                  <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-16 container-print relative">
                     <div className="absolute top-10 right-16 opacity-10 no-print">
                        <Shield className="w-48 h-48 text-slate-200" />
                     </div>

                     <div className="text-center space-y-3 mb-16 border-b-4 border-[#f59e0b] pb-12">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#1e3a8a]">República de Panamá</h2>
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#1e3a8a]">Servicio Nacional Aeronaval</h2>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.5em] text-slate-400">Dirección Nacional de Inteligencia</h3>
                        <div className="pt-10">
                           <h1 className="text-3xl font-black uppercase text-[#1e3a8a] tracking-tight">Orden de Salida de Activos</h1>
                           <div className="mt-4 inline-flex items-center gap-3 px-6 py-2 bg-slate-50 rounded-full border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Orden ID:</span>
                              <span className="text-sm font-mono font-black text-[#1e3a8a]">{orderId}</span>
                           </div>
                        </div>
                     </div>

                     {/* SECCIÓN A: SOLICITANTE */}
                     <div className="space-y-12 mb-20">
                        <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><UserIcon className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">A. Datos del Solicitante</h4></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"># Placa / ID *</label><input required value={solicitante.placa} onChange={e => setSolicitante({ ...solicitante, placa: e.target.value })} className="w-full px-8 py-5 bg-blue-50/50 border border-blue-600/30 rounded-3xl text-xl font-black text-blue-700 tracking-widest focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all" placeholder="#9088" /></div>
                           <div className="space-y-3 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label><input readOnly value={solicitante.nombre} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-black uppercase text-slate-500" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rango</label><input readOnly value={solicitante.rango} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-500 uppercase" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label><input readOnly value={solicitante.departamento} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-500 uppercase" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono Institucional</label><input readOnly value={solicitante.telefono} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-500" /></div>
                        </div>
                     </div>

                     {/* SECCIÓN B: RESPONSABLE ENTREGA */}
                     <div className="space-y-12 mb-20">
                        <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><Shield className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">B. Datos Responsable Inventario (DNI)</h4></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"># Placa / ID *</label><input required value={responsable.placa} onChange={e => setResponsable({ ...responsable, placa: e.target.value })} className="w-full px-8 py-5 bg-blue-50/50 border border-blue-600/30 rounded-3xl text-xl font-black text-blue-700 tracking-widest focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all" placeholder="#000" /></div>
                           <div className="space-y-3 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label><input readOnly value={responsable.nombre} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-lg font-black uppercase text-slate-500" /></div>
                        </div>
                     </div>

                     {/* SECCIÓN C: CONTROL DE EQUIPOS */}
                     <div className="space-y-12 mb-20">
                        <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><Laptop className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">C. Control de Equipos Tecnológicos</h4></div>
                        <div className="relative z-50">
                           <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                           <input type="text" placeholder="Buscador inteligente: serie, marca, modelo o categoría..." value={intelSearch} onFocus={() => setShowIntel(true)} onChange={e => { setIntelSearch(e.target.value); setShowIntel(true); }} className="w-full pl-20 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-xl font-bold focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner" />
                           {showIntel && filteredInventory.length > 0 && (
                              <div className="absolute w-full mt-3 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-4">
                                 {filteredInventory.map(e => (
                                    <button key={e.id} type="button" onClick={() => addEquipment(e)} className="w-full p-8 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0 flex items-center justify-between group transition-all">
                                       <div className="flex items-center gap-6"><div className="p-4 bg-white rounded-3xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><Cpu className="w-7 h-7" /></div><div><p className="text-lg font-black uppercase tracking-tight text-slate-800">{e.brand} {e.model}</p><p className="text-[11px] text-slate-400 font-bold uppercase mt-1">{e.category} • S/N: <span className="font-mono text-blue-600">#{e.serialNumber}</span></p></div></div>
                                       <div className="p-3 bg-blue-50 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all"><Plus className="w-6 h-6" /></div>
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>

                        <div className="rounded-[2.5rem] border border-slate-200 overflow-visible shadow-sm">
                           <table className="w-full text-left">
                              <thead className="bg-[#1e3a8a] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                 <tr><th className="px-10 py-7">Equipo</th><th className="px-10 py-7">Serie / Chip</th><th className="px-10 py-7">Estado</th><th className="px-10 py-7">Accesorios</th><th className="px-10 py-7 text-center w-24">X</th></tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {items.map((it, idx) => (
                                    <tr key={it.equipmentId} className="hover:bg-slate-50/50 transition-colors animate-in slide-in-from-left-4 duration-300">
                                       <td className="px-10 py-7"><p className="text-base font-black text-slate-800 uppercase leading-none tracking-tight">{it.brand} {it.model}</p><p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">{it.category}</p></td>
                                       <td className="px-10 py-7">
                                          <p className="text-sm font-mono font-black text-blue-700 tracking-tight">S/N: #{it.serialNumber}</p>

                                          {(it.category.includes('Satelital') || it.brand.includes('Iridium') || it.brand.includes('Inmarsat')) ? (
                                             <div className="mt-2">
                                                <ChipSelector
                                                    chips={chips.filter(c => c.status === 'Disponible')}
                                                    selectedChipId={it.chipId}
                                                    selectedChipNumber={it.chipNumber}
                                                    onSelect={(selectedChipId, selectedChipNumber) => {
                                                       if (!selectedChipId && !selectedChipNumber) {
                                                            const ni = [...items];
                                                            ni[idx].chipId = undefined;
                                                            ni[idx].chipNumber = 'N/A';
                                                            setItems(ni);
                                                            return;
                                                       }
                                                       if (!selectedChipId && selectedChipNumber) {
                                                            const ni = [...items];
                                                            ni[idx].chipId = undefined;
                                                            ni[idx].chipNumber = selectedChipNumber;
                                                            setItems(ni);
                                                            return;
                                                       }
                                                       const selectedChip = chips.find(c => c.id === selectedChipId);
                                                       const newItems = [...items];
                                                       newItems[idx].chipId = selectedChipId;
                                                       newItems[idx].chipNumber = selectedChip ? selectedChip.number : 'N/A';
                                                       setItems(newItems);
                                                    }}
                                                 />
                                             </div>
                                          ) : (
                                             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">CHIP: {it.chipNumber}</p>
                                          )}
                                       </td>
                                       <td className="px-10 py-7">
                                          <select value={it.exitCondition} onChange={e => { const ni = [...items]; ni[idx].exitCondition = e.target.value as any; setItems(ni); }} className="text-[11px] font-black px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 outline-none">
                                             <option value="Excelente">Excelente</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Con observaciones">Observaciones</option>
                                          </select>
                                          {it.exitCondition === 'Con observaciones' && <input placeholder="Detalle observación..." className="w-full mt-3 text-[11px] p-4 bg-orange-50 border border-orange-100 rounded-xl focus:bg-white transition-all shadow-inner" onChange={e => { const ni = [...items]; ni[idx].exitObservations = e.target.value; setItems(ni); }} />}
                                       </td>
                                       <td className="px-10 py-7">
                                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                             {ACCESSORIES_LIST.map(acc => (
                                                <button key={acc} type="button" onClick={() => toggleAccessory(idx, acc)} className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase transition-all shadow-sm ${it.accessories.includes(acc) ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{acc}</button>
                                             ))}
                                          </div>
                                       </td>
                                       <td className="px-10 py-7 text-center"><button type="button" onClick={() => setItems(items.filter(i => i.equipmentId !== it.equipmentId))} className="p-3.5 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-5 h-5" /></button></td>
                                    </tr>
                                 ))}
                                 {items.length === 0 && (
                                    <tr><td colSpan={5} className="py-24 text-center text-slate-200 font-black uppercase tracking-[0.3em] text-[10px]">No se han añadido equipos a la orden</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* SECCIÓN D: DATOS MISIÓN */}
                     <div className="space-y-12 mb-20">
                        <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><MapPin className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">D. Detalles de Misión / Salida</h4></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destino Específico *</label><input required value={mission.destino} onChange={e => setMission({ ...mission, destino: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all shadow-inner" placeholder="Ej: Puesto Control Taboga" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retorno Programado *</label><input required type="datetime-local" value={mission.fechaRetornoProgramada} onChange={e => setMission({ ...mission, fechaRetornoProgramada: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all shadow-inner" /></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duración Estimada</label><p className="px-8 py-5 bg-blue-50/50 rounded-[2rem] text-sm font-black text-[#1e3a8a] flex items-center gap-3"><Clock className="w-5 h-5" /> {durationText}</p></div>
                           <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Misión *</label><select value={mission.tipo} onChange={e => setMission({ ...mission, tipo: e.target.value as any })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:bg-white focus:ring-8 focus:ring-blue-100 transition-all appearance-none cursor-pointer">{MISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                           <div className="md:col-span-2 space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo / Justificación de Salida *</label><textarea required lang="es" spellCheck={true} rows={5} value={mission.motivo} onChange={e => setMission({ ...mission, motivo: e.target.value })} className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[3rem] text-base font-medium focus:ring-8 focus:ring-blue-100 focus:bg-white transition-all shadow-inner" placeholder="Especifique con detalle el motivo técnico o administrativo para la salida de los activos..." /></div>
                        </div>
                     </div>

                     {/* SECCIÓN F: RESPONSABILIDAD Y FIRMAS */}
                     <div className="space-y-16 pt-16 border-t-2 border-slate-100">
                        <label className="flex items-start gap-6 p-10 bg-[#1e3a8a]/5 border-2 border-blue-600 rounded-[3rem] cursor-pointer group shadow-2xl shadow-blue-900/5 hover:bg-blue-100/30 transition-all duration-500">
                           <div className={`mt-1.5 w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${liability ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/50' : 'border-blue-400 bg-white group-hover:border-blue-600'}`}>{liability && <Check className="w-6 h-6 text-white" />}</div>
                           <input type="checkbox" className="hidden" checked={liability} onChange={e => setLiability(e.target.checked)} />
                           <p className="flex-1 text-base font-bold text-blue-900 leading-relaxed uppercase tracking-tight select-none">Acepto que soy responsable del equipo asignado y me comprometo a devolverlo en las mismas condiciones en que lo recibí. En caso de daño, pérdida o robo, asumo la responsabilidad correspondiente según el reglamento institucional del SENAN.</p>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-20">
                           {/* Firma Solicitante Manual */}
                           <div className="text-center space-y-2">
                              <div className="w-3/4 mx-auto border-b-2 border-slate-800 mb-4"></div>
                              <p className="text-sm font-black text-[#1e3a8a] uppercase tracking-widest">FIRMA DEL SOLICITANTE</p>
                              <p className="text-xs font-bold text-slate-500 uppercase">({solicitante.nombre || 'APELLIDO, NOMBRE'})</p>
                              <div className="pt-8 text-left w-3/4 mx-auto space-y-4">
                                 <div className="flex items-end gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">CÉDULA / PASAPORTE:</span>
                                    <div className="flex-1 border-b border-slate-300 border-dashed"></div>
                                 </div>
                                 <div className="flex items-end gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">FECHA:</span>
                                    <div className="flex-1 border-b border-slate-300 border-dashed"></div>
                                 </div>
                              </div>
                           </div>

                           {/* Firma DNI Manual */}
                           <div className="text-center space-y-2">
                              <div className="w-3/4 mx-auto border-b-2 border-slate-800 mb-4"></div>
                              <p className="text-sm font-black text-[#1e3a8a] uppercase tracking-widest">FIRMA DE AUTORIZACIÓN DNI</p>
                              <p className="text-xs font-bold text-slate-500 uppercase">({responsable.nombre || 'RESPONSABLE DNI'})</p>
                              <div className="pt-8 text-left w-3/4 mx-auto space-y-4">
                                 <div className="flex items-end gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">CÉDULA / PASAPORTE:</span>
                                    <div className="flex-1 border-b border-slate-300 border-dashed"></div>
                                 </div>
                                 <div className="flex items-end gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">FECHA:</span>
                                    <div className="flex-1 border-b border-slate-300 border-dashed"></div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-24 text-center pt-8 border-t border-slate-100"><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] leading-loose">Sistema Nacional de Control Tecnológico DNI - SENAN Panamá<br />Propiedad del Estado Panameño</p></div>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
};

export default LoansPage;
