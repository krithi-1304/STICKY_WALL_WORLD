import { useEffect, useRef, useState } from 'react';
import { HAND_FONTS, type HandFontId } from '../domain/types';

interface Props {
  value: HandFontId;
  onChange: (value: HandFontId) => void;
}

export function WritingStylePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = HAND_FONTS.find((font) => font.id === value) ?? HAND_FONTS[0];

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div className="writing-picker" ref={ref}>
      <button className="writing-picker__trigger" type="button" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen((current) => !current)}>
        <span className="writing-picker__eyebrow">Writing style</span>
        <span className="writing-picker__selected" style={{ fontFamily: selected.stack }}>{selected.label}</span>
        <span className="writing-picker__chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div className="writing-picker__menu" role="listbox" aria-label="Writing styles">
          {HAND_FONTS.map((font) => (
            <button key={font.id} type="button" role="option" aria-selected={font.id === value} className="writing-picker__option" onClick={() => { onChange(font.id); setOpen(false); }}>
              <span className="writing-picker__option-name" style={{ fontFamily: font.stack }}>{font.label}</span>
              <span className="writing-picker__option-sample" style={{ fontFamily: font.stack }}>A thought can stay soft.</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
