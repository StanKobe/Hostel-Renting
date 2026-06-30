import React, { useState } from 'react';
import { Property, Room, Tenant, BookingRequest, Invoice, SystemNotification, RoomType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, DollarSign, Home, Plus, Trash2, Check, X, Eye, 
  MapPin, ClipboardList, ShieldAlert, Sparkles, UserPlus, Key, EyeOff, CheckCircle2, 
  AlertCircle, ChevronRight, BarChart3, Building
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface LandlordDashboardProps {
  properties: Property[];
  saveProperties: (properties: Property[]) => void;
  rooms: Room[];
  saveRooms: (rooms: Room[]) => void;
  tenants: Tenant[];
  saveTenants: (tenants: Tenant[]) => void;
  bookingRequests: BookingRequest[];
  saveBookingRequests: (requests: BookingRequest[]) => void;
  invoices: Invoice[];
  saveInvoices: (invoices: Invoice[]) => void;
  notifications: SystemNotification[];
  saveNotifications: (notifications: SystemNotification[]) => void;
}

export default function LandlordDashboard({
  properties,
  saveProperties,
  rooms,
  saveRooms,
  tenants,
  saveTenants,
  bookingRequests,
  saveBookingRequests,
  invoices,
  saveInvoices,
  notifications,
  saveNotifications
}: LandlordDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'requests' | 'payments' | 'tenants' | 'inventory'>('analytics');

  // Input forms states
  // Property Add
  const [newPropName, setNewPropName] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropImage, setNewPropImage] = useState('');

  // Room Add
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState<RoomType>('Single');
  const [newRoomPrice, setNewRoomPrice] = useState(500);
  const [newRoomRow, setNewRoomRow] = useState(1);
  const [newRoomCol, setNewRoomCol] = useState(1);
  const [newRoomAmenities, setNewRoomAmenities] = useState('High-Speed Wifi, Study Desk, Comfort Bed');

  // Tenant manual creation
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantUsername, setTenantUsername] = useState('');
  const [tenantPassword, setTenantPassword] = useState('');
  const [manualRoomId, setManualRoomId] = useState('');
  const [manualStartDate, setManualStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualDuration, setManualDuration] = useState(12);

  // States to toggle passwords visibility
  const [showPassword, setShowPassword] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // View slip modal state
  const [viewSlipUrl, setViewSlipUrl] = useState<string | null>(null);

  // --- STATS CALCULATIONS ---
  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;
  const occupancyRate = rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100) : 0;
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const outstandingRent = invoices
    .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // --- CHART DATA PREPARATION ---
  // Compile unique months
  const months = Array.from(new Set(invoices.map(inv => inv.billingMonth)));
  // Map billing month stats for charting
  const chartData = months.map(m => {
    const monthInvoices = invoices.filter(inv => inv.billingMonth === m);
    const collected = monthInvoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pending = monthInvoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const verifying = monthInvoices.filter(inv => inv.status === 'Awaiting Verification').reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    return {
      month: m,
      Collected: collected,
      Pending: pending,
      Verifying: verifying,
      TotalInvoiced: collected + pending + verifying
    };
  }).sort((a, b) => {
    // Sort chronologically if months have month names, or keep order.
    return 1; // simplest safe sort
  });

  // --- HANDLERS ---
  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg({ text: '', type: '' }), 4000);
  };

  // Add Property
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName || !newPropAddress) return;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      name: newPropName,
      address: newPropAddress,
      description: newPropDesc || 'Cosy hostel with fully loaded utility setups.',
      image: newPropImage || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'
    };

    saveProperties([...properties, newProp]);
    setSelectedPropertyId(newProp.id);
    
    setNewPropName('');
    setNewPropAddress('');
    setNewPropDesc('');
    setNewPropImage('');
    showFeedback('Successfully added new hostel location!');
  };

  // Add Room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !selectedPropertyId) return;

    // Check if room number already exists in this property
    const exists = rooms.some(r => r.propertyId === selectedPropertyId && r.roomNumber === newRoomNumber);
    if (exists) {
      showFeedback(`Room #${newRoomNumber} already exists in this hostel!`, 'error');
      return;
    }

    const amenitiesList = newRoomAmenities.split(',').map(a => a.trim()).filter(Boolean);

    const newRoom: Room = {
      id: `r-custom-${Date.now()}`,
      propertyId: selectedPropertyId,
      roomNumber: newRoomNumber,
      floor: newRoomFloor,
      type: newRoomType,
      price: Number(newRoomPrice),
      status: 'Available',
      amenities: amenitiesList,
      gridRow: Number(newRoomRow),
      gridCol: Number(newRoomCol)
    };

    saveRooms([...rooms, newRoom]);
    setNewRoomNumber('');
    showFeedback(`Room #${newRoomNumber} successfully added to floor map!`);
  };

  // Approve Rent Request (From Visitor)
  const handleApproveRequest = (request: BookingRequest) => {
    // 1. Generate username and password for Tenant
    const generatedUsername = request.visitorName.toLowerCase().replace(/\s+/g, '') + Math.floor(100 + Math.random() * 900);
    const generatedPassword = Math.random().toString(36).slice(-8); // 8-char random password
    const tenantId = `tenant-${Date.now()}`;

    // 2. Create Tenant Account
    const newTenant: Tenant = {
      id: tenantId,
      name: request.visitorName,
      email: request.visitorEmail,
      phone: request.visitorPhone,
      username: generatedUsername,
      password: generatedPassword,
      roomId: request.roomId,
      propertyId: request.propertyId,
      startDate: request.startDate,
      durationMonths: request.durationMonths,
      status: 'Active'
    };
    saveTenants([...tenants, newTenant]);

    // 3. Update room status to 'Occupied' and link to Tenant
    const updatedRooms = rooms.map(r => {
      if (r.id === request.roomId) {
        return { ...r, status: 'Occupied' as const, tenantId };
      }
      return r;
    });
    saveRooms(updatedRooms);

    // 4. Generate first month's invoice
    const roomDetails = rooms.find(r => r.id === request.roomId);
    const baseRent = roomDetails?.price || 500;
    const firstInvoice: Invoice = {
      id: `inv-gen-${Date.now()}`,
      tenantId,
      roomId: request.roomId,
      propertyId: request.propertyId,
      billingMonth: new Date(request.startDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
      rentAmount: baseRent,
      utilityAmount: 50, // standard utility estimation
      maintenanceAmount: 20, // standard maintenance fee
      totalAmount: baseRent + 70,
      dueDate: new Date(new Date(request.startDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days grace period
      status: 'Pending'
    };
    saveInvoices([...invoices, firstInvoice]);

    // 5. Update Request Status to Approved
    const updatedRequests = bookingRequests.map(req => {
      if (req.id === request.id) {
        return { ...req, status: 'Approved' as const };
      }
      return req;
    });
    saveBookingRequests(updatedRequests);

    // 6. Send automatic confirmation email simulation alert
    const credentialsNotification: SystemNotification = {
      id: `notif-${Date.now()}`,
      type: 'AccountCreated',
      title: `🔑 Booking Confirmed & Login Account Dispatched`,
      message: `SIMULATED EMAIL SENT TO: ${request.visitorEmail}. Hello ${request.visitorName}, your room selection # ${roomDetails?.roomNumber} has been verified by the landlord! Rent starts: ${request.startDate}. Access your tenant dashboard via Username: ${generatedUsername} / Password: ${generatedPassword}.`,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: { username: generatedUsername, password: generatedPassword, email: request.visitorEmail }
    };
    saveNotifications([credentialsNotification, ...notifications]);

    showFeedback(`Approved! Account generated and login details simulated for ${request.visitorName}`);
  };

  // Decline Rent Request
  const handleDeclineRequest = (request: BookingRequest) => {
    // 1. Set BookingRequest status to 'Declined'
    const updatedRequests = bookingRequests.map(req => {
      if (req.id === request.id) {
        return { ...req, status: 'Declined' as const };
      }
      return req;
    });
    saveBookingRequests(updatedRequests);

    // 2. Set Room availability status back to 'Available'
    const updatedRooms = rooms.map(r => {
      if (r.id === request.roomId) {
        return { ...r, status: 'Available' as const };
      }
      return r;
    });
    saveRooms(updatedRooms);

    showFeedback(`Request declined. Room released back into vacant pool.`, 'error');
  };

  // Manual Tenant Assignment
  const handleManualTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantEmail || !manualRoomId || !tenantUsername || !tenantPassword) return;

    const selectedRoom = rooms.find(r => r.id === manualRoomId);
    if (!selectedRoom) return;

    const tenantId = `tenant-${Date.now()}`;

    // 1. Create Tenant
    const newTenant: Tenant = {
      id: tenantId,
      name: tenantName,
      email: tenantEmail,
      phone: tenantPhone,
      username: tenantUsername,
      password: tenantPassword,
      roomId: manualRoomId,
      propertyId: selectedRoom.propertyId,
      startDate: manualStartDate,
      durationMonths: Number(manualDuration),
      status: 'Active'
    };
    saveTenants([...tenants, newTenant]);

    // 2. Update room to Occupied
    const updatedRooms = rooms.map(r => {
      if (r.id === manualRoomId) {
        return { ...r, status: 'Occupied' as const, tenantId };
      }
      return r;
    });
    saveRooms(updatedRooms);

    // 3. Generate first Invoice
    const firstInvoice: Invoice = {
      id: `inv-gen-${Date.now()}`,
      tenantId,
      roomId: manualRoomId,
      propertyId: selectedRoom.propertyId,
      billingMonth: new Date(manualStartDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
      rentAmount: selectedRoom.price,
      utilityAmount: 55,
      maintenanceAmount: 20,
      totalAmount: selectedRoom.price + 75,
      dueDate: new Date(new Date(manualStartDate).getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending'
    };
    saveInvoices([...invoices, firstInvoice]);

    // 4. Reset forms
    setTenantName('');
    setTenantEmail('');
    setTenantPhone('');
    setTenantUsername('');
    setTenantPassword('');
    setManualRoomId('');
    
    showFeedback(`Successfully created tenant account for ${tenantName}! Room linked.`);
  };

  // Verify and Approve Tenant Payment Slip
  const handleApprovePayment = (invoiceId: string) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'Paid' as const };
      }
      return inv;
    });
    saveInvoices(updatedInvoices);

    const invDetails = invoices.find(inv => inv.id === invoiceId);
    const tenantDetails = tenants.find(t => t.id === invDetails?.tenantId);

    // Send confirmation to notifications log
    const invoiceNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      type: 'System',
      title: 'Payment Slip Confirmed',
      message: `Landlord confirmed payment of $${invDetails?.totalAmount} from tenant ${tenantDetails?.name} for the billing period ${invDetails?.billingMonth}.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    saveNotifications([invoiceNotif, ...notifications]);

    showFeedback('Payment verified! Invoice status updated to Paid.');
  };

  // Reject Tenant Payment Slip (back to Pending/Overdue)
  const handleRejectPayment = (invoiceId: string) => {
    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { 
          ...inv, 
          status: 'Pending' as const, 
          paymentSlipUrl: undefined, 
          paymentRef: undefined, 
          paymentNote: 'Previous proof was rejected by Landlord. Please upload correct receipt.' 
        };
      }
      return inv;
    });
    saveInvoices(updatedInvoices);
    showFeedback('Payment proof rejected. Tenant will be prompted to re-submit.', 'error');
  };

  return (
    <div id="landlord-dashboard-root" className="space-y-8">
      
      {/* Top feedback banner */}
      <AnimatePresence>
        {feedbackMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xs border ${
              feedbackMsg.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-700'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
          >
            {feedbackMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">TOTAL COLLECTED</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-slate-800">${totalRevenue}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Fully Verified
            </span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">OCCUPANCY RATE</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-slate-800">{occupancyRate}%</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              {rooms.filter(r=>r.status === 'Occupied').length} / {rooms.length} Rooms Rented
            </span>
          </div>
        </div>

        {/* Outstanding Rent */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">OUTSTANDING DUES</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-slate-800">${outstandingRent}</h3>
            <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
              {invoices.filter(inv=>inv.status === 'Pending' || inv.status === 'Overdue').length} Pending Bills
            </span>
          </div>
        </div>

        {/* Active Tenants */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ACTIVE TENANTS</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black text-slate-800">{activeTenantsCount}</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              {tenants.filter(t=>t.status === 'Active').length} Managed Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-tight shrink-0 transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Financial Analytics
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-tight shrink-0 transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Booking Requests ({bookingRequests.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-tight shrink-0 transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Verify Receipts ({invoices.filter(i => i.status === 'Awaiting Verification').length})
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-tight shrink-0 transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'tenants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Tenant Provisions
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-tight shrink-0 transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Properties & Rooms
        </button>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      <div id="dashboard-tab-content">
        
        {/* 1. FINANCIAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Recharts Graphical Chart */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Collected Income vs Projections</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Real-time ledger overview aggregated by billing calendar months.</p>
              </div>

              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No invoices generated to analyze.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Collected" fill="#10b981" name="Collected Revenue ($)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="TotalInvoiced" fill="#2563eb" name="Total Invoiced ($)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Stats list */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Monthly Bill Status Tracker</h3>
              
              <div className="space-y-3 text-xs">
                {invoices.slice(0, 5).map((inv) => {
                  const t = tenants.find(tenant => tenant.id === inv.tenantId);
                  return (
                    <div key={inv.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800 block">{t?.name || 'Manual Assignment'}</span>
                        <span className="text-[10px] text-slate-400">{inv.billingMonth} • Room #{rooms.find(r=>r.id===inv.roomId)?.roomNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 block">${inv.totalAmount}</span>
                        <span className={`text-[9px] font-bold uppercase ${
                          inv.status === 'Paid' ? 'text-emerald-500' : inv.status === 'Awaiting Verification' ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. VISITOR BOOKING REQUESTS FEED */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Incoming Tenant Booking Requests</h3>
              <p className="text-xs text-slate-400 mt-1">
                These are visitors who locked room allocations via the floor map and are awaiting registration login codes.
              </p>
            </div>

            {bookingRequests.filter(req => req.status === 'Pending').length === 0 ? (
              <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No active pending tenant bookings. Vacant rooms are open on visitor maps.
              </div>
            ) : (
              <div className="space-y-4">
                {bookingRequests.filter(req => req.status === 'Pending').map((req) => {
                  const room = rooms.find(r => r.id === req.roomId);
                  const prop = properties.find(p => p.id === req.propertyId);
                  
                  return (
                    <div key={req.id} className="rounded-xl border border-slate-150 p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xs transition-shadow">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-800">{req.visitorName}</span>
                          <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">PENDING REVIEW</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Requested Location</span>
                            <span className="font-semibold text-slate-800">{prop?.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Selected Room</span>
                            <span className="font-bold text-blue-600">#{room?.roomNumber} ({room?.type})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Lease Term</span>
                            <span className="font-semibold text-slate-800">{req.durationMonths} Months</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold uppercase">Rent Starts</span>
                            <span className="font-semibold text-slate-800">{req.startDate}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-1">
                          <span>Email: <strong className="text-slate-600">{req.visitorEmail}</strong></span>
                          <span>Phone: <strong className="text-slate-600">{req.visitorPhone}</strong></span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 self-start md:self-center">
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve & Send Account
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req)}
                          className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. VERIFY TENANT RECEIPT SLIPS */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending Proof of Payment Verification</h3>
              <p className="text-xs text-slate-400 mt-1">
                Audit uploaded bank receipts or payment slip image files to clear outstanding tenant invoices.
              </p>
            </div>

            {invoices.filter(inv => inv.status === 'Awaiting Verification').length === 0 ? (
              <div className="bg-slate-50/50 rounded-xl p-8 border border-slate-100 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                All tenant rental payments are audited and clear.
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.filter(inv => inv.status === 'Awaiting Verification').map((inv) => {
                  const tenant = tenants.find(t => t.id === inv.tenantId);
                  const room = rooms.find(r => r.id === inv.roomId);
                  
                  return (
                    <div key={inv.id} className="rounded-xl border border-slate-150 p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="font-bold text-sm text-slate-800">{tenant?.name}</span>
                            <span className="text-slate-400 text-[10px] block mt-1">{inv.billingMonth} Rent • Room #{room?.roomNumber}</span>
                          </div>
                          
                          <div className="text-right bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            <span className="text-[9px] text-slate-400 block font-bold">TOTAL INVOICED</span>
                            <span className="font-black text-slate-800 text-sm">${inv.totalAmount}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">TXN REFERENCE</span>
                            <span className="font-mono font-bold text-slate-800">{inv.paymentRef}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">DATE OF PAYMENT</span>
                            <span className="font-semibold text-slate-800">{inv.paymentDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">TENANT NOTE</span>
                            <span className="text-slate-700 italic">"{inv.paymentNote || 'No notes'}"</span>
                          </div>
                        </div>

                        {/* Payment Slip attachment preview */}
                        {inv.paymentSlipUrl && (
                          <div className="pt-2">
                            <button
                              onClick={() => setViewSlipUrl(inv.paymentSlipUrl || null)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5"
                            >
                              <Eye className="w-4 h-4" />
                              View Uploaded Receipt Slip File
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Verification Controls */}
                      <div className="flex gap-2 self-start md:self-center shrink-0">
                        <button
                          onClick={() => handleApprovePayment(inv.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirm Payment
                        </button>
                        <button
                          onClick={() => handleRejectPayment(inv.id)}
                          className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors duration-150 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline Proof
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Picture Slip preview modal overlay */}
            {viewSlipUrl && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative space-y-4">
                  <h4 className="text-sm font-bold text-slate-800">Tenant Uploaded Payment Receipt</h4>
                  <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[380px] flex justify-center bg-slate-50">
                    <img src={viewSlipUrl} alt="Slip Receipt File" className="max-h-full max-w-full object-contain" />
                  </div>
                  <button
                    onClick={() => setViewSlipUrl(null)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. MANUAL TENANT ACCOUNTS CREATION */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col (2/3): Manual tenant allocation form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Provision Tenant & Assign Room</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Input tenant profile credentials manually and bind them to any vacant hostel room.
                </p>
              </div>

              <form onSubmit={handleManualTenantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="e.g. Robert Vance"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="e.g. robert@vance.com"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bind Room selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bind Vacant Room</label>
                    <select
                      required
                      value={manualRoomId}
                      onChange={(e) => setManualRoomId(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="">-- Choose Vacant Room --</option>
                      {rooms.filter(r => r.status === 'Available').map(r => {
                        const prop = properties.find(p => p.id === r.propertyId);
                        return (
                           <option key={r.id} value={r.id}>
                            #{r.roomNumber} - {r.type} (${r.price}/mo) at {prop?.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Lease schedule parameters */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contract Start</label>
                      <input
                        type="date"
                        required
                        value={manualStartDate}
                        onChange={(e) => setManualStartDate(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Duration</label>
                      <select
                        value={manualDuration}
                        onChange={(e) => setManualDuration(Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account credentials */}
                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" /> Account Username
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantUsername}
                      onChange={(e) => setTenantUsername(e.target.value)}
                      placeholder="e.g. robertvance"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                      <span className="flex items-center gap-1"><Key className="w-3.5 h-3.5 text-slate-400" /> Account Password</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-blue-500 hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={tenantPassword}
                      onChange={(e) => setTenantPassword(e.target.value)}
                      placeholder="Custom Password"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Create Tenant Account & Assign Room
                </button>
              </form>
            </div>

            {/* Right Col: Current active tenants list */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Registered Tenants Accounts</h3>
              
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {tenants.map(t => {
                  const room = rooms.find(r => r.id === t.roomId);
                  return (
                    <div key={t.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs hover:border-slate-200 transition-colors">
                      <div>
                        <span className="font-bold text-slate-800 block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Username: <strong className="text-slate-600 font-mono">{t.username}</strong></span>
                        <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">Room #{room?.roomNumber}</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 5. PROPERTIES & ROOMS INVENTORY SETUP */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Create Property Form */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Add Hostel Location Property</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Provision a new physical hostel building.</p>
              </div>

              <form onSubmit={handleAddProperty} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Hostel/Property Name</label>
                  <input
                    type="text"
                    required
                    value={newPropName}
                    onChange={(e) => setNewPropName(e.target.value)}
                    placeholder="e.g. Skyline Co-Living"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Address Location</label>
                  <input
                    type="text"
                    required
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    placeholder="e.g. 500 Broadway, New York"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Building Image Link (Optional)</label>
                  <input
                    type="text"
                    value={newPropImage}
                    onChange={(e) => setNewPropImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Property Description</label>
                  <textarea
                    rows={2}
                    value={newPropDesc}
                    onChange={(e) => setNewPropDesc(e.target.value)}
                    placeholder="Describe building amenities, proximity to universities, subway lanes..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Create Property Building
                </button>
              </form>
            </div>

            {/* Room Map Seeder Grid */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Seed New Room to Visual Seating Map</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Plot individual rooms at coordinates to form the seating selection map grid.</p>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Hostel Property</label>
                    <select
                      value={selectedPropertyId}
                      onChange={(e) => setSelectedPropertyId(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Room Number (e.g. 104)</label>
                    <input
                      type="text"
                      required
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="e.g. 104"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Floor Level</label>
                    <select
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value={1}>Floor 1</option>
                      <option value={2}>Floor 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Room Type</label>
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                      className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Single">Single ($650)</option>
                      <option value="Double">Double ($900)</option>
                      <option value="Studio">Studio ($1300)</option>
                      <option value="Suite">Suite ($1800)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Base Price ($/mo)</label>
                    <input
                      type="number"
                      required
                      value={newRoomPrice}
                      onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Grid layout parameters */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Grid Row (Height Index)</label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={newRoomRow}
                      onChange={(e) => setNewRoomRow(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Grid Col (Side Index)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newRoomCol}
                      onChange={(e) => setNewRoomCol(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 col-span-2">Cols range from 1 to 5. Column 3 represents the visual central corridor.</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Room Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={newRoomAmenities}
                    onChange={(e) => setNewRoomAmenities(e.target.value)}
                    placeholder="e.g. Balcony, Mini Fridge, Study Desk"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Plot Room into Grid Map
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
