import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Using Routes instead of Switch
import EnglishPage from './components/EnglishPage';
import JapanesePage from './components/JapanesePage';
import PortuguesePage from './components/PortuguesePage';
import WelcomeScreen from './components/WelcomeScreen';
import MenuScreen from './components/MenuScreen'
import LoginScreen from './components/LoginScreen';

import './App.css'; // Your global app CSS


function App() {
  return (
    <Router>
      <Routes> {/* Use Routes for React Router v6 */}
        <Route path="/english" element={<EnglishPage language="english" />} />
        <Route path="/japanese" element={<JapanesePage language="japanese" />} />
        <Route path="/portuguese" element={<PortuguesePage language="portuguese" />} />
        <Route path="/LoginScreen" element= {<LoginScreen />} />
        <Route path="/menu" element={<MenuScreen />} />
        <Route path="/" element={<WelcomeScreen />} />
        {/* You can add a 404 page here */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '24px' }}>
            <h1>Página não encontrada!</h1>
            <p>Por favor, verifique o URL ou volte para a <a href="/">página inicial</a>.</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;