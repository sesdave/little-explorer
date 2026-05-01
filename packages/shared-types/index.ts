// @mle/types/src/index.ts
// //export * from './user.types';

/**
 * Mirroring the Prisma Enum for Type Safety across the app
 */
export enum SessionStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  REGISTRATION = 'REGISTRATION',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

/**
 * The Session Entity
 * Represents the root configuration for a camp/school term.
 */
export interface SessionEntity {
  id: string;
  name: string;
  year: number;
  status: SessionStatus;
  isActive: boolean;
  startDate: string; // ISO Date String
  endDate: string;   // ISO Date String
  registrationFee: number;
  
  // Aggregate data usually returned by the repository _count
  _count?: {
    classes: number;
    enrollments: number;
  };
}

/**
 * The Class Entity
 * Represents a specific section (e.g., "Lions") within a session.
 */
export interface ClassEntity {
  id: string;
  name: string;
  sessionId: string;
  capacity: number;
  ageMin: number;
  ageMax: number;
  
  // Principal-level Metadata
  clonedFromId?: string | null;
  
  // UI State: Transient properties not stored in DB
  isDirty?: boolean; 
  isNew?: boolean;   // Useful for highlighting newly added rows
  
  // Relation counts
  _count?: {
    enrollments: number;
  };
}

/**
 * DTO (Data Transfer Object) for Bulk Updates
 */
export interface BulkClassUpdateDto {
  classes: Partial<ClassEntity>[];
}

/**
 * Type Guard: Useful for checking if a class is a temporary "Local" class
 * before sending to the server.
 */
export const isTemporaryId = (id: string): boolean => id.startsWith('temp-');


export enum Role {
  ADMIN = 'ADMIN',
  PARENT = 'PARENT',
  INSTRUCTOR = 'INSTRUCTOR'
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO string
  parentId: string;
  photoUrl?: string | null;
  allergies?: string;
  createdAt?: string; 
}

export interface ClassSession {
  id: string;
  title: string;
  minAge: number;
  maxAge: number;
  price: number;
  capacity: number;
  enrolled: number;
}