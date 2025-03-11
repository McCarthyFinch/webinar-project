'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { House, Trash, ShieldCheck, ShieldSlash, Warning } from '@phosphor-icons/react';

type User = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

type ConfirmationDialog = {
  show: boolean;
  type: 'delete' | 'toggleAdmin';
  userId: number | null;
  username: string;
  isAdmin?: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationDialog>({
    show: false,
    type: 'delete',
    userId: null,
    username: ''
  });
  const router = useRouter();

  // Fetch all users
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

  // Handle toggling admin status
  const toggleAdminStatus = async (user: User) => {
    setConfirmation({
      show: true,
      type: 'toggleAdmin',
      userId: user.id,
      username: user.username,
      isAdmin: !user.isAdmin
    });
  };
  
  // Handle delete user
  const deleteUser = async (user: User) => {
    setConfirmation({
      show: true,
      type: 'delete',
      userId: user.id,
      username: user.username
    });
  };
  
  // Confirm action
  const confirmAction = async () => {
    if (!confirmation.userId) return;
    
    setActionLoading(true);
    
    try {
      if (confirmation.type === 'toggleAdmin') {
        const response = await fetch(`/api/admin/users/${confirmation.userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isAdmin: confirmation.isAdmin })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user');
        }
        
        const updatedUser = await response.json();
        setUsers(users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ));
      } else if (confirmation.type === 'delete') {
        const response = await fetch(`/api/admin/users/${confirmation.userId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        
        // Remove user from list
        setUsers(users.filter(user => user.id !== confirmation.userId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
      closeConfirmation();
    }
  };
  
  // Close confirmation dialog
  const closeConfirmation = () => {
    setConfirmation({
      show: false,
      type: 'delete',
      userId: null,
      username: ''
    });
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
              <button 
                className={`${styles.userButton} ${user.isAdmin ? styles.adminButton : styles.makeAdminButton}`} 
                onClick={() => toggleAdminStatus(user)}
              >
                {user.isAdmin ? (
                  <>
                    <ShieldSlash size={16} />
                    Remove Admin
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Make Admin
                  </>
                )}
              </button>
              <button 
                className={`${styles.userButton} ${styles.deleteButton}`} 
                onClick={() => deleteUser(user)}
              >
                <Trash size={16} />
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
      
      {/* Confirmation Dialog */}
      {confirmation.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <Warning size={24} weight="fill" className={styles.warningIcon} />
              <h2>
                {confirmation.type === 'delete' 
                  ? 'Confirm Delete' 
                  : confirmation.isAdmin 
                    ? 'Confirm Grant Admin' 
                    : 'Confirm Remove Admin'}
              </h2>
            </div>
            <div className={styles.modalBody}>
              {confirmation.type === 'delete' ? (
                <p>Are you sure you want to delete the user <strong>{confirmation.username}</strong>? This action cannot be undone.</p>
              ) : confirmation.isAdmin ? (
                <p>Are you sure you want to grant admin privileges to <strong>{confirmation.username}</strong>?</p>
              ) : (
                <p>Are you sure you want to remove admin privileges from <strong>{confirmation.username}</strong>?</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton} 
                onClick={closeConfirmation}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className={`${styles.confirmButton} ${confirmation.type === 'delete' ? styles.deleteConfirm : ''}`} 
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 