
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storage } from '../services/storage';
import { Loan, Equipment, LoanItem, EquipmentStatus, LoanIncident } from '../types';
import {
   ArrowDownLeft, Search, CheckCircle, AlertCircle, Laptop, User as UserIcon,
   Hash, Camera, Clock, RotateCcw, ShieldCheck, AlertTriangle, FileText,
   X, Check, ClipboardCheck, History, Star, Smartphone, Trash2, Plus,
   PackageOpen, ShieldQuestion, UserCheck
} from 'lucide-react';

const RETURN_CONDITIONS = ['Excelente', 'Bueno', 'Regular', 'Dañado'];
const MAINT_TYPES = ['No', 'Preventivo', 'Correctivo', 'Urgente'];
const INCIDENT_TYPES = ['Daño accidental', 'Mal funcionamiento', 'Pérdida', 'Robo', 'Otro'];

const SignatureCanvas: React.FC<{ onEnd: (data: string) => void, label: string }> = ({ onEnd, label }) => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const [isDrawing, setIsDrawing] = useState(false);
   useEffect(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (ctx) { ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; }
   }, []);
   const startDrawing = (e: any) => {
      setIsDrawing(true); const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.beginPath(); ctx.moveTo(x, y);
   };
   const draw = (e: any) => {
      if (!isDrawing) return; const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.lineTo(x, y); ctx.stroke();
   };
   const endDrawing = () => { setIsDrawing(false); const canvas = canvasRef.current; if (canvas) onEnd(canvas.toDataURL()); };
   const clear = () => { const canvas = canvasRef.current; if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); onEnd(''); };
   return (
      <div className="space-y-2">
         <div className="border-2 border-slate-200 rounded-2xl bg-slate-50 relative h-36 overflow-hidden">
            <canvas ref={canvasRef} width={400} height={144} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={endDrawing} className="w-full h-full cursor-crosshair" />
            <button type="button" onClick={clear} className="absolute top-2 right-2 text-[9px] font-black text-slate-400 uppercase bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">Limpiar</button>
         </div>
         <p className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest text-center">{label}</p>
      </div>
   );
};

