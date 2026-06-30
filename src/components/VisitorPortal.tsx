import React, { useState } from 'react';
import { Property, Room, BookingRequest, SystemNotification } from '../types';
import RoomMap from './RoomMap';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Calendar, Clock, DollarSign, Sparkles, Send, ShieldAlert, CheckCircle2, ListFilter, ShieldCheck } from 'lucide-react';

interface VisitorPortalProps {
  properties: Property[];
  rooms: Room[];
  saveRooms: (rooms: Room[]) => void;
  bookingRequests: BookingRequest[];
  saveBookingRequests: (requests: BookingRequest[]) => void;
  notifications: SystemNotification[];
  saveNotifications: (notifications: SystemNotification[]) => void;
  onNavigateToPortal: (portal: 'visitor' | 'landlord' | 'tenant') => void;
}

export default function VisitorPortal({
  properties,
  rooms,
  saveRooms,
  bookingRequests,
  saveBookingRequests,
  notifications,
  saveNotifications,
  onNavigateToPortal
}: VisitorPortalProps) {
  // Selected Property
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  // Selected Room ID
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  // Current floor being viewed
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  
  // Rent details
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // Default to 7 days from now
    return today.toISOString().split('T')[0];
  });
  const [durationMonths, setDurationMonths] = useState<number>(6);

  // Form details
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<BookingRequest | null>(null);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // Calculate pricing
  const monthlyPrice = selectedRoom?.price || 0;
  const securityDeposit = monthlyPrice; // 1 month deposit
  const totalAmount = monthlyPrice * durationMonths;

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedRoomId(null); // Reset room selection
    setCurrentFloor(1); // Reset to first floor
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !selectedPropertyId || !visitorName || !visitorEmail) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Create request ID
      const requestId = `req-${Date.now()}`;
      
      const newRequest: BookingRequest = {
        id: requestId,
        propertyId: selectedPropertyId,
        roomId: selectedRoomId,
        visitorName,
        visitorEmail,
        visitorPhone,
        startDate,
        durationMonths,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // 1. Save new booking request
      const updatedRequests = [newRequest, ...bookingRequests];
      saveBookingRequests(updatedRequests);

      // 2. Set room status to 'Reserved' so others cannot pick it
      const updatedRooms = rooms.map(r => {
        if (r.id === selectedRoomId) {
          return { ...r, status: 'Reserved' as const };
        }
        return r;
      });
      saveRooms(updatedRooms);

      // 3. Create Notification for Landlord
      const landlordNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        type: 'BookingRequest',
        title: `Booking Request from ${visitorName}`,
        message: `${visitorName} requested to rent Room ${selectedRoom?.roomNumber} at ${selectedProperty?.name} starting ${startDate} for ${durationMonths} months.`,
        timestamp: new Date().toISOString(),
        read: false,
        metadata: { requestId }
      };
      saveNotifications([landlordNotif, ...notifications]);

      setIsSubmitting(false);
      setSuccessBooking(newRequest);
    }, 1200);
  };

  const handleResetForm = () => {
    setSelectedRoomId(null);
    setVisitorName('');
    setVisitorEmail('');
    setVisitorPhone('');
    setSuccessBooking(null);
  };

  return (
    <div id="visitor-portal-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left 8 Columns: Selection & Map */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Step 1: Select Property (Hostel Location) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
            Select Hostel Location
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((p) => {
              const isSelected = p.id === selectedPropertyId;
              const countAvailable = rooms.filter(r => r.propertyId === p.id && r.status === 'Available').length;
              
              return (
                <div
                  key={p.id}
                  onClick={() => handlePropertyChange(p.id)}
                  className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500/30'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex gap-4">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1 text-slate-400 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="text-[11px] line-clamp-1">{p.address}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-2">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Availability Tracker:</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      countAvailable > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {countAvailable} Rooms Vacant
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Interactive Room Map Selector */}
        <RoomMap
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(id) => setSelectedRoomId(id === selectedRoomId ? null : id)}
          selectedPropertyId={selectedPropertyId}
          currentFloor={currentFloor}
          setCurrentFloor={setCurrentFloor}
        />
      </div>

      {/* Right 4 Columns: Booking Panel / Form */}
      <div className="lg:col-span-4">
        <div className="sticky top-6">
          <AnimatePresence mode="wait">
            {!successBooking ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                    Reservation Summary
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure your dates, lease duration, and details.
                  </p>
                </div>

                {/* Selected Room Metadata */}
                {selectedRoom ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">SELECTED HOSTEL ROOM</span>
                        <h4 className="text-sm font-bold text-slate-800">Room #{selectedRoom.roomNumber} ({selectedRoom.type})</h4>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                        ${selectedRoom.price}/mo
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-slate-400 font-semibold block">Included Room Perks:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedRoom.amenities.map((amen, idx) => (
                          <span key={idx} className="bg-white text-slate-600 border border-slate-100 text-[9px] font-semibold px-2 py-0.5 rounded-md">
                            {amen}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50/50 border border-dashed border-blue-150 rounded-xl p-6 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 text-blue-400 mx-auto mb-2.5" />
                    <p className="text-xs font-medium">Please select a green room from the layout map to view pricing and lock booking.</p>
                  </div>
                )}

                {/* Form fields */}
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Rent config */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Start Date
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Lease Period
                      </label>
                      <select
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months (Recommended)</option>
                        <option value={12}>12 Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  {selectedRoom && (
                    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-500">
                        <span>Monthly Rent:</span>
                        <span>${monthlyPrice}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Security Deposit (refundable):</span>
                        <span>${securityDeposit}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Contract Duration:</span>
                        <span>{durationMonths} Months</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 pt-1.5 border-t border-slate-200/60 text-sm">
                        <span>Total Rent Commitment:</span>
                        <span>${totalAmount}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact input fields */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Personal Details</h4>
                    
                    <div className="space-y-1">
                      <input
                        type="text"
                        required
                        disabled={!selectedRoom}
                        placeholder="Your Full Name"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <input
                        type="email"
                        required
                        disabled={!selectedRoom}
                        placeholder="Email Address"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <input
                        type="tel"
                        required
                        disabled={!selectedRoom}
                        placeholder="Phone Number (e.g., +1 555-1234)"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    id="submit-booking-button"
                    disabled={!selectedRoomId || isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:bg-slate-250 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting Rent Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Booking Request
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl border border-emerald-150 p-6 shadow-sm text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-150">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800">Booking Request Lodged!</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Your request for <strong>Room #{selectedRoom?.roomNumber}</strong> has been transmitted successfully to the hostel landlord.
                  </p>
                </div>

                {/* Progress tracker timeline */}
                <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 text-[11px] space-y-3.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">RENTAL ACTIVATION SEQUENCE</span>
                  
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</div>
                    <div>
                      <span className="font-semibold text-slate-800">Room Seat Selection</span>
                      <p className="text-[10px] text-slate-400">Room #{selectedRoom?.roomNumber} lock confirmed.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">✓</div>
                    <div>
                      <span className="font-semibold text-slate-800">Transmitted to Landlord</span>
                      <p className="text-[10px] text-slate-400">Alert generated in Landlord Notification dashboard.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">⏳</div>
                    <div>
                      <span className="font-semibold text-slate-700">Landlord Review</span>
                      <p className="text-[10px] text-slate-400">Landlord reviews details and verifies availability.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 opacity-50">
                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">4</div>
                    <div>
                      <span className="font-semibold text-slate-500">Automated Account Creation</span>
                      <p className="text-[10px] text-slate-400">On approval, login details will be instantly simulated and emailed.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onNavigateToPortal('landlord')}
                    className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Switch to Landlord to Approve Request
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold py-1.5 px-4 rounded-lg text-xs transition-all duration-150"
                  >
                    Choose Another Room
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
