import React, { useState, useRef } from 'react';
import { Property, Room, Tenant, Invoice, SystemNotification } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, FileText, CheckCircle, Clock, AlertCircle, Upload, CreditCard, ChevronRight, LogOut, ArrowUpRight, HelpCircle, FileCheck, Landmark } from 'lucide-react';

interface TenantPortalProps {
  tenants: Tenant[];
  rooms: Room[];
  properties: Property[];
  invoices: Invoice[];
  saveInvoices: (invoices: Invoice[]) => void;
  notifications: SystemNotification[];
  saveNotifications: (notifications: SystemNotification[]) => void;
  loggedInTenant: Tenant | null;
  setLoggedInTenant: (tenant: Tenant | null) => void;
}

export default function TenantPortal({
  tenants,
  rooms,
  properties,
  invoices,
  saveInvoices,
  notifications,
  saveNotifications,
  loggedInTenant,
  setLoggedInTenant
}: TenantPortalProps) {
  // Login credentials states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Invoice for payment slip upload
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [uploadedSlipUrl, setUploadedSlipUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter invoices for the logged-in tenant
  const tenantInvoices = invoices.filter(inv => inv.tenantId === loggedInTenant?.id)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const tenantRoom = rooms.find(r => r.id === loggedInTenant?.roomId);
  const tenantProperty = properties.find(p => p.id === loggedInTenant?.propertyId);

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = tenants.find(
      t => t.username.toLowerCase() === username.trim().toLowerCase() && t.password === password
    );

    if (matched) {
      setLoggedInTenant(matched);
      setLoginError('');
      // Reset credentials form
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid username or password. Please try again or use the demo quick-login links below.');
    }
  };

  // One-click quick login for testing
  const handleQuickLogin = (tenant: Tenant) => {
    setLoggedInTenant(tenant);
    setLoginError('');
  };

  // Convert uploaded file to base64 for persistent preview
  const processFile = (file: File) => {
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedSlipUrl(reader.result as string);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try another image.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file dialog
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Submit Payment Slip
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentRef) return;

    // Use simulated slip if none uploaded
    const slipUrl = uploadedSlipUrl || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400';

    // 1. Update invoice in the list
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          status: 'Awaiting Verification' as const,
          paymentSlipUrl: slipUrl,
          paymentRef,
          paymentDate,
          paymentNote
        };
      }
      return inv;
    });
    saveInvoices(updatedInvoices);

    // 2. Alert the Landlord in notification system
    const paymentNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      type: 'PaymentUploaded',
      title: `Payment Uploaded - ${loggedInTenant?.name}`,
      message: `${loggedInTenant?.name} uploaded a payment slip of $${selectedInvoice.totalAmount} for ${selectedInvoice.billingMonth}. Reference: ${paymentRef}`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: { invoiceId: selectedInvoice.id }
    };
    saveNotifications([paymentNotif, ...notifications]);

    // Reset payment states
    setSelectedInvoice(null);
    setPaymentRef('');
    setPaymentNote('');
    setUploadedSlipUrl('');
  };

  // Render Login state
  if (!loggedInTenant) {
    return (
      <div id="tenant-login" className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-150 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tenant Portal Login</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your secure dashboard to view rents, download invoices, and upload receipts.
          </p>
        </div>

        {loginError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            id="tenant-login-submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs transition-colors duration-200 shadow-sm"
          >
            Authenticate Account
          </button>
        </form>

        {/* Demo Accounts Quick links */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Quick Login (Testing Accounts)</span>
          <div className="space-y-2">
            {tenants.map(t => (
              <button
                key={t.id}
                onClick={() => handleQuickLogin(t)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-blue-150 hover:bg-blue-50/10 text-left transition-all duration-150 text-xs text-slate-600 group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold group-hover:bg-blue-50 group-hover:text-blue-600">
                    {t.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block leading-none">{t.name}</span>
                    <span className="text-[9px] text-slate-400 mt-1 block">Username: {t.username}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Logged-In Tenant state
  return (
    <div id="tenant-dashboard" className="space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-lg font-bold">
            {loggedInTenant.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Welcome back, {loggedInTenant.name}!</h2>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active Contract
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered Resident in <strong>Room #{tenantRoom?.roomNumber}</strong> at <strong>{tenantProperty?.name}</strong>
            </p>
          </div>
        </div>

        {/* Action Logout */}
        <button
          onClick={() => setLoggedInTenant(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold transition-colors duration-200 self-start md:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (8): Invoices & payment slip upload */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Payment Slip Upload Modal/Panel */}
          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50/40 border border-blue-150 rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Submit Payment Slip for {selectedInvoice.billingMonth}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Invoice Total: <strong>${selectedInvoice.totalAmount}</strong>. Provide bank transfer details and attach your receipt.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Transaction Ref # (Required)</label>
                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. TXN-1029384"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="e.g. Transferred from JP Morgan account"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Drag and Drop File Upload Area */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Receipt/Payment Slip Slip Image</label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[140px] ${
                      dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-400 bg-white'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {uploadedSlipUrl ? (
                      <div className="relative w-full h-28 flex items-center justify-center">
                        <img
                          src={uploadedSlipUrl}
                          alt="Slip Preview"
                          className="max-h-full max-w-full rounded-lg object-contain shadow-xs border border-slate-100"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedSlipUrl('');
                          }}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full hover:bg-rose-600 shadow-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1" onClick={onButtonClick}>
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <span className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                          {uploading ? 'Reading...' : 'Click to Upload Slip'}
                        </span>
                        <p className="text-[10px] text-slate-400">or Drag & Drop PNG/JPG</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors duration-200 shadow-sm"
                  >
                    Submit Proof of Payment
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Billing & Rent Ledger */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Rent Invoices Ledger
            </h3>

            {tenantInvoices.length === 0 ? (
              <p className="text-xs text-slate-400">No rent invoices generated yet.</p>
            ) : (
              <div className="space-y-4">
                {tenantInvoices.map((inv) => {
                  const isPending = inv.status === 'Pending';
                  const isOverdue = inv.status === 'Overdue';
                  const isAwaiting = inv.status === 'Awaiting Verification';
                  const isPaid = inv.status === 'Paid';

                  return (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Invoice info */}
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : isAwaiting 
                              ? 'bg-amber-50 text-amber-600 border-amber-150' 
                              : isOverdue 
                                ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                : 'bg-slate-50 text-slate-600 border-slate-150'
                        }`}>
                          {isPaid ? <CheckCircle className="w-5 h-5" /> : isAwaiting ? <Clock className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-800">{inv.billingMonth} Rent</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700'
                                : isAwaiting
                                  ? 'bg-amber-100 text-amber-700'
                                  : isOverdue
                                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                                    : 'bg-slate-100 text-slate-700'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          
                          {/* Invoice breakdown details */}
                          <div className="flex items-center gap-3 text-slate-400 text-[10px] mt-1 flex-wrap">
                            <span>Due by: <strong>{inv.dueDate}</strong></span>
                            <span>•</span>
                            <span>Rent: ${inv.rentAmount}</span>
                            <span>•</span>
                            <span>Utilities: ${inv.utilityAmount}</span>
                            <span>•</span>
                            <span>Maint.: ${inv.maintenanceAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment amount & action */}
                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">TOTAL INVOICED</span>
                          <span className="text-sm font-bold text-slate-800">${inv.totalAmount}</span>
                        </div>
                        
                        {(isPending || isOverdue) && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPaymentRef('');
                              setUploadedSlipUrl('');
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors duration-150 shadow-xs flex items-center gap-1 shrink-0"
                          >
                            Upload Slip
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}

                        {isAwaiting && (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-100 flex items-center gap-1 shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            Verifying...
                          </span>
                        )}

                        {isPaid && (
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block font-semibold leading-none">REF: {inv.paymentRef}</span>
                            <span className="text-[9px] text-emerald-600 font-bold block mt-1">Paid on {inv.paymentDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column (4): Lease details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-500" />
                Lease Agreement Details
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your legal binding lease parameters.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Tenant Name:</span>
                <span className="font-semibold text-slate-800">{loggedInTenant.name}</span>
              </div>
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Room Number:</span>
                <span className="font-semibold text-blue-600">#{tenantRoom?.roomNumber}</span>
              </div>
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Room Category:</span>
                <span className="font-semibold text-slate-800">{tenantRoom?.type}</span>
              </div>
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Hostel Property:</span>
                <span className="font-semibold text-slate-800">{tenantProperty?.name}</span>
              </div>
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Start Date:</span>
                <span className="font-semibold text-slate-800">{loggedInTenant.startDate}</span>
              </div>
              <div className="pb-3 border-b border-slate-100 flex justify-between">
                <span className="text-slate-400 font-medium">Lease Term:</span>
                <span className="font-semibold text-slate-800">{loggedInTenant.durationMonths} Months</span>
              </div>
              <div className="pb-1 flex justify-between">
                <span className="text-slate-400 font-medium">Base Monthly Rent:</span>
                <span className="font-bold text-slate-800">${tenantRoom?.price}/mo</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex gap-2.5 items-start text-[11px] text-slate-500">
              <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700 mb-0.5">Automated Rent Generation</p>
                <span>Billing invoices are issued on the 1st of every calendar month. Standard grace period for payment is 10 days.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
