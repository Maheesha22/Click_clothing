import { IcoLogout } from './shared';

export default function Logout() {
  return (
    <button className="nav-item" style={{margin:0}}>
      <IcoLogout/><span className="lbl">Logout</span>
    </button>
  );
}