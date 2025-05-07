import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import reportWebVitals from './reportWebVitals';
import HomeManager from './HomeManager';
import Login from './Login/Login';
import Distribusi from './Stylist/Distribusi';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/distribusi/*" element={<Distribusi />} />
        <Route path="/manager" element={<HomeManager />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
