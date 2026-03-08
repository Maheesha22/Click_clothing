import { useState } from 'react';
import LoginPage from "./Pages/login";
import RegisterPage from "./Pages/register";
import ForgotPage from "./Pages/forgot";
import Dashboard from "./Pages/admin_dashboard1";

function App() {
  const [page, setPage] = useState("login");
  const [recoveryMsg, setRecoveryMsg] = useState("");

  const handleForgotSuccess = () => {
    setRecoveryMsg("We've sent you an email with a link to update your password.");
    setPage("login");
  };

  if (page === "dashboard") return <Dashboard />;
  if (page === "register")  return <RegisterPage onNavigate={setPage} />;
  if (page === "forgot")    return <ForgotPage onNavigate={setPage} onSuccess={handleForgotSuccess} />;
  return <LoginPage onLogin={() => setPage("dashboard")} onNavigate={setPage} recoveryMsg={recoveryMsg} />;
}

export default App;
