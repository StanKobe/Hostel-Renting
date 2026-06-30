import { Property, Room, Tenant, BookingRequest, Invoice, SystemNotification } from '../types';

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Vista Co-Living, Central Park',
    address: '450 Central Park West, New York, NY 10025',
    description: 'Premium co-living hostel with panoramic skylines, state-of-the-art co-working space, and community events.',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prop-2',
    name: 'Metropolis Hostel, Downtown',
    address: '82 Wall Street, Financial District, New York, NY 10005',
    description: 'Sleek, industrial-style modern suites tailored for students, digital nomads, and young professionals.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600'
  }
];

// Helper to generate a room grid structure (like AirAsia sitting map)
// We have columns 1, 2, 3 (Aisle) 4, 5
const generateInitialRooms = (): Room[] => {
  const rooms: Room[] = [];
  
  // Property 1 (Vista Co-Living): 2 Floors, 10 rooms per floor (arranged in a 2x5 grid with aisle)
  const prop1Types: ('Single' | 'Double' | 'Studio' | 'Suite')[] = [
    'Single', 'Single', 'Double', 'Studio', 'Suite',
    'Single', 'Double', 'Double', 'Studio', 'Suite'
  ];
  
  for (let floor = 1; floor <= 2; floor++) {
    for (let i = 0; i < 10; i++) {
      const colNum = (i % 5) + 1;
      const rowNum = Math.floor(i / 5) + 1;
      const roomNum = `${floor}${rowNum}${colNum}`;
      
      // Determine status
      let status: 'Available' | 'Occupied' | 'Reserved' = 'Available';
      let tenantId: string | undefined = undefined;
      
      // Seed some occupied rooms
      if (floor === 1 && i === 1) {
        status = 'Occupied';
        tenantId = 'tenant-jane';
      } else if (floor === 1 && i === 4) {
        status = 'Occupied';
        tenantId = 'tenant-david';
      } else if (floor === 1 && i === 7) {
        status = 'Reserved';
      }
      
      const type = prop1Types[i];
      const price = type === 'Single' ? 650 : type === 'Double' ? 900 : type === 'Studio' ? 1300 : 1800;
      
      rooms.push({
        id: `r-p1-f${floor}-${roomNum}`,
        propertyId: 'prop-1',
        roomNumber: roomNum,
        floor,
        type,
        price,
        status,
        tenantId,
        amenities: type === 'Suite' 
          ? ['King Bed', 'Attached Bath', 'Balcony', 'Mini Fridge', 'Smart TV'] 
          : type === 'Studio' 
            ? ['Queen Bed', 'Attached Bath', 'Kitchenette', 'Study Desk'] 
            : ['Single Bed', 'Desk', 'Wardrobe', 'Shared Bath'],
        gridRow: rowNum,
        gridCol: colNum >= 3 ? colNum + 1 : colNum // create visual gap at column 3 for aisle
      });
    }
  }

  // Property 2 (Metropolis Hostel): 2 Floors, 8 rooms per floor (arranged in 2x4 grid with aisle)
  const prop2Types: ('Single' | 'Double' | 'Studio' | 'Suite')[] = [
    'Single', 'Double', 'Single', 'Studio',
    'Double', 'Suite', 'Single', 'Studio'
  ];
  
  for (let floor = 1; floor <= 2; floor++) {
    for (let i = 0; i < 8; i++) {
      const colNum = (i % 4) + 1;
      const rowNum = Math.floor(i / 4) + 1;
      const roomNum = `${floor}${rowNum}${colNum}`;
      
      let status: 'Available' | 'Occupied' | 'Reserved' = 'Available';
      let tenantId: string | undefined = undefined;
      
      if (floor === 1 && i === 2) {
        status = 'Occupied';
        tenantId = 'tenant-john';
      } else if (floor === 1 && i === 5) {
        status = 'Reserved';
      }
      
      const type = prop2Types[i];
      const price = type === 'Single' ? 550 : type === 'Double' ? 800 : type === 'Studio' ? 1150 : 1650;
      
      rooms.push({
        id: `r-p2-f${floor}-${roomNum}`,
        propertyId: 'prop-2',
        roomNumber: roomNum,
        floor,
        type,
        price,
        status,
        tenantId,
        amenities: type === 'Suite' 
          ? ['Attached Bath', 'Air Conditioning', 'Study Nook', 'Kitchenette'] 
          : ['Comfort Bed', 'Wardrobe', 'High-Speed Wifi'],
        gridRow: rowNum,
        gridCol: colNum >= 3 ? colNum + 1 : colNum // create visual gap at column 3 for aisle
      });
    }
  }

  return rooms;
};

