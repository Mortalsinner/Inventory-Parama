import { useState } from "react";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar - Fixed on Desktop, Toggle on Mobile */}
      <div
        className={`bg-gray-900 text-white w-64 p-5 h-full fixed top-0 left-0 transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-64" 
        } transition-transform duration-300 ease-in-out lg:relative lg:flex-shrink-0`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 text-gray-300 hover:text-white lg:hidden"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6">Sidebar</h2>
        <nav>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded cursor-pointer">
              🏠 Home
            </li>
            <li className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded cursor-pointer">
              👤 Profile
            </li>
            <li className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded cursor-pointer">
              ⚙️ Settings
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Toggle Button - Only Visible on Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="m-4 p-2 bg-ghost text-ghost rounded-md focus:outline-none z-20 lg:hidden"
      >
        ☰
      </button>
    </div>
  );
}
