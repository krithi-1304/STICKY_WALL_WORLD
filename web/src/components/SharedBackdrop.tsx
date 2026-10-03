import { FairyLights } from './FairyLights';

/** The same physical room stays mounted on both sides of the invitation. */
export function SharedBackdrop() {
  return <><div className="secret-backdrop" aria-hidden="true">
    <div className="secret-window"><div className="secret-window-sky"><span className="secret-moon"/><span className="secret-water"/><i/><i/><i/></div><span className="secret-window-sill"/></div>
    <p className="secret-aside secret-aside--left">for your eyes only ♡</p>
    <p className="secret-aside secret-aside--right">kept safe in the dark</p>
    <div className="secret-keepsakes"><span className="secret-candle"><i/></span><span className="secret-kept-letter"/><span className="secret-shelf"/></div><div className="secret-desk"/><div className="secret-room-glow"/>
  </div><FairyLights/></>;
}
