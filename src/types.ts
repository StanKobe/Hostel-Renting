export type RoomType = 'Single' | 'Double' | 'Studio' | 'Suite';
export type RoomStatus = 'Available' | 'Reserved' | 'Occupied';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Awaiting Verification' | 'Overdue';
export type NotificationType = 'BookingRequest' | 'PaymentUploaded' | 'AccountCreated' | 'System';

export interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  image?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  type: RoomType;
  price: number; // Monthly price
  status: RoomStatus;
  tenantId?: string; // Links to Tenant if Occupied
  amenities: string[];
  gridRow: number; // For the seating-map style grid layout
  gridCol: number; // For the seating-map style grid layout
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  roomId: string;
  propertyId: string;
  startDate: string;
  durationMonths: number;
  status: 'Active' | 'Inactive';
}

export interface BookingRequest {
  id: string;
  propertyId: string;
  roomId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  startDate: string;
  durationMonths: number;
  status: 'Pending' | 'Approved' | 'Declined';
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  roomId: string;
  propertyId: string;
  billingMonth: string; // e.g. "June 2026"
  rentAmount: number;
  utilityAmount: number;
  maintenanceAmount: number;
  totalAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  paymentSlipUrl?: string; // Data URL or mockup image representing slip
  paymentDate?: string;
  paymentRef?: string;
  paymentNote?: string;
}

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: Record<string, any>; // extra info like login credentials for email preview
}
