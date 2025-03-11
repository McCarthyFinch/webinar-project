'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { House } from '@phosphor-icons/react';

type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('You are not authorized to view this page');
          }
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleGoBack = () => {
    router.push('/');
  };

  const renderContent = () => {
    if (loading) {
      return <div className={styles.loading}>Loading users...</div>;
    }

    if (error) {
      return <div className={styles.error}>{error}</div>;
    }

    return (
      <div className={styles.userList}>
        {users.map((user) => (
          <div key={user.id} className={styles.userCard}>
            <div className={styles.userInfo}>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userId}>ID: {user.id} {user.isAdmin && '• Admin'}</div>
            </div>
            <div className={styles.userActions}>
              {user.isAdmin && (
                <button className={`${styles.userButton} ${styles.adminButton}`} disabled>
                  Remove Admin
                </button>
              )}
              <button className={`${styles.userButton} ${styles.deleteButton}`} disabled>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <button onClick={handleGoBack} className={styles.navButton}>
          <House size={18} weight="fill" />
          Home
        </button>
      </div>
      
      <h1 className={styles.title}>User Management</h1>
      
      {renderContent()}
    </div>
  );
} 