const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-jane',
    name: 'Jane Smith',
    email: 'jane.smith@gmail.com',
    phone: '+1 (555) 019-2834',
    username: 'janesmith',
    password: 'password123',
    roomId: 'r-p1-f1-112', // r-p1-f1-112 matches floor 1, row 1, col 2 index 1
    propertyId: 'prop-1',
    startDate: '2026-04-01',
    durationMonths: 12,
    status: 'Active'
  },
  {
    id: 'tenant-david',
    name: 'David Chen',
    email: 'david.chen@hotmail.com',
    phone: '+1 (555) 012-9876',
    username: 'davidchen',
    password: 'password123',
    roomId: 'r-p1-f1-115', // floor 1, row 1, col 5 index 4
    propertyId: 'prop-1',
    startDate: '2026-05-15',
    durationMonths: 6,
    status: 'Active'
  },
  {
    id: 'tenant-john',
    name: 'John Doe',
    email: 'john.doe@yahoo.com',
    phone: '+1 (555) 014-4321',
    username: 'johndoe',
    password: 'password123',
    roomId: 'r-p2-f1-113', // prop-2, floor 1, index 2
    propertyId: 'prop-2',
    startDate: '2026-06-01',
    durationMonths: 12,
    status: 'Active'
  }
];

const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'req-1',
    propertyId: 'prop-1',
    roomId: 'r-p1-f1-123', // floor 1, row 2, col 3 index 7 (Reserved)
    visitorName: 'Alice Johnson',
    visitorEmail: 'alice.j@outlook.com',
    visitorPhone: '+1 (555) 045-6789',
    startDate: '2026-07-01',
    durationMonths: 12,
    status: 'Pending',
    createdAt: '2026-06-24T14:30:00Z'
  },
  {
    id: 'req-2',
    propertyId: 'prop-2',
    roomId: 'r-p2-f1-122', // floor 1, row 2, col 2 index 5 (Reserved)
    visitorName: 'Michael Chang',
    visitorEmail: 'mchang@edu.com',
    visitorPhone: '+1 (555) 078-1234',
    startDate: '2026-07-15',
    durationMonths: 6,
    status: 'Pending',
    createdAt: '2026-06-25T09:15:00Z'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  // Jane Smith (prop-1, Single - $650)
  {
    id: 'inv-jane-1',
    tenantId: 'tenant-jane',
    roomId: 'r-p1-f1-112',
    propertyId: 'prop-1',
    billingMonth: 'April 2026',
    rentAmount: 650,
    utilityAmount: 45,
    maintenanceAmount: 20,
    totalAmount: 715,
    dueDate: '2026-04-10',
    status: 'Paid',
    paymentDate: '2026-04-05',
    paymentRef: 'TXN-92837498'
  },
  {
    id: 'inv-jane-2',
    tenantId: 'tenant-jane',
    roomId: 'r-p1-f1-112',
    propertyId: 'prop-1',
    billingMonth: 'May 2026',
    rentAmount: 650,
    utilityAmount: 52,
    maintenanceAmount: 20,
    totalAmount: 722,
    dueDate: '2026-05-10',
    status: 'Paid',
    paymentDate: '2026-05-08',
    paymentRef: 'TXN-01928374'
  },
  {
    id: 'inv-jane-3',
    tenantId: 'tenant-jane',
    roomId: 'r-p1-f1-112',
    propertyId: 'prop-1',
    billingMonth: 'June 2026',
    rentAmount: 650,
    utilityAmount: 48,
    maintenanceAmount: 20,
    totalAmount: 718,
    dueDate: '2026-06-10',
    status: 'Awaiting Verification',
    paymentDate: '2026-06-09',
    paymentRef: 'TXN-88374921',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400',
    paymentNote: 'Paid via bank transfer. Please verify slip.'
  },
  // David Chen (prop-1, Suite - $1800)
  {
    id: 'inv-david-1',
    tenantId: 'tenant-david',
    roomId: 'r-p1-f1-115',
    propertyId: 'prop-1',
    billingMonth: 'May 2026',
    rentAmount: 1800,
    utilityAmount: 85,
    maintenanceAmount: 50,
    totalAmount: 1935,
    dueDate: '2026-05-25',
    status: 'Paid',
    paymentDate: '2026-05-22',
    paymentRef: 'TXN-88392019'
  },
  {
    id: 'inv-david-2',
    tenantId: 'tenant-david',
    roomId: 'r-p1-f1-115',
    propertyId: 'prop-1',
    billingMonth: 'June 2026',
    rentAmount: 1800,
    utilityAmount: 92,
    maintenanceAmount: 50,
    totalAmount: 1942,
    dueDate: '2026-06-25',
    status: 'Pending'
  },
  // John Doe (prop-2, Single - $550)
  {
    id: 'inv-john-1',
    tenantId: 'tenant-john',
    roomId: 'r-p2-f1-113',
    propertyId: 'prop-2',
    billingMonth: 'June 2026',
    rentAmount: 550,
    utilityAmount: 40,
    maintenanceAmount: 15,
    totalAmount: 605,
    dueDate: '2026-06-10',
    status: 'Overdue'
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    type: 'BookingRequest',
    title: 'New Booking Request - Vista Co-Living',
    message: 'Alice Johnson requested single occupancy in Room 123 for 12 months.',
    timestamp: '2026-06-24T14:30:00Z',
    read: false
  },
  {
    id: 'notif-2',
    type: 'BookingRequest',
    title: 'New Booking Request - Metropolis Hostel',
    message: 'Michael Chang requested Double occupancy in Room 122 for 6 months.',
    timestamp: '2026-06-25T09:15:00Z',
    read: false
  },
  {
    id: 'notif-3',
    type: 'PaymentUploaded',
    title: 'Payment Slip Uploaded - Jane Smith',
    message: 'Jane Smith uploaded a payment slip of $718 for June 2026. Awaiting your approval.',
    timestamp: '2026-06-09T18:40:00Z',
    read: false
  }
];

