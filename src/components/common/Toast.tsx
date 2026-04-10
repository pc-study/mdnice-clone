import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible && !show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 60,
      left: '50%',
      transform: `translateX(-50%) translateY(${show ? '0' : '-20px'})`,
      backgroundColor: '#35b378',
      color: '#fff',
      padding: '8px 24px',
      borderRadius: 4,
      fontSize: 14,
      zIndex: 10000,
      opacity: show ? 1 : 0,
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {message}
    </div>
  );
};
