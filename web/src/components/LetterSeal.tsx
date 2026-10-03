/** A moon kept in a folded note: the archive mark, without a badge on paper. */
export function LetterSeal({ seal = false }: { seal?: boolean }) {
  return <svg className="letter-seal" viewBox="0 0 64 64" fill="none" aria-hidden="true">{!seal && <><rect width="64" height="64" rx="16" fill="#101722"/><rect x="3" y="3" width="58" height="58" rx="13" stroke="#c3a875" strokeOpacity=".3"/></>}<path d="M17 12h23l9 10v29H17z" fill="#e9d9b9"/><path d="M40 12v11h9" fill="#ae9673"/><path d="M35 25a9 9 0 1 0 6 14 10 10 0 0 1-6-14Z" fill="#263748"/><path d="M23 45h17" stroke="#ae9673" strokeWidth="2" strokeLinecap="round"/></svg>;
}
