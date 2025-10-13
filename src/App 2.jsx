cat > src/App.jsx << 'EOF'
import React, { useState } from "react";
import { FileText, Building2, Users, DollarSign, CheckCircle2, Sparkles } from "lucide-react";

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

export default function App() {
  const [form, setForm] = useState(clone(INITIAL_STATE));
  const [errors, setErrors] = useState({});
  const [submittedJson, setSubmittedJson] = useState(null);

  const SERVICES = [
    { name: 'Address change', icon: Building2, color: 'from-blue-500 to-cyan-500' },
    { name: 'SIC code update', icon: FileText, color: 'from-purple-500 to-pink-500' },
    { name: 'Company name change', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
    { name: 'Director update', icon: Users, color: 'from-green-500 to-emerald-500' },
    { name: 'Shareholder update', icon: Users, color: 'from-indigo-500 to-purple-500' },
    { name: 'VAT registration', icon: DollarSign, color: 'from-rose-500 to-pink-500' },
    { name: 'Company incorporation', icon: Building2, color: 'from-teal-500 to-cyan-500' },
    { name: 'Payroll / new employee', icon: Users, color: 'from-violet-500 to-purple-500' },
  ];

  const SERVICE_WINDOW_OPTIONS = [
    { value: 'asap', label: 'ASAP', icon: '⚡' },
    { value: '3days', label: 'Within 3 days', icon: '📅' },
    { value: '1week', label: 'Within 1 week', icon: '📆' },
    { value: '2weeks', label: 'Within 2 weeks', icon: '🗓️' },
    { value: 'specific', label: 'Specific date', icon: '📍' },
  ];

  function toggleService(name){ 
    setForm(prev=> ({ 
      ...prev, 
      serviceType: prev.serviceType.includes(name) 
        ? prev.serviceType.filter(s=>s!==name) 
        : [...prev.serviceType, name] 
    })); 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <header className="mb-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
            <div className="relative px-8 py-12 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">NGC & Associates LLP</h1>
                      <p className="text-blue-100 text-lg mt-1">Professional Corporate Services</p>
                    </div>
                  </div>
                  <div className="flex gap-3 ml-16">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium border border-white/30">Company Admin</span>
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium border border-white/30">VAT Services</span>
                    <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium border border-white/30">Payroll</span>
                  </div>
                </div>
                <div className="text-right hidden lg:block">
                  <div className="inline-flex flex-col gap-2">
                    <div className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                      <div className="text-3xl font-bold">{selectedCount}</div>
                      <div className="text-sm text-blue-100">Services Selected</div>
                    </div>
                    <div className="px-6 py-3 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-300/30">
                      <div className="text-2xl font-bold">£{totalFee}</div>
                      <div className="text-sm text-green-100">Est. Total</div>
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
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    NG
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Request Summary</h3>
                    <p className="text-xs text-gray-500">Service Dashboard</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service Window</label>
                    <select 
                      value={form.serviceWindow} 
                      onChange={e=>handleSimpleChange('serviceWindow', e.target.value)} 
                      className="mt-2 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Info</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{form.companyName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{form.clientName || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Services</span>
                        <span className="font-bold text-blue-600">{selectedCount}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-900 font-semibold">Est. Fee</span>
                        <span className="text-xl font-bold text-green-600">£{totalFee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={resetForm} 
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Submit
                  </button>
                </div>
              </div>

              {form.serviceType.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Selected Services</h4>
                  <div className="space-y-2">
                    {form.serviceType.map(s=> (
                      <div key={s} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 flex-1">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Service Request Form</h2>
                <p className="text-gray-600 mt-2">Complete your details and select the services you need.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <section className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Client Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input 
                        value={form.clientName} 
                        onChange={e=>handleSimpleChange('clientName', e.target.value)} 
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.clientName ? 'border-red-400' : 'border-gray-200'}`}
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
                        className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.clientEmail ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="john@example.com"
                      />
                      {errors.clientEmail && <p className="text-red-600 text-xs mt-1 font-medium">{errors.clientEmail}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input 
                        value={form.clientPhone} 
                        onChange={e=>handleSimpleChange('clientPhone', e.target.value)} 
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+44 123 456 7890"
                      />
                    </div>
                  </div>
                </section>

                <section className="p-6 rounded-xl bg-white border-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Company Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                      <input 
                        value={form.companyName} 
                        onChange={e=>handleSimpleChange('companyName', e.target.value)} 
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.companyName ? 'border-red-400' : 'border-gray-200'}`}
                        placeholder="Acme Corporation Ltd"
                      />
                      {errors.companyName && <p className="text-red-600 text-xs mt-1 font-medium">{errors.companyName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Company Number</label>
                      <input 
                        value={form.companyNumber} 
                        onChange={e=>handleSimpleChange('companyNumber', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="12345678"
                      />
                    </div>
                  </div>
                </section>

                <section className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">Select Services</h3>
                      <p className="text-sm text-gray-600 mt-1">Click to add services</p>
                    </div>
                  </div>
                  {errors.serviceType && <p className="text-red-600 text-sm font-medium mb-3">{errors.serviceType}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(({name, icon: Icon, color})=> {
                      const isSelected = form.serviceType.includes(name);
                      return (
                        <button 
                          key={name} 
                          type="button" 
                          onClick={()=>toggleService(name)} 
                          className={`relative overflow-hidden text-left px-5 py-4 rounded-xl border-2 transition-all ${isSelected ? 'border-transparent shadow-lg scale-105' : 'border-gray-200 bg-white hover:shadow-md'}`}
                        >
                          {isSelected && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10`}></div>
                          )}
                          <div className="relative flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">{name}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{serviceHelper(name)}</div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {form.serviceType.includes('Address change') && (
                  <section className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Address Change
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Registered Address</label>
                        <textarea 
                          value={form.addressChange.newAddress} 
                          onChange={e=>setNested('addressChange.newAddress', e.target.value)} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          <p className="text-xs text-green-600 mt-2 font-medium">✓ {form.addressChange.addressProof.name}</p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold">Ready to submit?</p>
                    <p className="text-gray-600">By submitting, you confirm authority to request these changes.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={resetForm} 
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-white transition-all"
                    >
                      Reset Form
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Submit & Download
                    </button>
                  </div>
                </div>

              </form>

              {submittedJson && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">Submission Successful!</h4>
                      <p className="text-sm text-gray-600">Your request has been processed.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 NGC & Associates LLP. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}

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
EOF