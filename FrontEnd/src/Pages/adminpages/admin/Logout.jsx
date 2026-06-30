import { IcoLogout } from './shared';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
  };

  return (
    <button className="nav-item" style={{margin:0}} onClick={handleLogout}>
      <IcoLogout/><span className="lbl">Logout</span>
    </button>
  );
}