// LocalStorage Helper functions
const getStored = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getProperties = (): Property[] => getStored('hostel_properties', INITIAL_PROPERTIES);
export const saveProperties = (data: Property[]) => setStored('hostel_properties', data);

export const getRooms = (): Room[] => getStored('hostel_rooms', generateInitialRooms());
export const saveRooms = (data: Room[]) => setStored('hostel_rooms', data);

export const getTenants = (): Tenant[] => getStored('hostel_tenants', INITIAL_TENANTS);
export const saveTenants = (data: Tenant[]) => setStored('hostel_tenants', data);

export const getBookingRequests = (): BookingRequest[] => getStored('hostel_booking_requests', INITIAL_REQUESTS);
export const saveBookingRequests = (data: BookingRequest[]) => setStored('hostel_booking_requests', data);

export const getInvoices = (): Invoice[] => getStored('hostel_invoices', INITIAL_INVOICES);
export const saveInvoices = (data: Invoice[]) => setStored('hostel_invoices', data);

export const getNotifications = (): SystemNotification[] => getStored('hostel_notifications', INITIAL_NOTIFICATIONS);
export const saveNotifications = (data: SystemNotification[]) => setStored('hostel_notifications', data);

// Helper function to reset Database to initial state if needed
export const resetDatabase = () => {
  localStorage.removeItem('hostel_properties');
  localStorage.removeItem('hostel_rooms');
  localStorage.removeItem('hostel_tenants');
  localStorage.removeItem('hostel_booking_requests');
  localStorage.removeItem('hostel_invoices');
  localStorage.removeItem('hostel_notifications');
  window.location.reload();
};
