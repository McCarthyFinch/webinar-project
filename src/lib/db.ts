import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Function to make the first user an admin
export async function ensureFirstUserIsAdmin() {
  try {
    // Count total users
    const userCount = await prisma.user.count();
    
    // If there's only one user, make them an admin
    if (userCount === 1) {
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      
      if (firstUser && !firstUser.isAdmin) {
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { isAdmin: true }
        });
        console.log(`User ${firstUser.username} (ID: ${firstUser.id}) has been made an admin as the first user.`);
      }
    }
  } catch (error) {
    console.error('Error ensuring first user is admin:', error);
  }
} 