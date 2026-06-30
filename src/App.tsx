import React, { useState, useEffect } from 'react';
import { 
  getProperties, saveProperties,
  getRooms, saveRooms,
  getTenants, saveTenants,
  getBookingRequests, saveBookingRequests,
  getInvoices, saveInvoices,
  getNotifications, saveNotifications,
  resetDatabase
} from './data/mockData';
import { Property, Room, Tenant, BookingRequest, Invoice, SystemNotification } from './types';
import VisitorPortal from './components/VisitorPortal';
import LandlordDashboard from './components/LandlordDashboard';
import TenantPortal from './components/TenantPortal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, ShieldCheck, UserCheck, Bell, Mail, RefreshCw, 
  HelpCircle, ChevronRight, Sparkles, Clock, Calendar, Laptop, Smartphone, CheckSquare
} from 'lucide-react';

export default function App() {
  // Sync core database state with React state hooks
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Navigation Portal
  const [activePortal, setActivePortal] = useState<'visitor' | 'landlord' | 'tenant'>('visitor');
  // Tenant Login persistence
  const [loggedInTenant, setLoggedInTenant] = useState<Tenant | null>(null);

  // Email simulation sidebar states
  const [showEmailsTray, setShowEmailsTray] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Dynamic Real-time Clock simulation
  const [currentTime, setCurrentTime] = useState('');

  // Initial Database Hydration
  useEffect(() => {
    setProperties(getProperties());
    setRooms(getRooms());
    setTenants(getTenants());
    setBookingRequests(getBookingRequests());
    setInvoices(getInvoices());
    setNotifications(getNotifications());
  }, []);

  // Sync state helpers to update both hook state and local storage instantly
  const handleSaveProperties = (newProps: Property[]) => {
    setProperties(newProps);
    saveProperties(newProps);
  };

  const handleSaveRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
    saveRooms(newRooms);
  };

  const handleSaveTenants = (newTenants: Tenant[]) => {
    setTenants(newTenants);
    saveTenants(newTenants);
  };

  const handleSaveBookingRequests = (newReqs: BookingRequest[]) => {
    setBookingRequests(newReqs);
    saveBookingRequests(newReqs);
  };

  const handleSaveInvoices = (newInvs: Invoice[]) => {
    setInvoices(newInvs);
    saveInvoices(newInvs);
  };

  const handleSaveNotifications = (newNotifs: SystemNotification[]) => {
    setNotifications(newNotifs);
    saveNotifications(newNotifs);
  };

  // Clock tick simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter generated credentials notifications (acts as our Simulated Email Outbox)
  const simulatedEmails = notifications.filter(
    n => n.type === 'AccountCreated' || n.type === 'BookingRequest' || n.type === 'PaymentUploaded'
  );

  return (
    <div id="app-container" className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col antialiased">
      
      {/* 🚀 Top Header Navigation and Clock */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Building2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              Hostel Renting & Payments
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
              Real-Time Availability & Automated Billing
            </span>
          </div>
        </div>

        {/* Portal Switcher Pill Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
          <button
            id="nav-visitor-portal"
            onClick={() => setActivePortal('visitor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
              activePortal === 'visitor'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Visitor Portal
          </button>
          <button
            id="nav-landlord-dashboard"
            onClick={() => setActivePortal('landlord')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 relative ${
              activePortal === 'landlord'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            Landlord Dashboard
            {bookingRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            )}
          </button>
          <button
            id="nav-tenant-portal"
            onClick={() => setActivePortal('tenant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
              activePortal === 'tenant'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Tenant Portal
          </button>
        </div>

        {/* Real-time Clock Widget */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-slate-700">June 2026</span>
          <span>•</span>
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono font-bold text-blue-600">{currentTime || '12:00:00 PM'}</span>
        </div>
      </header>

      {/* 📘 Interactive Step-by-Step Evaluator's Guide */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-6">
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-xl -z-10"></div>
          
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black text-blue-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              Evaluation Guide: How to Test the Complete End-to-End Real-Time System
            </h2>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              {showInstructions ? 'Collapse Guide' : 'Expand Guide'}
            </button>
          </div>

          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-slate-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  
                  {/* Step 1 */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 relative">
                    <span className="absolute top-2.5 right-3 text-2xl font-black text-slate-200/70 leading-none">01</span>
                    <h3 className="font-bold text-slate-800">Select Room</h3>
                    <p className="text-slate-500 leading-relaxed">
                      In <strong>Visitor Portal</strong>, click on a vacant green room (e.g. 113), select dates, fill details, and hit <strong>Submit Request</strong>.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 relative">
                    <span className="absolute top-2.5 right-3 text-2xl font-black text-slate-200/70 leading-none">02</span>
                    <h3 className="font-bold text-slate-800">Approve Booking</h3>
                    <p className="text-slate-500 leading-relaxed">
                      Switch to <strong>Landlord Dashboard</strong> → <em>Booking Requests</em>. Click <strong>Approve</strong>. Look at the <strong>Email Dispatcher Drawer</strong> for your new credentials!
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 relative">
                    <span className="absolute top-2.5 right-3 text-2xl font-black text-slate-200/70 leading-none">03</span>
                    <h3 className="font-bold text-slate-800">Upload Receipt Slip</h3>
                    <p className="text-slate-500 leading-relaxed">
                      Go to <strong>Tenant Portal</strong>, login with credentials (or click Quick Login). Click <strong>Upload Slip</strong>, input payment ref, drag file, and submit.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1.5 relative">
                    <span className="absolute top-2.5 right-3 text-2xl font-black text-slate-200/70 leading-none">04</span>
                    <h3 className="font-bold text-slate-800">Audit & Verify</h3>
                    <p className="text-slate-500 leading-relaxed">
                      Return to <strong>Landlord Dashboard</strong> → <em>Verify Receipts</em>. Inspect tenant's uploaded image receipt file and click <strong>Confirm Payment</strong>!
                    </p>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 📦 Primary Portal View Shell */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {activePortal === 'visitor' && (
            <motion.div
              key="visitor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <VisitorPortal
                properties={properties}
                rooms={rooms}
                saveRooms={handleSaveRooms}
                bookingRequests={bookingRequests}
                saveBookingRequests={handleSaveBookingRequests}
                notifications={notifications}
                saveNotifications={handleSaveNotifications}
                onNavigateToPortal={setActivePortal}
              />
            </motion.div>
          )}

          {activePortal === 'landlord' && (
            <motion.div
              key="landlord"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <LandlordDashboard
                properties={properties}
                saveProperties={handleSaveProperties}
                rooms={rooms}
                saveRooms={handleSaveRooms}
                tenants={tenants}
                saveTenants={handleSaveTenants}
                bookingRequests={bookingRequests}
                saveBookingRequests={handleSaveBookingRequests}
                invoices={invoices}
                saveInvoices={handleSaveInvoices}
                notifications={notifications}
                saveNotifications={handleSaveNotifications}
              />
            </motion.div>
          )}

          {activePortal === 'tenant' && (
            <motion.div
              key="tenant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <TenantPortal
                tenants={tenants}
                rooms={rooms}
                properties={properties}
                invoices={invoices}
                saveInvoices={handleSaveInvoices}
                notifications={notifications}
                saveNotifications={handleSaveNotifications}
                loggedInTenant={loggedInTenant}
                setLoggedInTenant={setLoggedInTenant}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 📥 Live Simulation Outbox & Email Dispatches Tray Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          id="toggle-email-tray"
          onClick={() => setShowEmailsTray(!showEmailsTray)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl flex items-center justify-center relative cursor-pointer group transition-transform hover:scale-105"
        >
          <Mail className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
            {simulatedEmails.length}
          </span>
          {/* Tooltip */}
          <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Open Simulated Emails Tray
          </span>
        </button>

        {/* Dropdown Outbox Panel */}
        <AnimatePresence>
          {showEmailsTray && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[460px] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Simulated Automated Mail Outbox</h3>
                </div>
                <button
                  onClick={() => setShowEmailsTray(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {simulatedEmails.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No automated emails dispatched yet. Book a room to generate logs!</p>
              ) : (
                <div className="space-y-3">
                  {simulatedEmails.map((email) => (
                    <div key={email.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-blue-600">
                          {email.type === 'AccountCreated' ? '🔑 Tenant Credentials Sent' : '📨 Booking Notification'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 font-mono text-[10px] leading-relaxed break-words bg-white border border-slate-100 p-2 rounded-lg">
                        {email.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🏠 Footer with Developer Reset tool */}
      <footer className="bg-white border-t border-slate-100 py-6 px-4 md:px-8 mt-auto text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Hostel Renting and Payments • Visual Grid Availability Map</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={resetDatabase}
            id="reset-db-button"
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-blue-150 hover:bg-blue-50/10 text-slate-500 hover:text-blue-600 rounded-lg text-xs font-semibold transition-colors duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset State to Initial Demo
          </button>
        </div>
      </footer>

    </div>
  );
}
