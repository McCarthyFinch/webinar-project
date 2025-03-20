import { prisma, ensureFirstUserIsAdmin } from './db';
import bcrypt from 'bcryptjs';

export interface UserData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function createUser(userData: UserData) {
  const { email, username, password } = userData;
  
  // Check if user already exists
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email }
  });
  
  if (existingUserByEmail) {
    throw new Error('Email already in use');
  }
  
  const existingUserByUsername = await prisma.user.findUnique({
    where: { username }
  });
  
  if (existingUserByUsername) {
    throw new Error('Username already taken');
  }
  
  // Check if this is the first user
  const userCount = await prisma.user.count();
  const isFirstUser = userCount === 0;
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      // Make the first user an admin automatically
      isAdmin: isFirstUser
    },
  });
  
  // If this wasn't the first user, still check if we need to make someone an admin
  // This handles edge cases where the first user might have been deleted
  if (!isFirstUser) {
    await ensureFirstUserIsAdmin();
  }
  
  // Return user without password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pwd, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function authenticateUser(loginData: LoginData) {
  const { email, password } = loginData;
  
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }
  
  // Return user without password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pwd, ...userWithoutPassword } = user;
  return userWithoutPassword;
} 