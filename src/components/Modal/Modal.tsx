import { ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import styles from './Modal.module.css';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success';
};

export default function Modal({ isOpen, onClose, title, children, actions, type = 'info' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles[type]}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalContent}>
          {children}
        </div>
        {actions && (
          <div className={styles.modalFooter}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 