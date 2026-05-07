// src/schemas/register.schema.ts

import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'Full name is required'),

  email: z
    .string()
    .email('Invalid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /[A-Z]/,
      'Must contain an uppercase letter',
    )
    .regex(
      /[a-z]/,
      'Must contain a lowercase letter',
    )
    .regex(
      /[0-9]/,
      'Must contain a number',
    ),

  confirmPassword: z.string(),

  whatsappNumber: z.string().optional(),

  phoneNumber: z.string().optional(),

  church: z.string().optional(),

  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterFormValues =
  z.infer<typeof registerSchema>;