import { createContext, useContext, useState, ReactNode } from 'react';
import Modal from '@/components/Modal/Modal';
import styles from '@/components/Modal/Modal.module.css';

type ModalConfig = {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ModalContextType = {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
  };

  const hideModal = () => {
    setModalConfig(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalConfig && (
        <Modal
          isOpen={true}
          onClose={() => {
            modalConfig.onCancel?.();
            hideModal();
          }}
          title={modalConfig.title}
          type={modalConfig.type}
          actions={
            <>
              {modalConfig.onCancel && (
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => {
                    modalConfig.onCancel?.();
                    hideModal();
                  }}
                >
                  {modalConfig.cancelLabel || 'Cancel'}
                </button>
              )}
              {modalConfig.onConfirm && (
                <button
                  className={`${styles.button} ${modalConfig.type === 'error' ? styles.danger : styles.primary}`}
                  onClick={() => {
                    modalConfig.onConfirm?.();
                    hideModal();
                  }}
                >
                  {modalConfig.confirmLabel || 'Confirm'}
                </button>
              )}
            </>
          }
        >
          {modalConfig.message}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 