/**
 * Shared TypeScript types for the Travel Experiences B2B platform.
 * Centralized type definitions used across the application.
 */

// ─── Auth & User ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'ADMIN' | 'AGENCY' | 'CUSTOMER';

export interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// ─── Agency ────────────────────────────────────────────────────
export interface Agency {
  id: string;
  name: string;
  email: string;
  ownerId: string;
  commissionPercentage: number;
  isVerified: boolean;
  bankDetails?: BankDetails;
  payoutSchedule: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  routingNumber: string;
  swiftCode?: string;
}

// ─── Experience ────────────────────────────────────────────────
export interface Experience {
  id: string;
  title: string;
  slug: string;
  description: string;
  destination: string;
  category: string;
  coverImage: string;
  images: string[];
  basePrice: number;
  minGroupSize: number;
  maxGroupSize: number;
  difficultyLevel: DifficultyLevel;
  agencyId: string;
  status: ExperienceStatus;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
  agency?: Agency;
  reviews?: Review[];
  _count?: { bookings: number };
}

export type ExperienceStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type DifficultyLevel = 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

// ─── Booking ───────────────────────────────────────────────────
export interface Booking {
  id: string;
  bookingNumber: string;
  experienceId: string;
  agencyId: string;
  selectedDate: Date;
  numberOfParticipants: number;
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  participantName: string;
  participantEmail: string;
  specialRequests?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  experience?: Experience;
  agency?: Agency;
  payment?: Payment;
  invoice?: Invoice;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// ─── Payment ───────────────────────────────────────────────────
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'STRIPE' | 'RAZORPAY';

// ─── Invoice ───────────────────────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  agencyId: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  booking?: Booking;
  agency?: Agency;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID';

// ─── Review ────────────────────────────────────────────────────
export interface Review {
  id: string;
  experienceId: string;
  rating: number;
  title?: string;
  content?: string;
  isVerified: boolean;
  status: ReviewStatus;
  createdAt: Date;
  experience?: Experience;
}

export type ReviewStatus = 'PENDING' | 'APPROVED';

// ─── Team ──────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  userId: string;
  agencyId: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export const TEAM_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  AGENT: 'agent',
  VIEWER: 'viewer',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [TEAM_ROLES.OWNER]: ['experiences:manage', 'bookings:manage', 'invoices:manage', 'team:manage', 'settings:manage', 'analytics:view'],
  [TEAM_ROLES.MANAGER]: ['experiences:manage', 'bookings:manage', 'invoices:manage', 'analytics:view'],
  [TEAM_ROLES.AGENT]: ['experiences:view', 'bookings:manage', 'invoices:view'],
  [TEAM_ROLES.VIEWER]: ['experiences:view', 'bookings:view', 'invoices:view', 'analytics:view'],
};

// ─── API Key ───────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  agencyId: string;
  key: string;
  name?: string;
  isActive: boolean;
  createdAt: Date;
}

// ─── Audit Log ─────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  createdAt: Date;
  user?: User;
}

// ─── Notification Preferences ──────────────────────────────────
export interface NotificationPreference {
  id: string;
  agencyId: string;
  emailOnBooking: boolean;
  emailOnPayment: boolean;
  digestFrequency: DigestFrequency;
  createdAt: Date;
  updatedAt: Date;
}

export type DigestFrequency = 'WEEKLY' | 'MONTHLY' | 'NEVER';

// ─── API Responses ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Booking Calculation ───────────────────────────────────────
export interface BookingCalculation {
  basePrice: number;
  participants: number;
  subtotal: number;
  discount: number;
  discountPercent: number;
  taxes: number;
  total: number;
  agencyCommission: number;
  agencyPayout: number;
}

// ─── Payment Order ─────────────────────────────────────────────
export interface PaymentOrderResult {
  success: boolean;
  orderId?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  amount?: number;
  currency?: string;
  razorpayKey?: string;
  error?: string;
}

// ─── Dashboard Stats ───────────────────────────────────────────
export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  recentBookings: Booking[];
  revenueTrend: { month: string; revenue: number; bookings: number }[];
  topExperiences: { id: string; title: string; bookings: number; revenue: number }[];
}
