import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWall } from '../state/wall';

const SYMBOLS = ['✷', '◈', '☾', '❋', '⌂', '✿', '◎', '☼'];

/** Create a room — name it, pick a symbol, hang it. */
export function NewRoom() {
  const createRoom = useWall((s) => s.createRoom);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState(SYMBOLS[0]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const room = createRoom({ name, symbol });
    navigate(`/r/${room.slug}`);
  }

  return (
    <main className="lobby">
      <header className="lobby__header">
        <h1 className="lobby__title">New room</h1>
        <p className="lobby__subtitle">Name it, mark it, hang it.</p>
      </header>

      <form onSubmit={onSubmit} style={formStyle}>
        <label style={labelStyle}>
          Room name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Late night thoughts"
            autoFocus
            maxLength={60}
            style={inputStyle}
          />
        </label>

        <fieldset style={fieldStyle}>
          <legend style={labelStyle}>Symbol</legend>
          <div style={symbolGridStyle}>
            {SYMBOLS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymbol(s)}
                aria-pressed={symbol === s}
                style={{
                  ...symbolBtnStyle,
                  ...(symbol === s ? symbolBtnActiveStyle : {}),
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <div style={rowStyle}>
          <Link to="/" style={backStyle}>← Back</Link>
          <button type="submit" style={submitStyle} disabled={!name.trim()}>
            Hang it up
          </button>
        </div>
      </form>
    </main>
  );
}

const formStyle: React.CSSProperties = {
  maxWidth: 400,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--sp-8)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'var(--bw-text-dim)',
  marginBottom: 'var(--sp-2)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--sp-3) var(--sp-4)',
  background: 'var(--bw-ash)',
  border: '1px solid var(--bw-line-strong)',
  borderRadius: 'var(--r-md)',
  color: 'var(--bw-text)',
  fontSize: '1rem',
  fontFamily: 'var(--font-title)',
  letterSpacing: '0.02em',
};

const fieldStyle: React.CSSProperties = {
  border: 'none',
  padding: 0,
  margin: 0,
};

const symbolGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 'var(--sp-2)',
};

const symbolBtnStyle: React.CSSProperties = {
  padding: 'var(--sp-3)',
  fontSize: '1.3rem',
  background: 'var(--bw-ash)',
  border: '1px solid var(--bw-line)',
  borderRadius: 'var(--r-md)',
  color: 'var(--bw-text-dim)',
  transition: 'all var(--dur-fast) var(--ease-out)',
};

const symbolBtnActiveStyle: React.CSSProperties = {
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
  background: 'rgba(201, 168, 106, 0.08)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const backStyle: React.CSSProperties = {
  color: 'var(--bw-text-dim)',
  textDecoration: 'none',
  fontSize: '0.9rem',
};

const submitStyle: React.CSSProperties = {
  padding: 'var(--sp-3) var(--sp-6)',
  background: 'var(--tag)',
  color: 'var(--tag-ink)',
  borderRadius: 'var(--r-md)',
  fontWeight: 500,
  fontSize: '0.9rem',
};
