/** Wick is drawn here, so the little messenger never needs an image request. */
export function Wick({ mood = 'waiting', letter = false }: { mood?: 'waiting' | 'shy' | 'happy'; letter?: boolean }) {
  return <svg className={`wick wick--${mood}`} viewBox="0 0 160 170" fill="none" aria-hidden="true">
    <ellipse cx="80" cy="157" rx="46" ry="7" fill="#000" opacity=".16"/>
    <g className="wick-body">
      <path d="M38 99C34 64 50 43 80 43s47 23 43 56l7 43c-12 10-19-3-28 1-15 10-21-3-30 0-17 10-21-4-30 0-11 5-13-1-12-8Z" fill="#f6e9cf" stroke="#d7bb96" strokeWidth="2"/>
      <path d="M51 68c5-12 13-17 21-18" stroke="#fff9eb" strokeWidth="5" strokeLinecap="round"/>
      <g className="wick-flame"><path d="M80 48C49 32 82 23 77 5c27 19 36 34 3 43Z" fill="#ffc978"/><path d="M81 45c-11-7-2-12 1-20 8 9 10 16-1 20Z" fill="#fff1bc"/></g>
      <g className="wick-eyes" fill="#4a3526"><ellipse cx="63" cy="86" rx="3.8" ry="5.5"/><ellipse cx="98" cy="86" rx="3.8" ry="5.5"/></g>
      <ellipse cx="52" cy="98" rx="9" ry="4" fill="#e9a8a2" opacity=".7"/><ellipse cx="108" cy="98" rx="9" ry="4" fill="#e9a8a2" opacity=".7"/>
      <path d={mood === 'happy' ? 'M73 100q7 12 15 0Z' : mood === 'shy' ? 'M76 103q4-5 8 0' : 'M75 101q5 6 11 0'} fill={mood === 'happy' ? '#a75d56' : 'none'} stroke="#755044" strokeWidth="2" strokeLinecap="round"/>
      {letter && <g transform="rotate(-8 80 125)"><rect x="39" y="111" width="85" height="46" rx="3" fill="#e6b5b5" stroke="#aa7b7b"/><path d="m40 113 41 26 42-26" stroke="#aa7b7b"/><path d="M81 145s-10-6-10-12c0-5 7-5 10-1 4-4 10-4 10 1 0 6-10 12-10 12" fill="#c9455c"/></g>}
      <ellipse cx="39" cy="121" rx="11" ry="8" transform="rotate(-25 39 121)" fill="#f6e9cf" stroke="#d7bb96" strokeWidth="1.5"/>
      <ellipse cx="122" cy="121" rx="11" ry="8" transform="rotate(25 122 121)" fill="#f6e9cf" stroke="#d7bb96" strokeWidth="1.5"/>
    </g>
  </svg>;
}
