import { NextResponse } from 'next/server';

// Mock user data based on the screenshot but with cartoon characters
const mockUsers = [
  {
    "id": 1,
    "email": "bogdan.stankovic@onit.com",
    "username": "bogdan",
    "isAdmin": true,
    "createdAt": "2023-03-11T01:53:22.191Z",
    "updatedAt": "2023-03-11T08:24:24.682Z"
  },
  {
    "id": 3,
    "email": "mickey.mouse@disney.com",
    "username": "mickey",
    "isAdmin": false,
    "createdAt": "2023-03-11T08:28:12.994Z",
    "updatedAt": "2023-03-11T08:28:12.994Z"
  },
  {
    "id": 4,
    "email": "bugs.bunny@warnerbros.com",
    "username": "bugs",
    "isAdmin": false,
    "createdAt": "2023-03-11T01:21:40.778Z",
    "updatedAt": "2023-03-11T01:21:40.778Z"
  },
  {
    "id": 5,
    "email": "spongebob.squarepants@bikinibottom.com",
    "username": "spongebob",
    "isAdmin": false,
    "createdAt": "2023-03-11T01:22:54.881Z",
    "updatedAt": "2023-03-11T01:22:54.881Z"
  }
];

// GET handler for /api/admin/users
export async function GET() {
  // Return mock data as JSON response
  return NextResponse.json(mockUsers);
} 