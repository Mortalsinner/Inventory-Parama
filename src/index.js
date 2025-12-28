import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './HomeStylist';
import reportWebVitals from './reportWebVitals';
import HomeManager from './HomeManager';
import Login from './Login/Login';
import Distribusi from './Stylist/Distribusi';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './Route/PrivateRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Route Nav masukin sini juga */}
        <Route path="/" element={<Login />} />
        <Route
          path="/home/*"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/distribusi/*"
          element={
            <PrivateRoute>
              <Distribusi />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/*"
          element={
            <PrivateRoute>
              <HomeManager />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
