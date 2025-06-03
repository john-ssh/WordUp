import React from 'react';
import './css/MenuScreen.css';
import { Link } from 'react-router-dom';

function MenuScreen() {
  return (
    <div className="welcome-page-background">
      <div className="menu-screen">
        <h1>WordUP</h1>
        <p>É recomendado aprender um idioma por vez</p>

        <section className="progress-section">
          <h2>Diário de Progresso</h2>
          <div className="language-buttons">
            <Link to="/english" className="language-button english">
              <img src="/flag1.webp" alt="Language 1 Flag" />
            </Link>
            <Link to="/japanese" className="language-button japan">
              <img src="/flag2.webp" alt="Language 2 Flag" />
            </Link>
          </div>
        </section>

        <section className="suggestions-section">
          <h2>Sugestões</h2>
          <div className="suggestion-buttons">
            <Link to="/Portuguese" className="language-button portuguese">
              <img src="/flag3.webp" alt="Suggestion 1 Flag"/>
              </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MenuScreen;