'use client';

import { ReactNode } from 'react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.adminLayout}>
      {children}
    </div>
  );
} 