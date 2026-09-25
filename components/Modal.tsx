"use client";

import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Modal({ open, title, subtitle, onClose, children, wide = false }: { open: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
      <div className={`modal-card ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">ARUNIKA</div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Tutup"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
