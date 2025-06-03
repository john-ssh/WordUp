import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { db, auth, googleProvider } from '../database/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './css/LoginScreen.css';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const saveUserData = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    name: user.displayName || 'Anonymous',
    createdAt: new Date()
  }, { merge: true }); // merge to avoid overwriting
};

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // alert('Login Com Sucesso!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // alert('Conta Criada!');
      }
      await saveUserData();
      navigate('/menu');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Logado Com Google!');
      await saveUserData();
      navigate('/menu');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Login' : 'Cadastro'}</h2>
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleAuth}>
          {isLogin ? 'Login' : 'Criar Conta'}
        </button>
        <button className="google-button" onClick={handleGoogleLogin}>
          Login with Google
        </button>

        <p>
          {isLogin ? "Não tem uma conta?" : 'Já tem uma conta?'}{' '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: '#4a90e2', cursor: 'pointer' }}
          >
            {isLogin ? 'Cadastrar' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
