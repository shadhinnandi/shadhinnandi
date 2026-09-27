import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

// Opens a certificate image in a native <dialog>: focus is trapped and
// restored by the browser, and Escape closes it.
export default function CertificateButton({ image, title, href, children }) {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  if (!image) return null;

  return (
    <>
      <button type="button" className="text-link text-link--button" onClick={() => setOpen(true)}>
        {children || 'View certificate'}
        <Icon name="image" />
      </button>
      <dialog
        ref={dialogRef}
        className="cert-dialog"
        aria-label={title}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
      >
        <div className="cert-dialog__inner">
          <div className="cert-dialog__bar">
            <p className="cert-dialog__title">{title}</p>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close certificate">
              <Icon name="close" size={18} />
            </button>
          </div>
          {open && (
            <img src={image.full} width={image.width} height={image.height} alt={image.alt} decoding="async" />
          )}
          {href && (
            <p className="cert-dialog__foot">
              <a className="text-link" href={href} target="_blank" rel="noopener">
                Open original PDF
                <Icon name="external" />
              </a>
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
