import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/WelcomeScreen.css';

function WelcomeScreen() {
  const navigate = useNavigate();

  const goToMenu = () => {
    navigate('/LoginScreen');
  };

  return (
    <div className="welcome-page-background">
      <div className="welcome-screen">
        <h1>WordUP</h1>
        <p>Aprenda palavras e idiomas</p>
        <button onClick={goToMenu}>Iniciar</button>
      </div>
    </div>
  );
}

export default WelcomeScreen;