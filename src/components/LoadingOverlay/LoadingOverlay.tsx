import { CircleNotch } from '@phosphor-icons/react';
import styles from './LoadingOverlay.module.css';

type LoadingOverlayProps = {
  isVisible: boolean;
  message?: string;
};

export default function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <CircleNotch size={32} className={styles.spinner} weight="bold" />
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
} 