/** A little flame kept inside a rose wax heart: the archive's own seal. */
export function LetterSeal({ seal = false }: { seal?: boolean }) {
  return <svg className="letter-seal" viewBox="0 0 64 64" fill="none" aria-hidden="true">{!seal && <rect width="64" height="64" rx="17" fill="#101722"/>}<path d="M32 53C23 46 9 37 9 24c0-14 17-18 23-7 7-11 23-7 23 7 0 13-14 22-23 29Z" fill="#c9455c"/><path d="M32 49C23 42 13 35 13 25c0-10 12-14 19-3 7-11 19-7 19 3 0 10-10 17-19 24Z" stroke="#ffadb5" strokeOpacity=".55" strokeWidth="1.4"/><path d="M32 41c-17-8 0-19-2-27 14 12 21 22 2 27Z" fill="#ffc978"/><path d="M32 39c-7-3-2-8 1-13 6 7 5 10-1 13Z" fill="#fff1ce"/><path d="M21 16c-4 0-7 2-8 6" stroke="#ffd7cf" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round"/></svg>;
}
