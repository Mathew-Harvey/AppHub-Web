import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      {message}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'info') {
    setToast({ message, type, key: Date.now() });
  }

  function clearToast() {
    setToast(null);
  }

  const ToastElement = toast ? (
    <Toast
      key={toast.key}
      message={toast.message}
      type={toast.type}
      onClose={clearToast}
    />
  ) : null;

  return { showToast, ToastElement };
}