const ReturnsPage: React.FC = () => {
   const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
   const [loans, setLoans] = useState<Loan[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);

   // Reception Data
   const [receptor, setReceptor] = useState({ placa: '', nombre: '', rango: '', departamento: '' });
   const [returnItems, setReturnItems] = useState<LoanItem[]>([]);
   const [delayJustification, setDelayJustification] = useState('');
   const [incident, setIncident] = useState<LoanIncident>({ occurred: false });
   const [satisfaction, setSatisfaction] = useState(5);
   const [declarationAccepted, setDeclarationAccepted] = useState(false);
   const [signatures, setSignatures] = useState({ solicitanteRetorno: '', responsableRecepcion: '' });

   const [employees, setEmployees] = useState<any[]>([]);

   useEffect(() => {
      loadInitialData();
   }, []);

   const loadInitialData = async () => {
      try {
         const [loansData, employeesData] = await Promise.all([
            storage.getLoans(),
            storage.getEmployees()
         ]);
         setLoans(loansData);
         setEmployees(employeesData);
      } catch (err) {
         console.error("Error loading returns data:", err);
      }
   };

   // Compute filtered loans lists based on their status for pending and history tabs
   const pendingLoans = useMemo(() => loans.filter(l => l.status === 'active'), [loans]);
   const historyLoans = useMemo(() => loans.filter(l => l.status === 'returned'), [loans]);

   useEffect(() => {
      if (receptor.placa.length >= 3) {
         const found = employees.find(e => e.badgeNumber === receptor.placa);
         if (found) setReceptor({ ...receptor, nombre: `${found.name} ${found.lastName}`, rango: found.rank, departamento: found.department });
      }
   }, [receptor.placa, employees]);

   const selectLoanForReturn = (loan: Loan) => {
      setSelectedLoan(loan);
      // ARRASTRAR ACCESORIOS: Inicializamos returnAccessories con la lista original de accesorios para comparación física
      setReturnItems(loan.items.map(it => ({
         ...it,
         returnCondition: it.exitCondition as any,
         returnAccessories: [...it.accessories], // Se arrastran todos inicialmente
         requiresMaintenance: 'No',
         maintenanceDetails: '',
         isDeviceReturned: true,
         isChipReturned: true
      })));
      setSuccess(false);
      setError('');
   };

   const loanMetrics = useMemo(() => {
      if (!selectedLoan) return null;
      const start = new Date(selectedLoan.loanDate);
      const end = new Date();
      const scheduled = new Date(selectedLoan.mission.fechaRetornoProgramada);
      const diff = end.getTime() - start.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { daysLoaned: `${days}d ${hours}h`, onTime: end <= scheduled, delay: end > scheduled ? Math.floor((end.getTime() - scheduled.getTime()) / (1000 * 60 * 60 * 24)) : 0 };
   }, [selectedLoan]);

   const handleFinalizeReturn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!declarationAccepted) return setError('Acepte la declaración de veracidad.');
      if (!signatures.solicitanteRetorno || !signatures.responsableRecepcion) return setError('Ambas firmas son obligatorias.');
      if (!loanMetrics?.onTime && !delayJustification) return setError('Justifique el retraso.');

      if (incident.occurred) {
         if (!incident.type || !incident.description || !incident.date) return setError('Complete todos los campos del incidente.');
      }

      const returnData: Partial<Loan> = {
         items: returnItems,
         returnInfo: {
            returnDate: new Date().toISOString(),
            returnTime: new Date().toLocaleTimeString(),
            daysLoaned: loanMetrics?.daysLoaned || '0d 0h',
            onTime: loanMetrics?.onTime || false,
            delayJustification,
            incident,
            satisfaction,
            responsiblePlaca: receptor.placa,
            responsibleNombre: receptor.nombre
         },
         signatures: { ...selectedLoan?.signatures, ...signatures }
      };

      try {
         await storage.finalizeReturn(selectedLoan!.id, returnData);
         setSuccess(true);
         const updatedLoans = await storage.getLoans();
         setLoans(updatedLoans);
         setTimeout(() => { setSelectedLoan(null); setActiveTab('history'); }, 2000);
      } catch (err) {
         console.error("Error finalizing return:", err);
         setError("Error al finalizar el retorno.");
      }
   };

   return (
      <div className="space-y-12 animate-in fade-in pb-24">
         <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
               <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                  <RotateCcw className="w-12 h-12 text-blue-600 bg-blue-50 p-2 rounded-3xl" /> Control de Retorno
               </h2>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-2">Cierre técnico de misiones y órdenes de salida</p>
            </div>
         </div>

         <div className="flex justify-center">
            <div className="flex bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm gap-2">
               <button onClick={() => { setActiveTab('pending'); setSelectedLoan(null); }} className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>Pendientes de Cierre</button>
               <button onClick={() => { setActiveTab('history'); setSelectedLoan(null); }} className={`px-10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-50'}`}>Historial de Recepción</button>
            </div>
         </div>

         {activeTab === 'pending' && !selectedLoan && (
            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
               <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center gap-6 group">
                  <Search className="w-8 h-8 text-slate-200 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="Localizar oficial por placa o nombre para cerrar préstamo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 bg-transparent text-xl font-bold focus:outline-none" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {pendingLoans.filter(l => l.solicitante.placa.includes(searchTerm) || l.solicitante.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(l => (
                     <div key={l.id} onClick={() => selectLoanForReturn(l)} className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-blue-600 shadow-2xl cursor-pointer transition-all group hover:-translate-y-2">
                        <div className="flex justify-between items-start mb-10">
                           <div className="p-5 bg-slate-50 rounded-[2rem] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Laptop className="w-8 h-8" /></div>
                           <span className="text-[10px] font-mono font-black px-4 py-1.5 bg-blue-50 text-blue-700 rounded-xl uppercase tracking-tighter shadow-sm">{l.idOrden}</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">{l.solicitante.nombre}</h4>
                        <p className="text-sm font-bold text-slate-400 mt-3 uppercase tracking-widest">#{l.solicitante.placa} • {l.solicitante.rango}</p>
                        <div className="mt-10 pt-10 border-t border-slate-50 flex justify-between items-center">
                           <div className="flex flex-col"><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Activos</span><span className="text-lg font-black text-slate-700">{l.items.length} eq.</span></div>
                           <div className="text-right"><span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Vence</span><span className={`text-lg font-black ${new Date(l.mission.fechaRetornoProgramada) < new Date() ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>{new Date(l.mission.fechaRetornoProgramada).toLocaleDateString()}</span></div>
                        </div>
                     </div>
                  ))}
                  {pendingLoans.length === 0 && (
                     <div className="col-span-full py-40 text-center flex flex-col items-center gap-6 opacity-30">
                        <PackageOpen className="w-24 h-24" />
                        <p className="text-xl font-black uppercase tracking-[0.5em]">No se han detectado órdenes activas</p>
                     </div>
                  )}
               </div>
            </div>
         )}

         {selectedLoan && (
            <form onSubmit={handleFinalizeReturn} className="max-w-6xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
               {success && <div className="bg-emerald-50 text-emerald-600 p-10 rounded-[3rem] font-black text-center uppercase tracking-widest shadow-2xl border border-emerald-200">¡Retorno de Equipo Procesado Correctamente!</div>}
               {error && <div className="bg-red-50 text-red-600 p-8 rounded-[2.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-6 border border-red-100 shadow-xl"><AlertTriangle className="w-8 h-8" /> {error}</div>}

               <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="bg-blue-600 p-4 rounded-[2rem] text-white shadow-2xl shadow-blue-500/50"><ClipboardCheck className="w-10 h-10" /></div>
                     <div>
                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">Inspección de Devolución</h3>
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mt-3">ORDEN MAESTRA: {selectedLoan.idOrden}</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button type="button" onClick={() => setSelectedLoan(null)} className="px-10 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">ABORTAR</button>
                     <button type="submit" className="px-12 py-5 bg-[#1e3a8a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-900/30 hover:bg-[#1a3a70] transition-all flex items-center gap-4"><ShieldCheck className="w-6 h-6" /> CERRAR EXPEDIENTE</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className={`p-10 rounded-[3rem] shadow-xl text-center border-4 flex flex-col items-center justify-center gap-4 ${loanMetrics?.onTime ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Status de Entrega</p>
                     <h4 className="text-4xl font-black tracking-tighter">{loanMetrics?.onTime ? '✅ A TIEMPO' : '⚠️ RETRASADA'}</h4>
                     <div className="px-6 py-2 bg-white/50 rounded-full text-xs font-black uppercase mt-2 tracking-widest">{loanMetrics?.daysLoaned} de uso</div>
                  </div>
                  {!loanMetrics?.onTime && (
                     <div className="md:col-span-2 bg-white p-10 rounded-[3rem] border-2 border-red-100 shadow-2xl shadow-red-900/5 space-y-4">
                        <label className="text-[11px] font-black text-red-600 uppercase tracking-widest ml-1 flex items-center gap-2"><ShieldQuestion className="w-4 h-4" /> Justificación de Retraso Obligatoria *</label>
                        <textarea required minLength={30} value={delayJustification} onChange={e => setDelayJustification(e.target.value)} className="w-full p-8 bg-red-50/20 border border-red-100 rounded-[2.5rem] text-base font-medium focus:bg-white focus:ring-8 focus:ring-red-100 transition-all shadow-inner" placeholder="Especifique el motivo por el cual la devolución se realiza fuera de la fecha programada..." />
                     </div>
                  )}
               </div>

               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-12">
                  <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><UserCheck className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">Recepción DNI</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                     <div className="space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1"># Placa Receptor *</label><input required value={receptor.placa} onChange={e => setReceptor({ ...receptor, placa: e.target.value })} className="w-full px-8 py-5 bg-blue-50/50 border border-blue-600 rounded-[2rem] text-xl font-black text-blue-700 tracking-widest focus:outline-none shadow-inner" placeholder="#000" /></div>
                     <div className="md:col-span-2 space-y-3"><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo de Receptor</label><input readOnly value={receptor.nombre} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-lg font-black uppercase text-slate-500" /></div>
                  </div>
               </div>

               {/* INSPECCIÓN CON ARRASTRE DE ACCESORIOS */}
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10">
                  <div className="flex items-center gap-3 border-b-2 border-[#1e3a8a] pb-4"><Laptop className="w-6 h-6 text-[#1e3a8a]" /><h4 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">Inspección de Equipos (Comparativa)</h4></div>
                  <div className="overflow-hidden rounded-[3rem] border border-slate-200 shadow-sm">
                     <table className="w-full text-left">
                        <thead className="bg-[#1e3a8a] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                           <tr><th className="px-10 py-7">Equipo</th><th className="px-10 py-7">Condición Salida</th><th className="px-10 py-7">Condición Retorno</th><th className="px-10 py-7">Accesorios Devueltos</th><th className="px-10 py-7">Mantenimiento</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {returnItems.map((it, idx) => (
                              <tr key={it.equipmentId} className="hover:bg-slate-50/30 transition-all duration-300">
                                 <td className="px-10 py-8">
                                    <p className="text-base font-black text-slate-800 uppercase leading-none tracking-tight">{it.brand} {it.model}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">S/N: #{it.serialNumber}</p>
                                 </td>
                                 <td className="px-10 py-8">
                                    <span className="text-[10px] font-black px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl uppercase tracking-widest shadow-sm">{it.exitCondition}</span>

                                    <div className="mt-4 space-y-2">
                                       <label className="flex items-center gap-2 cursor-pointer">
                                          <input
                                             type="checkbox"
                                             checked={it.isDeviceReturned !== false}
                                             onChange={(e) => {
                                                const ni = [...returnItems];
                                                ni[idx].isDeviceReturned = e.target.checked;
                                                setReturnItems(ni);
                                             }}
                                             className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                          />
                                          <span className="text-[10px] font-bold text-slate-600 uppercase">Devolver Equipo</span>
                                       </label>

                                       {it.chipId && (
                                          <label className="flex items-center gap-2 cursor-pointer">
                                             <input
                                                type="checkbox"
                                                checked={it.isChipReturned !== false}
                                                onChange={(e) => {
                                                   const ni = [...returnItems];
                                                   ni[idx].isChipReturned = e.target.checked;
                                                   setReturnItems(ni);
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                             />
                                             <span className="text-[10px] font-bold text-slate-600 uppercase">Devolver Chip</span>
                                          </label>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <select value={it.returnCondition} onChange={e => { const ni = [...returnItems]; ni[idx].returnCondition = e.target.value as any; setReturnItems(ni); }} className={`text-[11px] font-black px-4 py-2.5 rounded-xl border-2 transition-all outline-none ${it.returnCondition !== it.exitCondition ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-white'}`}>
                                       {RETURN_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex flex-col gap-2">
                                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Cargados en Salida:</p>
                                       <div className="flex flex-wrap gap-1.5">
                                          {it.accessories.map(acc => (
                                             <label key={acc} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${it.returnAccessories?.includes(acc) ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200 opacity-60'}`}>
                                                <input type="checkbox" checked={it.returnAccessories?.includes(acc)} onChange={e => {
                                                   const ni = [...returnItems];
                                                   const curr = ni[idx].returnAccessories || [];
                                                   ni[idx].returnAccessories = e.target.checked ? [...curr, acc] : curr.filter(a => a !== acc);
                                                   setReturnItems(ni);
                                                }} className="w-4 h-4 text-emerald-600 rounded-md focus:ring-0" />
                                                <span className={`text-[9px] font-black uppercase tracking-tight ${it.returnAccessories?.includes(acc) ? 'text-emerald-700' : 'text-red-700'}`}>{acc}</span>
                                             </label>
                                          ))}
                                       </div>
                                       {it.returnAccessories?.length !== it.accessories.length && (
                                          <div className="mt-3 flex items-center gap-2 text-red-600 animate-pulse">
                                             <AlertTriangle className="w-3 h-3" />
                                             <p className="text-[9px] font-black uppercase tracking-widest">Faltan accesorios por entregar</p>
                                          </div>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <select value={it.requiresMaintenance} onChange={e => { const ni = [...returnItems]; ni[idx].requiresMaintenance = e.target.value as any; setReturnItems(ni); }} className="text-[11px] font-black px-4 py-2.5 rounded-xl border border-slate-100 bg-white shadow-sm outline-none">
                                       {MAINT_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* NOVEDADES E INCIDENTES */}
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-12">
                  <div className="flex items-center justify-between border-b-2 border-red-600 pb-4">
                     <div className="flex items-center gap-4 text-red-600">
                        <AlertTriangle className="w-8 h-8" />
                        <h4 className="text-xl font-black uppercase tracking-tight">Reporte de Novedades e Incidentes</h4>
                     </div>
                     <div className="flex items-center gap-5">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">¿Ocurrió algún incidente?</span>
                        <button type="button" onClick={() => setIncident({ ...incident, occurred: !incident.occurred })} className={`w-16 h-9 rounded-full transition-all relative shadow-inner ${incident.occurred ? 'bg-red-600' : 'bg-slate-200'}`}><div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${incident.occurred ? 'right-1.5' : 'left-1.5'}`} /></button>
                     </div>
                  </div>

                  {incident.occurred && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-top-6 duration-500">
                        <div className="space-y-6">
                           <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Naturaleza del Suceso *</label><select value={incident.type} onChange={e => setIncident({ ...incident, type: e.target.value as any })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold shadow-inner">{INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                           <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha del Evento *</label><input type="date" value={incident.date} onChange={e => setIncident({ ...incident, date: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold shadow-inner" /></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Informe Circunstanciado *</label><textarea required minLength={50} rows={7} value={incident.description} onChange={e => setIncident({ ...incident, description: e.target.value })} className="w-full p-10 bg-red-50/20 border border-red-100 rounded-[3rem] text-base font-medium focus:bg-white focus:ring-8 focus:ring-red-100 transition-all shadow-inner" placeholder="Relate detalladamente lo sucedido durante el tiempo que el equipo estuvo fuera..." /></div>
                     </div>
                  )}

                  <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                     <div className="space-y-2"><h5 className="text-lg font-black text-slate-800 uppercase leading-none tracking-tight">Evaluación de Activo</h5><p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Califique el desempeño técnico del equipo</p></div>
                     <div className="flex gap-4 text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => setSatisfaction(s)} className={`transition-all duration-300 transform ${satisfaction >= s ? 'scale-125 opacity-100 drop-shadow-md' : 'scale-100 opacity-20 hover:opacity-50'}`}><Star className={`w-10 h-10 ${satisfaction >= s ? 'fill-amber-400' : 'fill-none'}`} /></button>)}
                     </div>
                  </div>
               </div>

               {/* CIERRE Y FIRMAS DIGITALES */}
               <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-16">
                  <label className="flex items-start gap-8 p-10 bg-emerald-50/50 border-2 border-emerald-600 rounded-[3.5rem] cursor-pointer group shadow-2xl shadow-emerald-900/5 hover:bg-emerald-100/50 transition-all duration-500">
                     <div className={`mt-1.5 w-10 h-10 rounded-[1.2rem] border-2 flex items-center justify-center transition-all duration-300 ${declarationAccepted ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/50' : 'border-emerald-400 bg-white group-hover:border-emerald-600'}`}>{declarationAccepted && <Check className="w-6 h-6" />}</div>
                     <input type="checkbox" className="hidden" checked={declarationAccepted} onChange={e => setDeclarationAccepted(e.target.checked)} />
                     <p className="flex-1 text-base font-bold text-emerald-900 leading-relaxed uppercase tracking-tight select-none">Declaro bajo juramento que he devuelto los activos tecnológicos del SENAN en las condiciones descritas y que la información técnica proporcionada en este formulario es verídica.</p>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-10">
                     <SignatureCanvas onEnd={data => setSignatures({ ...signatures, solicitanteRetorno: data })} label={`Firma Quien Devuelve: ${selectedLoan.solicitante.nombre}`} />
                     <SignatureCanvas onEnd={data => setSignatures({ ...signatures, responsableRecepcion: data })} label={`Firma Recepción (DNI): ${receptor.nombre || '...'}`} />
                  </div>
               </div>
            </form>
         )}

         {activeTab === 'history' && (
            <div className="animate-in slide-in-from-bottom-6 duration-700">
               <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr><th className="px-12 py-8">Fecha Cierre</th><th className="px-12 py-8">Orden Origen</th><th className="px-12 py-8">Oficial Responsable</th><th className="px-12 py-8">Cumplimiento</th><th className="px-12 py-8 text-center">Expediente</th></tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                        {historyLoans.map(l => (
                           <tr key={l.id} className="hover:bg-slate-50/50 transition-all duration-300">
                              <td className="px-12 py-8"><div className="flex items-center gap-4 text-emerald-600"><CheckCircle className="w-5 h-5" /><span className="font-bold text-base">{new Date(l.returnInfo!.returnDate).toLocaleDateString()}</span></div></td>
                              <td className="px-12 py-8"><p className="text-sm font-mono font-black text-[#1e3a8a] tracking-tighter uppercase">{l.idOrden}</p></td>
                              <td className="px-12 py-8"><p className="text-base font-black text-slate-800 uppercase tracking-tight leading-none">{l.solicitante.nombre}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">PLACA: #{l.solicitante.placa}</p></td>
                              <td className="px-12 py-8"><span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${l.returnInfo?.onTime ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{l.returnInfo?.onTime ? 'A TIEMPO' : 'CON RETRASO'}</span></td>
                              <td className="px-12 py-8 text-center"><button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-md"><FileText className="w-6 h-6" /></button></td>
                           </tr>
                        ))}
                        {historyLoans.length === 0 && (
                           <tr><td colSpan={5} className="py-40 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-sm">El historial de devoluciones está vacío</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
   );
};

export default ReturnsPage;
