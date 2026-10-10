// Validation utility functions for the Travel Experiences platform
import { z } from 'zod';

// ─── Auth Validation ─────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'AGENCY', 'CUSTOMER']),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// ─── Experience Validation ───────────────────────────────────────
export const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(100).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens'
  ),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  destination: z.string().min(2, 'Destination is required'),
  category: z.string().min(2, 'Category is required'),
  coverImage: z.string().url('Please provide a valid image URL'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'At least one image is required'),
  basePrice: z.number().min(0, 'Price must be greater than 0'),
  minGroupSize: z.number().min(1, 'Minimum group size must be at least 1'),
  maxGroupSize: z.number().min(1, 'Maximum group size must be at least 1'),
  difficultyLevel: z.enum(['EASY', 'MODERATE', 'HARD', 'EXPERT']),
});

export const bookingFormSchema = z.object({
  selectedDate: z.date(),
  numberOfParticipants: z.number().int().min(1, 'At least 1 participant'),
  participantName: z.string().min(2, 'Name must be at least 2 characters'),
  participantEmail: z.string().email('Invalid email address'),
  specialRequests: z.string().optional(),
});

// ─── Invoice Validation ──────────────────────────────────────────
export const invoiceSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  agencyId: z.string().min(1, 'Agency ID is required'),
  subtotal: z.number().min(0, 'Subtotal must be greater than or equal to 0'),
  taxAmount: z.number().min(0, 'Tax amount must be greater than or equal to 0'),
});

// ─── Review Validation ───────────────────────────────────────────
export const reviewSchema = z.object({
  experienceId: z.string().min(1, 'Experience ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(100, 'Title must be at most 100 characters').optional(),
  content: z.string().max(1000, 'Content must be at most 1000 characters').optional(),
});

// ─── Team Member Validation ─────────────────────────────────────
export const teamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.string().min(1, 'Role is required'),
  permissions: z.array(z.string()).default([]),
});

// ─── Utility Types ───────────────────────────────────────────────
export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
export type EmailVerificationFormValues = z.infer<typeof emailVerificationSchema>;
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

// ─── Validation Helper ───────────────────────────────────────────
export function validateWithZodSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}