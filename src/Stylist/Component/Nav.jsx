import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <div className={`bg-[#11365b] text-white w-64 flex flex-col justify-between p-5 h-full fixed top-0 left-0 transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform duration-300 ease-in-out lg:relative lg:flex-shrink-0`}>
        
        {/* Header */}
        <div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-5 right-5 text-gray-300 hover:text-white lg:hidden"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="text-accent">
              <img src="/LogParama.jpg" alt="Parama Logo" className="w-14 h-14 rounded-lg"/>
            </span> Inventory
          </h2>

          {/* Navigation Menu */}
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="flex items-center gap-3 p-3 hover:bg-[#1a4b85] rounded-lg transition-all duration-200 group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-medium">List Barang</span>
                </Link>
              </li>
              <li>
                <Link to="/distribusi" className="flex items-center gap-3 p-3 hover:bg-[#1a4b85] rounded-lg transition-all duration-200 group">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="font-medium">Distribusi</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Copyright Footer */}
        <div className="mt-auto pt-4 border-t border-[#1a4b85]">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Parama
            <br />
            <span className="text-xs">All rights reserved</span>
          </p>
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 p-2 bg-[#11365b] text-white rounded-lg hover:bg-[#1a4b85] focus:outline-none z-20 lg:hidden transition-all duration-200"
      >
        ☰
      </button>
    </div>
  );
}
