"use client"; 

import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';

const themes = {
  light: {
    background: "bg-white",
    text: "text-gray-800",
    button: "bg-blue-600 text-white",
  },
  dark: {
    background: "bg-gray-900",
    text: "text-gray-200",
    button: "bg-gray-700 text-white",
  },
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  return (
    <div className={`${theme.background} min-h-screen flex flex-col`}>
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <button
          onClick={() => setTheme(theme === themes.light ? themes.dark : themes.light)}
          className={`py-2 px-4 rounded ${theme.button} text-lg`}
        >
          Toggle Theme
        </button>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
