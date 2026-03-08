import React, { useState } from 'react'
import LoginPage from "./Pages/login";
import Dashboard from "./Pages/admin_dashboard1";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
}

export default App;