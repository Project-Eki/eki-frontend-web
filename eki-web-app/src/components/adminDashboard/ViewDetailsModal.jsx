import React, { useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ViewDetailsModal = ({
  isOpen,
  onClose,
  data,
  title = 'Details',
  onEdit,
  onDelete
}) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        overlayRef.current?.classList.add('opacity-100');
        modalRef.current?.classList.add('opacity-100', 'translate-y-0');
        modalRef.current?.classList.remove('opacity-0', 'translate-y-4');
      }, 10);
    }
  }, [isOpen]);

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Get entries from data
  const entries = data ? Object.entries(data) : [];

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')
      .replace(/^./, s => s.toUpperCase()).trim();

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center opacity-0 transition-opacity duration-300"
      style={{ background: 'rgba(10, 10, 20, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .modal-root { font-family: 'DM Sans', sans-serif; }
        .modal-title { font-family: 'DM Serif Display', serif; }

        .field-row {
          display: grid;
          grid-template-columns: 38% 1fr;
          gap: 0.5rem 1rem;
          align-items: baseline;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.15s;
        }
        .field-row:last-child { border-bottom: none; }
        .field-row:hover { background: rgba(99, 91, 255, 0.03); border-radius: 6px; }

        .scroll-area::-webkit-scrollbar { width: 4px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { background: #e0dff5; border-radius: 2px; }

        .btn-delete {
          background: white;
          border: 1.5px solid #fde0e0;
          color: #d94040;
          transition: all 0.18s;
        }
        .btn-delete:hover { background: #fff5f5; border-color: #f5b5b5; transform: translateY(-1px); box-shadow: 0 3px 10px rgba(217,64,64,0.12); }

        .btn-edit {
          background: linear-gradient(135deg, #D99201 0%, #b87d01 100%);
          color: white;
          border: none;
          box-shadow: 0 2px 12px rgba(217, 146, 1, 0.35);
          transition: all 0.18s;
        }
        .btn-edit:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(217, 146, 1, 0.45); }
        .btn-edit:active, .btn-delete:active { transform: translateY(0); }

        .close-btn { transition: all 0.15s; }
        .close-btn:hover { background: #f3f3f8; transform: rotate(90deg); }

        .badge-count {
          background: #FFF8ED;
          color: #D99201;
          font-size: 11px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div
        ref={modalRef}
        className="modal-root relative w-full max-w-lg mx-4 opacity-0 translate-y-4 transition-all duration-300"
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.8) inset',
          overflow: 'hidden',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #235E5D, #2d7876, #235E5D)', backgroundSize: '200% 100%' }} />

        {/* Header */}
        <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid #f0f0f5' }}>
          <div className="flex items-start justify-between">
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9b96c4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Record Info
              </p>
              <div className="flex items-center gap-2.5">
                <h2 className="modal-title" style={{ fontSize: '22px', color: '#16143a', lineHeight: 1.2 }}>
                  {title}
                </h2>
                <span className="badge-count">{entries.length} fields</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-btn"
              style={{ padding: '7px', borderRadius: '10px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9b96c4', marginTop: '2px' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="scroll-area" style={{ padding: '8px 28px', maxHeight: '54vh', overflowY: 'auto' }}>
          {entries.map(([key, value], i) => (
            <div key={key} className="field-row">
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#9b96c4', textTransform: 'uppercase', letterSpacing: '0.07em', paddingTop: '1px' }}>
                {formatKey(key)}
              </span>
              <span style={{
                fontSize: '14px',
                color: value !== null && value !== undefined && value !== '' ? '#16143a' : '#ccc',
                fontWeight: 400,
                wordBreak: 'break-word',
                fontStyle: (value === null || value === undefined || value === '') ? 'italic' : 'normal'
              }}>
                {formatValue(value)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 22px', background: '#fafafa', borderTop: '1px solid #f0f0f5' }}>
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '12px', color: '#bbb', fontWeight: 400 }}>
              Last updated just now
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onDelete?.(data)}
                className="btn-delete"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                <FiTrash2 size={14} />
                Delete
              </button>
              <button
                onClick={() => onEdit?.(data)}
                className="btn-edit"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                <FiEdit2 size={14} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;