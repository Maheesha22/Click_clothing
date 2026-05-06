import { IcoLogout } from './shared';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens if they exist
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to home page
    navigate('/');
  };

  return (
    <button className="nav-item" style={{margin:0}} onClick={handleLogout}>
      <IcoLogout/><span className="lbl">Logout</span>
    </button>
  );
}

