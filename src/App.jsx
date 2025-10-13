import React, { useState } from "react";
import {
  FileText,
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Calendar,
} from "lucide-react";

/**
 * NGCServiceFormEnhanced - Flintham-style Orange + Dark variant
 * Primary palette: orange (#FF9E18), dark/navy (#0E223F), white.
 *
 * This file replaces the inline BRAND_CSS from previous variants to use the
 * orange/black/white-first color scheme you requested (with indigo accents).
 */

const INITIAL_STATE = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  companyName: "",
  companyNumber: "",
  serviceType: [],
  serviceWindow: "asap",
  specificServiceDate: "",
  addressChange: { newAddress: "", addressProof: null },
  sicUpdate: { add: "", remove: "", fee: 120 },
  nameChange: { proposedName: "", fee: 120 },
  directorUpdate: { directors: [] },
  shareholderUpdate: { shareholders: [] },
  vatRegistration: { voluntary: false, registrationDate: "", turnoverEstimate: "", proof: null, fee: 120 },
  incorporation: { incorporationType: "standard", sicCodes: "", fee: 300 },
  payroll: { employeeDetails: {} },
  additionalNotes: "",
};

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`;
}
function clone(obj){ try{ return structuredClone(obj); }catch(e){ return JSON.parse(JSON.stringify(obj)); } }

/* ---------------------------
   SERVICE GUIDANCE CONTENT (unchanged)
   --------------------------- */
const SERVICE_GUIDANCE = {
  'Address change': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: New registered address and <em>proof of address</em> from the individual requesting the change.</p>
      <p><strong>Acceptable proof</strong>: Utility bill, bank statement, council tax bill, rental contract.</p>
      <p className="text-xs text-gray-500">Companies House requires proof for address changes to prevent fraud. This applies to directors and shareholders when their registered address changes.</p>
    </div>
  ),
  'SIC code update': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: SIC codes to add and/or remove (e.g., <code>62020, 62090</code>).</p>
      <p>Every company must have at least one SIC code. We can update up to four codes. Fee: <strong>£120</strong>.</p>
    </div>
  ),
  'Company name change': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: Proposed new company name. The name must comply with Companies House rules and not clash with existing names.</p>
      <p className="text-xs text-gray-500">You can check availability on Companies House name-check tool before submitting.</p>
      <p>Fee estimate shown in the form.</p>
    </div>
  ),
  'Director update': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: For each director — full name, date of birth, address, and proof of ID (passport/driving licence).</p>
      <p className="text-xs text-gray-500">Directors must be 16+ and not disqualified. Fee: <strong>£120</strong> (per request set as estimate).</p>
    </div>
  ),
  'Shareholder update': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: Shareholder name, address, number/class/value of shares, and proof of ID where applicable.</p>
      <p className="text-xs text-gray-500">We help update the register of members and file any necessary Companies House forms.</p>
    </div>
  ),
  'VAT registration': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: Turnover estimate, desired registration date, and supporting documents (invoices/bank statements).</p>
      <p className="text-xs text-gray-500">Compulsory registration threshold and rules are set by HMRC — voluntary registration is available. Fee estimate shown in the form.</p>
    </div>
  ),
  'Company incorporation': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: Proposed company name, registered office (UK), director(s) details, shareholder(s) details and SIC codes.</p>
      <p className="text-xs text-gray-500">We handle Companies House filing and provide PSC setup guidance. Fee estimate shown in the form.</p>
    </div>
  ),
  'Payroll / new employee': (
    <div className="text-sm text-brand-dark space-y-2">
      <p><strong>What we need</strong>: Employee full name, start date, NI number (if available) and right-to-work documents.</p>
      <p className="text-xs text-gray-500">We can help onboard and set up payroll records — employer remains responsible for checks and statutory duties.</p>
    </div>
  ),
};

/* ---------------------------
   Component
   --------------------------- */
export default function NGCServiceFormEnhanced() {
  const [form, setForm] = useState(clone(INITIAL_STATE));
  const [errors, setErrors] = useState({});
  const [submittedJson, setSubmittedJson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({}); // tracks guidance panels open/close

  const SERVICES = [
    { name: 'Address change', icon: Building2, color: 'from-[#0E223F] to-[#1E3A8A]' },
    { name: 'SIC code update', icon: FileText, color: 'from-[#5B21B6] to-[#C026D3]' },
    { name: 'Company name change', icon: Sparkles, color: 'from-[#FF9E18] to-[#FB923C]' },
    { name: 'Director update', icon: Users, color: 'from-[#059669] to-[#10B981]' },
    { name: 'Shareholder update', icon: Users, color: 'from-[#3730A3] to-[#7C3AED]' },
    { name: 'VAT registration', icon: DollarSign, color: 'from-[#DC2626] to-[#F97316]' },
    { name: 'Company incorporation', icon: Building2, color: 'from-[#0E223F] to-[#1E3A8A]' },
    { name: 'Payroll / new employee', icon: Users, color: 'from-[#7C3AED] to-[#A78BFA]' },
  ];

  const SERVICE_WINDOW_OPTIONS = [
    { value: 'asap', label: 'ASAP', icon: '⚡' },
    { value: '3days', label: 'Within 3 days', icon: '📅' },
    { value: '1week', label: 'Within 1 week', icon: '📆' },
    { value: '2weeks', label: 'Within 2 weeks', icon: '🗓️' },
    { value: 'specific', label: 'Specific date', icon: '📍' },
  ];

  /* ---------------------------
     Helpers & state mutators
     --------------------------- */
  function toggleService(name){
    setForm(prev=> ({
      ...prev,
      serviceType: prev.serviceType.includes(name)
        ? prev.serviceType.filter(s=>s!==name)
        : [...prev.serviceType, name]
    }));
  }

  function toggleGuidance(name){
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  }

  function handleSimpleChange(key, value){ setForm(prev=> ({ ...prev, [key]: value })); }
  function setNested(path, value){ setForm(prev=>{ const copy = clone(prev); const keys = path.split('.'); let cur = copy; for(let i=0;i<keys.length-1;i++){ const k=keys[i]; if(cur[k]===undefined) cur[k] = {}; cur = cur[k]; } cur[keys[keys.length-1]] = value; return copy; }); }
  function handleFileChange(path,file){ setNested(path, file ? { name: file.name, size: file.size } : null); }

  function addDirector(){ setForm(prev=>{ const copy = clone(prev); copy.directorUpdate.directors.push({ id: uid('dir'), name:'', dob:'', address:'', idProof:null }); return copy; }); }
  function updateDirector(id,field,value){ setForm(prev=>{ const copy = clone(prev); const d = copy.directorUpdate.directors.find(x=>x.id===id); if(d) d[field]=value; return copy; }); }
  function removeDirector(id){ setForm(prev=> ({ ...prev, directorUpdate: { directors: prev.directorUpdate.directors.filter(d=>d.id!==id) } })); }

  function addShareholder(){ setForm(prev=>{ const copy = clone(prev); copy.shareholderUpdate.shareholders.push({ id: uid('sh'), name:'', shares:'', address:'', idProof:null }); return copy; }); }
  function updateShareholder(id,field,value){ setForm(prev=>{ const copy = clone(prev); const s = copy.shareholderUpdate.shareholders.find(x=>x.id===id); if(s) s[field]=value; return copy; }); }
  function removeShareholder(id){ setForm(prev=> ({ ...prev, shareholderUpdate: { shareholders: prev.shareholderUpdate.shareholders.filter(s=>s.id!==id) } })); }

  function validate(){
    const e = {};
    if(!form.clientName?.trim()) e.clientName='Required';
    if(!form.clientEmail?.trim()) e.clientEmail='Required';
    else if(!form.clientEmail.includes('@')||!form.clientEmail.includes('.')) e.clientEmail='Invalid email';
    if(!form.companyName?.trim()) e.companyName='Required';
    if(form.serviceType.length === 0) e.serviceType='Select at least one service';
    return e;
  }

  function handleSubmit(ev){
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if(Object.keys(e).length) return;
    const payload = { ...form, submittedAt: new Date().toISOString() };
    setSubmittedJson(payload);
    const blob = new Blob([JSON.stringify(payload,null,2)],{ type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(form.companyName||'ngc-request').replaceAll(' ','_')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function resetForm(){
    setForm(clone(INITIAL_STATE));
    setErrors({});
    setSubmittedJson(null);
    setExpandedSections({});
  }

  /* ---------------------------
     UX: open/scroll to service section
     --------------------------- */
  function sectionIdFromName(name){
    return `section-${name.replaceAll(' ','-')}`;
  }

  function openServiceSection(name){
    // ensure the service is selected
    setForm(prev=>{
      if(prev.serviceType.includes(name)) return prev;
      return { ...prev, serviceType: [...prev.serviceType, name] };
    });

    // open its guidance panel too (optional)
    setExpandedSections(prev => ({ ...prev, [name]: true }));

    // wait until the DOM reflects the newly-rendered section, then scroll
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const id = sectionIdFromName(name);
        const el = document.getElementById(id);
        if(el){
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  const selectedCount = form.serviceType.length;
  const totalFee = calculateTotalFee();

  function calculateTotalFee() {
    let total = 0;
    if (form.serviceType.includes('SIC code update')) total += form.sicUpdate.fee;
    if (form.serviceType.includes('Company name change')) total += form.nameChange.fee;
    if (form.serviceType.includes('Director update')) total += 120;
    if (form.serviceType.includes('Shareholder update')) total += 120;
    if (form.serviceType.includes('VAT registration')) total += form.vatRegistration.fee;
    if (form.serviceType.includes('Company incorporation')) total += form.incorporation.fee;
    return total;
  }

  /* ---------------------------
     Brand CSS injected locally (Orange + Dark / White)
     --------------------------- */
  const BRAND_CSS = `
    /* Flintham-inspired orange + dark palette */
    :root{
      --brand-orange: #FF9E18;    /* main CTA orange */
      --brand-orange-dark: #E58E12;
      --brand-dark: #0E223F;      /* deep navy / near-black */
      --brand-indigo: #1E3A8A;    /* accent indigo */
      --brand-light: #F8FAFC;     /* very light background */
      --text-dark: #334155;       /* muted text */
      --muted: #E6EDF6;
      --brand-orange-rgb: 255,158,24;
      --brand-dark-rgb: 14,34,63;
    }

    /* page root background */
    .brand-root {
      background: linear-gradient(180deg, var(--brand-light) 0%, rgba(255,255,255,0.95) 100%);
    }

    /* hero / header */
    .brand-hero {
      background: linear-gradient(90deg, var(--brand-dark) 0%, var(--brand-indigo) 100%);
    }

    /* primary CTA */
    .btn-primary {
      background: linear-gradient(90deg, var(--brand-orange), var(--brand-orange-dark));
      color: white;
      box-shadow: 0 6px 18px rgba(255,158,24,0.12);
    }
    .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }

    /* ghost / outline button */
    .btn-ghost {
      background: transparent;
      border-color: var(--muted);
      color: var(--text-dark);
    }

    /* small branded badge */
    .accent-badge {
      background: linear-gradient(90deg, var(--brand-orange), var(--brand-dark));
      color: white;
    }

    /* card style */
    .card {
      background: white;
      border: 1px solid rgba(14,34,63,0.06);
    }

    /* text helper */
    .text-brand-dark { color: var(--text-dark); }

    /* input/textarea focus */
    input:focus, textarea:focus, select:focus {
      outline: none;
      box-shadow: 0 0 0 6px rgba(var(--brand-orange-rgb), 0.06);
      border-color: var(--brand-orange);
    }

    /* selected services panel background */
    .selected-panel {
      background: linear-gradient(90deg, rgba(255,158,24,0.06), rgba(30,58,138,0.02));
      border-color: rgba(14,34,63,0.08);
    }

    /* small contrast helpers */
    .text-cta { color: var(--brand-orange); }
    .bg-dark { background: var(--brand-dark); color: white; }

    @media (prefers-reduced-motion: reduce) {
      .btn-primary { transition: none; }
    }
  `;

  return (
    <div className="min-h-screen py-8 px-4 brand-root">
      {/* inject brand css */}
      <style>{BRAND_CSS}</style>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 brand-hero opacity-95"></div>
            <div className="relative px-8 py-12 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl accent-badge backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">NGC & Associates LLP</h1>
                      <p className="text-white/90 text-lg mt-1">Professional Corporate Services</p>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden lg:block">
                  <div className="inline-flex flex-col gap-2">
                    <div className="px-6 py-3 rounded-xl bg-white/6 backdrop-blur-sm border border-white/20 card">
                      <div className="text-3xl font-bold">{selectedCount}</div>
                      <div className="text-sm text-white/90">Services Selected</div>
                    </div>
                    <div className="px-6 py-3 rounded-xl bg-white/6 backdrop-blur-sm border border-white/20 card">
                      <div className="text-2xl font-bold">£{totalFee}</div>
                      <div className="text-sm text-white/90">Est. Total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-dark)] flex items-center justify-center text-white font-bold text-lg shadow-lg accent-badge">
                    NG
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">Request Summary</h3>
                    <p className="text-xs text-gray-500">Service Dashboard</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service Window</label>
                    <select
                      value={form.serviceWindow}
                      onChange={e=>handleSimpleChange('serviceWindow', e.target.value)}
                      className="mt-2 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium"
                    >
                      {SERVICE_WINDOW_OPTIONS.map(o=> (
                        <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                      ))}
                    </select>
                    {form.serviceWindow === 'specific' && (
                      <input
                        type="date"
                        value={form.specificServiceDate}
                        onChange={e=>handleSimpleChange('specificServiceDate', e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Info</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company</span>
                        <span className="font-medium text-brand-dark truncate ml-2">{form.companyName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact</span>
                        <span className="font-medium text-brand-dark truncate ml-2">{form.clientName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Services</span>
                        <span className="font-bold text-[var(--brand-orange)]">{selectedCount}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-brand-dark font-semibold">Est. Fee</span>
                        <span className="text-xl font-bold text-[var(--brand-indigo)]">£{totalFee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 btn-ghost rounded-xl text-sm font-semibold"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2.5 btn-primary rounded-xl text-sm font-semibold shadow-lg"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {form.serviceType.length > 0 && (
                <div className="rounded-2xl p-5 border selected-panel card">
                  <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wide mb-3">Selected Services</h4>
                  <div className="space-y-2">
                    {form.serviceType.map(s=> (
                      <div key={s} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm card">
                        <CheckCircle2 className="w-4 h-4 text-[var(--brand-orange)]" />
                        <span className="text-sm font-medium text-brand-dark flex-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 card">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-brand-dark">Service Request Form</h2>
                <p className="text-gray-600 mt-2">Complete your details and select the services you need. We'll process your request promptly.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Client Information */}
                <section className="p-6 rounded-xl bg-[var(--brand-light)] border-2 border-[var(--muted)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-dark)] flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark">Client Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        value={form.clientName}
                        onChange={e=>handleSimpleChange('clientName', e.target.value)}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl ${errors.clientName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="John Doe"
                      />
                      {errors.clientName && <p className="text-red-600 text-xs mt-1 font-medium">{errors.clientName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={form.clientEmail}
                        onChange={e=>handleSimpleChange('clientEmail', e.target.value)}
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl ${errors.clientEmail ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="john@example.com"
                      />
                      {errors.clientEmail && <p className="text-red-600 text-xs mt-1 font-medium">{errors.clientEmail}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        value={form.clientPhone}
                        onChange={e=>handleSimpleChange('clientPhone', e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl"
                        placeholder="+44 123 456 7890"
                      />
                    </div>
                  </div>
                </section>

                {/* Company Details */}
                <section className="p-6 rounded-xl bg-white border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6D28D9] to-[#FB7185] flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark">Company Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                      <input
                        value={form.companyName}
                        onChange={e=>handleSimpleChange('companyName', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${errors.companyName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="Acme Corporation Ltd"
                      />
                      {errors.companyName && <p className="text-red-600 text-xs mt-1 font-medium">{errors.companyName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Number</label>
                      <input
                        value={form.companyNumber}
                        onChange={e=>handleSimpleChange('companyNumber', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="12345678"
                      />
                    </div>
                  </div>
                </section>

                {/* Services Selection with guidance chevrons */}
                <section className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF9E18] to-[#E58E12] flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brand-dark">Select Services</h3>
                      <p className="text-sm text-gray-600 mt-1">Click to add services — use the chevron to open guidance for each service.</p>
                    </div>
                  </div>

                  {errors.serviceType && <p className="text-red-600 text-sm font-medium mb-3">{errors.serviceType}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(({name, icon: Icon, color})=> {
                      const isSelected = form.serviceType.includes(name);
                      const isExpanded = !!expandedSections[name];
                      return (
                        <div key={name} className={`relative overflow-hidden rounded-xl border-2 transition-all ${isSelected ? 'border-transparent shadow-lg scale-105' : 'border-gray-200 bg-white hover:shadow-md'}`}>
                          <button
                            type="button"
                            onClick={()=>toggleService(name)}
                            className="w-full text-left px-5 py-4 flex items-start gap-3"
                          >
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10`}></div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg z-10`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 z-10">
                              <div className="font-bold text-brand-dark">{name}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{serviceHelper(name)}</div>
                            </div>
                            <div className="z-10 flex items-center gap-2">
                              {isSelected && <CheckCircle2 className="w-6 h-6 text-[var(--brand-orange)]" />}
                            </div>
                          </button>

                          {/* chevron / guidance toggle - stops propagation so it won't toggle selection */}
                          <button
                            type="button"
                            onClick={(e)=>{ e.stopPropagation(); toggleGuidance(name); }}
                            className="absolute top-2 right-2 z-20 p-2 rounded-full hover:bg-white/60"
                            aria-expanded={isExpanded}
                            aria-controls={`guidance-${name.replaceAll(' ','-')}`}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* guidance panel */}
                          <div id={`guidance-${name.replaceAll(' ','-')}`} className={`px-5 pb-4 pt-0 transition-all ${isExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
                            <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                              {SERVICE_GUIDANCE[name] || <div className="text-sm text-gray-600">No guidance available.</div>}

                              {/* contextual quick-actions: Open section will select & scroll */}
                              <div className="mt-3 flex gap-2">
                                <button type="button" onClick={()=>openServiceSection(name)} className="text-xs px-3 py-1 border rounded-lg">Open section</button>
                                <button type="button" onClick={()=>{/* fill example or show modal */}} className="text-xs px-3 py-1 border rounded-lg">Example</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Dynamic Service Sections (unchanged structure) */}
                {form.serviceType.includes('Address change') && (
                  <section id={sectionIdFromName('Address change')} className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <h4 className="text-lg font-bold text-brand-dark mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[var(--brand-indigo)]" />
                      Address Change
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Registered Address</label>
                        <textarea
                          value={form.addressChange.newAddress}
                          onChange={e=>setNested('addressChange.newAddress', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                          rows={3}
                          placeholder="Enter full address..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Proof of Address</label>
                        <input
                          type="file"
                          onChange={e=>handleFileChange('addressChange.addressProof', e.target.files[0])}
                          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm"
                        />
                        {form.addressChange.addressProof && (
                          <p className="text-xs text-[var(--brand-orange)] mt-2 font-medium">✓ {form.addressChange.addressProof.name}</p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* ... other dynamic sections remain the same visually / structurally ... */}

                {/* Additional Notes */}
                <section className="p-6 rounded-xl bg-gray-50 border-2 border-gray-200">
                  <h4 className="text-lg font-bold text-brand-dark mb-3">Additional Notes</h4>
                  <textarea
                    value={form.additionalNotes}
                    onChange={e=>handleSimpleChange('additionalNotes', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    rows={4}
                    placeholder="Any special requirements or additional information..."
                  />
                </section>

                {/* Submit Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-[var(--brand-light)] border-2 border-[var(--muted)]">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">Ready to submit?</p>
                    <p className="text-gray-600">By submitting, you confirm you have authority to request these changes.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 btn-ghost rounded-xl font-semibold"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 btn-primary rounded-xl font-semibold shadow-lg"
                    >
                      Submit & Download
                    </button>
                  </div>
                </div>

              </form>

              {/* Success Message */}
              {submittedJson && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-orange)] flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-brand-dark">Submission Successful!</h4>
                      <p className="text-sm text-gray-600">Your request has been processed and downloaded as JSON.</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <h5 className="font-semibold text-brand-dark mb-2">Preview:</h5>
                    <pre className="text-xs overflow-auto max-h-60 text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {JSON.stringify(submittedJson,null,2)}
                    </pre>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 NGC & Associates LLP. All rights reserved.</p>
          <p className="mt-1">Professional corporate services · Trusted by businesses nationwide</p>
        </footer>

      </div>
    </div>
  );
}

/* ---------------------------
   Helper for service helper text
   --------------------------- */
function serviceHelper(name){
  switch(name){
    case 'Address change': return 'Update registered address';
    case 'SIC code update': return 'Modify business codes';
    case 'Company name change': return 'Register new name';
    case 'Director update': return 'Add/remove directors';
    case 'Shareholder update': return 'Transfer shares';
    case 'VAT registration': return 'VAT setup & filing';
    case 'Company incorporation': return 'New company setup';
    case 'Payroll / new employee': return 'Employee onboarding';
    default: return '';
  }
}
