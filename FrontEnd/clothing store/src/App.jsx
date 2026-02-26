import React from 'react';
import HomePage from "./Pages/home";
import Cart from "./Pages/Cart";

function App() {
  if (window.location.pathname === '/cart') return <Cart />;
  return <HomePage />;
}

export default App;