"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  open: boolean;
  onClose: () => void;
}

export function Toast({ message, variant = "success", open, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(id);
  }, [open, onClose]);

  return (
    <div
      className={`toast ${open ? "toast--open" : ""} toast--${variant}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast__dot" aria-hidden />
      {message}
    </div>
  );
}
