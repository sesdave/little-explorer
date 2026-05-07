import { Prisma } from '@prisma/client';

export const userWithDismissalSelect =
  Prisma.validator<Prisma.UserSelect>()({
    name: true,
    email: true,
    isEmailVerified: true,

    children: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        dob: true,

        registrations: {
          select: {
            sessionId: true,
            status: true,
          },
        },
      },
    },

    dismissalContacts: {
      select: {
        id: true,
        name: true,
        relationship: true,
        phone: true,
      },
    },
  });

export type UserWithDismissalSelect = Prisma.UserGetPayload<{
  select: typeof userWithDismissalSelect;
}>;