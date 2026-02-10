
import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../services/storage';
import { Equipment, Category, EquipmentStatus, Employee, Peripheral } from '../types';
import {
   Box, Tag, Plus, Wrench, Database, Search, ShieldCheck,
   Laptop, Radio, Navigation, Satellite, Save, X, Trash2, Edit2, Camera,
   ChevronRight, Info, Server, Network, Monitor, Phone, Zap, Mouse,
   CheckCircle, AlertTriangle, Hash, Tablet, Cpu, Battery, Keyboard,
   Layers, User, MapPin, Image as ImageIcon, FileText, UserCheck, Trash,
   Calendar, CreditCard, Palette
} from 'lucide-react';

const CONDITIONS = ['Excelente', 'Bueno', 'Regular', 'Malo'];
const LOCATIONS = ['Almacén', 'Oficina 101', 'Sala de servidores', 'Laboratorio', 'Sala de juntas', 'Campo / Externo'];

const EquipmentPage: React.FC = () => {
   const [view, setView] = useState<'list' | 'new' | 'categories' | 'maintenance'>('list');
   const [equipment, setEquipment] = useState<Equipment[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [employees, setEmployees] = useState<Employee[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [empSearchTerm, setEmpSearchTerm] = useState('');
   const [showEmpList, setShowEmpList] = useState(false);
   const [successMsg, setSuccessMsg] = useState('');
   const [errorMsg, setErrorMsg] = useState('');
   const [editingId, setEditingId] = useState<string | null>(null);

   const currentUser = storage.getCurrentUser();
   const isReadOnly = currentUser?.role === 'Consulta';

   const initialFormState: Partial<Equipment> = {
      internalId: '',
      status: EquipmentStatus.AVAILABLE,
      condition: 'Excelente',
      category: '',
      subCategory: '',
      brand: '',
      model: '',
      serialNumber: '',
      internalLabel: '',
      color: '',
      featuresList: [],
      hasScreen: false,
      screenDetails: { brand: '', model: '', serial: '', specs: '' },
      hasKeyboard: false,
      keyboardDetails: { brand: '', model: '', serial: '', language: '' },
      hasBattery: false,
      batteryDetails: { brand: '', model: '', serial: '', capacity: '' },
      hasPeripherals: false,
      peripherals: [
         { id: '1', type: 'Cargador AC', brandModel: '', specs: '' },
         { id: '2', type: 'Cable HDMI', brandModel: '', specs: '' }
      ],
      purchaseDate: new Date().toISOString().split('T')[0],
      provider: '',
      invoiceNumber: '',
      initialValue: 0,
      warrantyUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      location: 'Almacén',
      photos: [],
      responsibleId: '',
      chipNumber: ''
   };

   const [formData, setFormData] = useState<Partial<Equipment>>(initialFormState);

   useEffect(() => {
      refreshData();
   }, []);

   const refreshData = async () => {
      try {
         const [eqData, catData, empData] = await Promise.all([
            storage.getEquipment(),
            storage.getCategories(),
            storage.getEmployees()
         ]);
         setEquipment(eqData);
         setCategories(catData);
         setEmployees(empData);
         if (view === 'new' && !editingId) generateAutoId();
      } catch (err) {
         console.error("Error refreshing data:", err);
      }
   };

   const generateAutoId = () => {
      const year = new Date().getFullYear();
      const count = equipment.length + 1;
      const newId = `INV-${year}-${count.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, internalId: newId }));
   };

   const availableSubCategories = useMemo(() => {
      if (!formData.category) return [];
      const catObj = categories.find(c => c.name === formData.category);
      return catObj ? catObj.subCategories : [];
   }, [formData.category, categories]);

   const filteredEmployees = useMemo(() => {
      const term = empSearchTerm.toLowerCase();
      return employees.filter(e =>
         e.name.toLowerCase().includes(term) ||
         e.lastName.toLowerCase().includes(term) ||
         e.badgeNumber.includes(term)
      );
   }, [employees, empSearchTerm]);

   const handleSaveEquipment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (isReadOnly) return;

      if (!formData.category || !formData.brand || !formData.model || !formData.serialNumber || !formData.responsibleId) {
         setErrorMsg('Complete los campos obligatorios (*)');
         return;
      }

      // Fix empty dates to be null or valid dates
      const dataToSave = {
         ...formData,
         purchaseDate: formData.purchaseDate ? formData.purchaseDate : null,
         warrantyUntil: formData.warrantyUntil === 'SIN GARANTIA' || formData.warrantyUntil === 'VENCIDA' ? null : (formData.warrantyUntil ? formData.warrantyUntil : null),
         // Ensure photos is array
         photos: formData.photos || []
      };

      try {
         if (editingId) {
            await storage.updateEquipment({ ...dataToSave, id: editingId } as Equipment);
            setSuccessMsg('¡Registro actualizado!');
         } else {
            const finalEquip: Partial<Equipment> = dataToSave as Equipment;
            await storage.addEquipment(finalEquip as Equipment);
            setSuccessMsg('¡Registro exitoso!');
         }

         await refreshData();

         setTimeout(() => {
            setSuccessMsg('');
            setEditingId(null);
            setView('list');
            setFormData(initialFormState);
            setEmpSearchTerm('');
         }, 2000);
      } catch (err) {
         console.error("Error saving equipment:", err);
         setErrorMsg('Error al guardar el equipo. Verifique los datos.');
      }
   };


   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         const reader = new FileReader();
         reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({
               ...prev,
               photos: [...(prev.photos || []), base64String]
            }));
         };
         reader.readAsDataURL(file);
      }
   };

   const removePhoto = (index: number) => {
      setFormData(prev => ({
         ...prev,
         photos: prev.photos?.filter((_, i) => i !== index)
      }));
   };

   const handleEdit = (item: Equipment) => {
      setEditingId(item.id);
      setFormData(item);
      const resp = employees.find(e => e.id === item.responsibleId);
      setEmpSearchTerm(resp ? `${resp.name} ${resp.lastName}` : '');
      setView('new');
      window.scrollTo({ top: 0, behavior: 'smooth' });
   };

   const resetForm = () => {
      setEditingId(null);
      setFormData(initialFormState);
      setEmpSearchTerm('');
      generateAutoId();
      setErrorMsg('');
   };

   const updatePeripheral = (id: string, field: keyof Peripheral, value: string) => {
      setFormData(prev => ({
         ...prev,
         peripherals: prev.peripherals?.map(p => p.id === id ? { ...p, [field]: value } : p)
      }));
   };

   const getCategoryIcon = (catName: string) => {
      const name = catName.toLowerCase();
      if (name.includes('computación')) return <Laptop className="w-6 h-6" />;
      if (name.includes('satel')) return <Satellite className="w-6 h-6" />;
      return <Box className="w-6 h-6" />;
   };

   const IOSSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: () => void, label: string }) => (
      <div className="flex items-center gap-3">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
         <button
            type="button"
            onClick={onChange}
            disabled={isReadOnly}
            className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
         >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'right-1' : 'left-1'}`}></div>
         </button>
      </div>
   );

   return (
      <div className="space-y-8 pb-20 animate-in fade-in duration-500">

         {/* Header */}
         <div className="bg-[#1e3a8a] p-10 rounded-t-[2.5rem] shadow-xl text-white">
            <div className="flex items-center gap-6">
               <div className="bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
                  <Monitor className="w-10 h-10" />
               </div>
               <div>
                  <h1 className="text-3xl font-black tracking-tight uppercase">Sistema de Inventario Tecnológico</h1>
                  <p className="text-blue-100/70 font-bold uppercase text-[10px] tracking-widest mt-1">
                     {editingId ? `Editando: ${formData.internalId}` : 'Registro de nuevo equipo institucional'}
                  </p>
               </div>
            </div>
         </div>

         {/* TABS DE NAVEGACIÓN (Diseño según imagen) */}
         <div className="flex justify-center">
            <div className="flex items-center bg-white p-2 rounded-3xl border border-slate-100 shadow-sm gap-2">
               <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <Tag className="w-4 h-4" /> INVENTARIO
               </button>
               <button
                  onClick={() => { if (!editingId) resetForm(); setView('new'); }}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${view === 'new' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'text-blue-600 bg-white hover:bg-blue-50 border border-transparent'}`}
               >
                  <Plus className="w-4 h-4" /> {editingId ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}
               </button>
               <button
                  onClick={() => setView('categories')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all ${view === 'categories' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                  <Database className="w-4 h-4" /> CATEGORÍAS
               </button>
            </div>
         </div>

         {successMsg && <div className="bg-emerald-50 text-emerald-600 p-8 rounded-[2.5rem] border border-emerald-100 flex items-center gap-4 animate-in zoom-in font-black text-xs uppercase tracking-widest max-w-4xl mx-auto"><CheckCircle className="w-8 h-8" /> {successMsg}</div>}

         {view === 'new' && (
            <div className="space-y-12 max-w-6xl mx-auto">
               <form onSubmit={handleSaveEquipment} className="space-y-12">

                  {/* I. Datos Principales */}
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <Tag className="w-6 h-6 text-[#1e3a8a]" />
                        <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight font-sans">I. Categorización e Identidad</h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">ID Interno</label>
                           <input readOnly value={formData.internalId} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-slate-400" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría Principal *</label>
                           <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '' })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                              <option value="">Seleccionar...</option>
                              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Subcategoría *</label>
                           <select required disabled={!formData.category} value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                              <option value="">Seleccionar...</option>
                              {availableSubCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Marca *</label>
                           <input required type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Modelo *</label>
                           <input required type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Número de Serie (S/N) *</label>
                           <input required type="text" value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-blue-600 tracking-widest" />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-tight ml-1">MARBETE / ETIQUETA INTERNA</label>
                           <div className="flex gap-3">
                              <input type="text" placeholder="Ej: M-001, ETIQ-2024-01" value={formData.internalLabel || ''} onChange={e => setFormData({ ...formData, internalLabel: e.target.value })} className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm" />
                              <button type="button" onClick={() => setFormData({ ...formData, internalLabel: 'SIN MARBETE' })} className="px-6 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">SIN MARBETE</button>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Color</label>
                           <input type="text" placeholder="Gris, Negro, etc." value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                        </div>
                     </div>
                  </div>

                  {/* II. Hardware Integrado */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <Cpu className="w-6 h-6 text-[#1e3a8a]" />
                        <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">II. Hardware Integrado (Componentes Detallados)</h2>
                     </div>

                     {/* Bloque Pantalla */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 text-slate-700">
                              <Monitor className="w-5 h-5" />
                              <h4 className="text-[11px] font-black uppercase tracking-widest">Detalles de Pantalla</h4>
                           </div>
                           <IOSSwitch label="Incluir Pantalla" checked={!!formData.hasScreen} onChange={() => setFormData({ ...formData, hasScreen: !formData.hasScreen })} />
                        </div>
                        {formData.hasScreen && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marca *</label>
                                 <input placeholder="Ej: Dell, HP" value={formData.screenDetails?.brand} onChange={e => setFormData({ ...formData, screenDetails: { ...formData.screenDetails!, brand: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo *</label>
                                 <input placeholder="Ej: P2419H" value={formData.screenDetails?.model} onChange={e => setFormData({ ...formData, screenDetails: { ...formData.screenDetails!, model: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Serie (S/N) *</label>
                                 <input placeholder="Ej: SN-DELL7890" value={formData.screenDetails?.serial} onChange={e => setFormData({ ...formData, screenDetails: { ...formData.screenDetails!, serial: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-mono" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Características *</label>
                                 <input placeholder='Ej: 15.6", LED' value={formData.screenDetails?.specs} onChange={e => setFormData({ ...formData, screenDetails: { ...formData.screenDetails!, specs: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Bloque Teclado */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 text-slate-700">
                              <Keyboard className="w-5 h-5" />
                              <h4 className="text-[11px] font-black uppercase tracking-widest">Detalles de Teclado</h4>
                           </div>
                           <IOSSwitch label="Incluir Teclado" checked={!!formData.hasKeyboard} onChange={() => setFormData({ ...formData, hasKeyboard: !formData.hasKeyboard })} />
                        </div>
                        {formData.hasKeyboard && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marca *</label>
                                 <input placeholder="Ej: Dell, Logitech" value={formData.keyboardDetails?.brand} onChange={e => setFormData({ ...formData, keyboardDetails: { ...formData.keyboardDetails!, brand: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo *</label>
                                 <input placeholder="Ej: KB216" value={formData.keyboardDetails?.model} onChange={e => setFormData({ ...formData, keyboardDetails: { ...formData.keyboardDetails!, model: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Serie (S/N) - SI APLICA</label>
                                 <input placeholder="Ej: SN-KB123" value={formData.keyboardDetails?.serial} onChange={e => setFormData({ ...formData, keyboardDetails: { ...formData.keyboardDetails!, serial: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-mono" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Idioma / Tipo *</label>
                                 <input placeholder="Ej: Español Latino" value={formData.keyboardDetails?.language} onChange={e => setFormData({ ...formData, keyboardDetails: { ...formData.keyboardDetails!, language: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Bloque Batería */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 text-slate-700">
                              <Battery className="w-5 h-5" />
                              <h4 className="text-[11px] font-black uppercase tracking-widest">Detalles de Batería</h4>
                           </div>
                           <IOSSwitch label="Incluir Batería" checked={!!formData.hasBattery} onChange={() => setFormData({ ...formData, hasBattery: !formData.hasBattery })} />
                        </div>
                        {formData.hasBattery && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Marca *</label>
                                 <input placeholder="Ej: Dell" value={formData.batteryDetails?.brand} onChange={e => setFormData({ ...formData, batteryDetails: { ...formData.batteryDetails!, brand: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modelo *</label>
                                 <input placeholder="Ej: 04YP1Y" value={formData.batteryDetails?.model} onChange={e => setFormData({ ...formData, batteryDetails: { ...formData.batteryDetails!, model: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Serie (S/N) *</label>
                                 <input placeholder="Ej: SN-BAT123" value={formData.batteryDetails?.serial} onChange={e => setFormData({ ...formData, batteryDetails: { ...formData.batteryDetails!, serial: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-mono" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Capacidad *</label>
                                 <input placeholder="Ej: 60Wh" value={formData.batteryDetails?.capacity} onChange={e => setFormData({ ...formData, batteryDetails: { ...formData.batteryDetails!, capacity: e.target.value } })} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-xs" />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* III. Periféricos y Anexos */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#1e3a8a]">
                           <Zap className="w-6 h-6" />
                           <h2 className="text-xl font-black uppercase tracking-tight">III. Periféricos y Anexos (Cables y Otros)</h2>
                        </div>
                        <IOSSwitch label="Incluir Periféricos" checked={!!formData.hasPeripherals} onChange={() => setFormData({ ...formData, hasPeripherals: !formData.hasPeripherals })} />
                     </div>

                     {formData.hasPeripherals && (
                        <div className="space-y-6 animate-in slide-in-from-top-4">
                           <p className="text-[11px] font-medium text-slate-400 italic">Registro de todo lo que el equipo trae en su caja originalmente</p>
                           <div className="overflow-hidden rounded-3xl border border-slate-100">
                              <table className="w-full text-left">
                                 <thead className="bg-[#1e3a8a] text-white text-[9px] font-black uppercase tracking-widest">
                                    <tr>
                                       <th className="px-6 py-4">Anexo / Periférico</th>
                                       <th className="px-6 py-4">Marca / Modelo</th>
                                       <th className="px-6 py-4">Especificación (Longitud, Amperaje, etc.)</th>
                                       <th className="px-6 py-4 text-center w-20">Acción</th>
                                    </tr>
                                 </thead>
                                 <tbody className="bg-white divide-y divide-slate-50">
                                    {formData.peripherals?.map((p) => (
                                       <tr key={p.id}>
                                          <td className="px-4 py-3">
                                             <input value={p.type} onChange={e => updatePeripheral(p.id, 'type', e.target.value)} placeholder="Cargador AC" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                          </td>
                                          <td className="px-4 py-3">
                                             <input value={p.brandModel} onChange={e => updatePeripheral(p.id, 'brandModel', e.target.value)} placeholder="Ej: Dell 65W" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                          </td>
                                          <td className="px-4 py-3">
                                             <input value={p.specs} onChange={e => updatePeripheral(p.id, 'specs', e.target.value)} placeholder="Ej: 1.8m" className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                             <button type="button" onClick={() => setFormData({ ...formData, peripherals: formData.peripherals?.filter(item => item.id !== p.id) })} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash className="w-4 h-4" /></button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                           <div className="flex justify-center">
                              <button type="button" onClick={() => setFormData({ ...formData, peripherals: [...(formData.peripherals || []), { id: Math.random().toString(), type: '', brandModel: '', specs: '' }] })} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm">
                                 <Plus className="w-4 h-4" /> Agregar otro periférico
                              </button>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* IV. Adquisición */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <FileText className="w-6 h-6 text-[#1e3a8a]" />
                        <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">IV. Información de Adquisición y Estado</h2>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha de Compra</label>
                           <div className="flex gap-3">
                              <input type="date" value={formData.purchaseDate || ''} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                              <button type="button" onClick={() => setFormData({ ...formData, purchaseDate: '' })} className="px-4 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100">NO SE TIENE</button>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Proveedor</label>
                           <div className="flex gap-3">
                              <input type="text" placeholder="Ej: Dell México" value={formData.provider || ''} onChange={e => setFormData({ ...formData, provider: e.target.value })} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                              <button type="button" onClick={() => setFormData({ ...formData, provider: 'SE DESCONOCE' })} className="px-4 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100">SE DESCONOCE</button>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Número de Factura</label>
                           <div className="flex gap-3">
                              <input type="text" placeholder="Ej: FAC-2024-001" value={formData.invoiceNumber || ''} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                              <button type="button" onClick={() => setFormData({ ...formData, invoiceNumber: 'SIN FACTURA' })} className="px-4 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-blue-100">NO EXISTE FACTURA</button>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Condición del Equipo *</label>
                           <select required value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value as any })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Garantía Hasta</label>
                           <div className="space-y-3">
                              <input
                                 type="date"
                                 value={formData.warrantyUntil && formData.warrantyUntil.match(/^\d{4}-\d{2}-\d{2}$/) ? formData.warrantyUntil : ''}
                                 onChange={e => setFormData({ ...formData, warrantyUntil: e.target.value })}
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                              />
                              {(formData.warrantyUntil === 'SIN GARANTIA' || formData.warrantyUntil === 'VENCIDA') && (
                                 <p className="text-xs font-bold text-red-500 uppercase tracking-widest ml-2">
                                    Estado actual: {formData.warrantyUntil}
                                 </p>
                              )}
                              <div className="flex gap-3">
                                 <button type="button" onClick={() => setFormData({ ...formData, warrantyUntil: 'SIN GARANTIA' })} className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.warrantyUntil === 'SIN GARANTIA' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>NO HAY GARANTÍA</button>
                                 <button type="button" onClick={() => setFormData({ ...formData, warrantyUntil: 'VENCIDA' })} className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest border transition-all ${formData.warrantyUntil === 'VENCIDA' ? 'bg-red-600 text-white border-red-600' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>GARANTÍA YA VENCIÓ</button>
                              </div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsable Inicial *</label>
                           <div className="relative">
                              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                              <input type="text" placeholder="Buscar responsable..." value={empSearchTerm} onFocus={() => setShowEmpList(true)} onChange={e => { setEmpSearchTerm(e.target.value); setShowEmpList(true); }} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" />
                              {showEmpList && (
                                 <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                    {filteredEmployees.map(emp => (
                                       <button key={emp.id} type="button" onClick={() => { setFormData({ ...formData, responsibleId: emp.id }); setEmpSearchTerm(`${emp.name} ${emp.lastName}`); setShowEmpList(false); }} className="w-full p-4 text-left hover:bg-blue-50 border-b border-slate-50 last:border-0">
                                          <p className="text-sm font-bold text-slate-800">{emp.name} {emp.lastName}</p>
                                          <p className="text-[10px] text-slate-400 font-black uppercase">#{emp.badgeNumber}</p>
                                       </button>
                                    ))}
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Estado Operativo *</label>
                           <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-6 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm font-black text-blue-700 uppercase tracking-widest">
                              {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Ubicación Inicial *</label>
                           <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* V. Fotos */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
                     <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <Camera className="w-6 h-6 text-[#1e3a8a]" />
                        <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tight">V. Fotos de Respaldo</h2>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-3">
                           <label className="block w-full cursor-pointer group">
                              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-[2.5rem] bg-slate-50 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all">
                                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Camera className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                                    <p className="mb-2 text-sm text-slate-500 group-hover:text-blue-600 font-bold"><span className="font-semibold">Clic para subir foto</span> o arrastrar y soltar</p>
                                    <p className="text-xs text-slate-400">SVG, PNG, JPG (MAX. 5MB)</p>
                                 </div>
                                 <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                              </div>
                           </label>
                        </div>

                        {formData.photos?.map((photo, index) => (
                           <div key={index} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-lg group">
                              <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removePhoto(index)} className="absolute top-2 right-2 bg-red-500 text-white p-2 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                 X
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-100">
                     <button type="button" onClick={resetForm} className="flex-1 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-500 uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all">
                        Limpiar Formulario
                     </button>
                     {editingId && (
                        <button type="button" onClick={() => { setView('list'); setEditingId(null); setFormData(initialFormState); }} className="flex-1 py-5 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-red-100 transition-all">
                           Cancelar Edición
                        </button>
                     )}
                     <button type="submit" className="flex-[2] py-5 bg-[#1e3a8a] text-white rounded-2xl font-black text-xl shadow-2xl hover:bg-[#1a3a70] transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                        <Save className="w-7 h-7" /> Guardar en Inventario
                     </button>
                  </div>
               </form>
            </div>
         )}

         {view === 'list' && (
            <div className="space-y-12 max-w-7xl mx-auto">
               {/* BARRA DE BÚSQUEDA Y ESTADÍSTICAS (Diseño según imagen) */}
               <div className="bg-white p-6 md:p-10 rounded-[4rem] shadow-xl border border-slate-50 flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative flex-1 group w-full">
                     <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-blue-600 transition-colors" />
                     <input
                        type="text"
                        placeholder="Buscar activo tecnológico..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-20 pr-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-lg font-medium focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all"
                     />
                  </div>

                  <div className="flex gap-4 w-full md:w-auto">
                     <div className="flex-1 md:flex-none px-6 py-4 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">TOTAL ACTIVOS</p>
                        <p className="text-3xl font-black text-blue-700 leading-none">{equipment.length}</p>
                     </div>
                     <div className="flex-1 md:flex-none px-6 py-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">DISPONIBLES</p>
                        <p className="text-3xl font-black text-emerald-600 leading-none">{equipment.filter(e => e.status === 'Disponible').length}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                  {equipment.filter(e => e.brand.toLowerCase().includes(searchTerm.toLowerCase()) || e.model.toLowerCase().includes(searchTerm.toLowerCase()) || e.serialNumber.includes(searchTerm)).map(item => (
                     <div key={item.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all flex flex-col relative border-t-8 border-t-[#1e3a8a]">
                        <div className="aspect-video bg-slate-50 flex items-center justify-center p-12 relative">
                           <div className="text-slate-200 group-hover:scale-125 transition-transform duration-1000">
                              {getCategoryIcon(item.category)}
                           </div>
                           <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${item.status === 'Disponible' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                              {item.status}
                           </div>
                        </div>
                        <div className="p-10 space-y-6 flex-1 flex flex-col">
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-tighter">{item.category}</span>
                              <span className="text-[11px] text-slate-400 font-black tracking-widest">{item.internalId}</span>
                           </div>
                           <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{item.brand} {item.model}</h4>
                           <p className="text-[12px] font-mono font-black text-slate-400 tracking-[0.2em] mt-2">S/N: {item.serialNumber}</p>
                           <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex items-center gap-2.5 text-slate-500">
                                 <MapPin className="w-4 h-4 text-[#1e3a8a]" />
                                 <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[100px]">{item.location}</span>
                              </div>
                              <div className="flex gap-3">
                                 {!isReadOnly && <button onClick={() => handleEdit(item)} className="w-12 h-12 bg-blue-50 rounded-[1rem] flex items-center justify-center text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"><Edit2 className="w-5 h-5" /></button>}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {view === 'categories' && (
            <div className="max-w-7xl mx-auto p-16 bg-white rounded-[4rem] shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
               {categories.map(cat => (
                  <div key={cat.id} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group flex flex-col gap-6">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-[1.2rem] shadow-md flex items-center justify-center text-[#1e3a8a]">
                           {getCategoryIcon(cat.name)}
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">#{cat.code}</p>
                           <p className="text-xl font-black text-slate-800 uppercase tracking-tight">{cat.name}</p>
                        </div>
                     </div>
                     <p className="text-base text-slate-500 italic leading-relaxed">{cat.description}</p>
                     <div className="flex flex-wrap gap-2.5 pt-4">
                        {cat.subCategories.map(sub => <span key={sub} className="text-[10px] font-black px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 uppercase tracking-tight">{sub}</span>)}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default EquipmentPage;
