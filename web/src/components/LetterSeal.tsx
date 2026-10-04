/** A page kept in moonlight: the archive's quiet night-journal mark. */
export function LetterSeal({ seal = false }: { seal?: boolean }) {
  return <svg className="letter-seal" viewBox="0 0 64 64" fill="none" aria-hidden="true">{seal ? <circle cx="32" cy="32" r="31" fill="#151f2d"/> : <rect width="64" height="64" rx="16" fill="#0b1220"/>}<path d="M34 10C21 8 10 18 10 31c0 14 12 24 25 21-11-4-17-13-16-24 1-8 6-14 15-18Z" fill="#cdd6df"/><path d="M34 27h12l8 8v19H34V27Z" fill="#eadfc9"/><path d="M46 27v8h8" fill="#9aa8b7"/><path d="M39 41h9m-9 5h6" stroke="#526171" strokeWidth="2" strokeLinecap="round"/></svg>;
}
