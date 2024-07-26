import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

interface ThemeToggleIconProps {
  isDarkMode: boolean;
  onClick: () => void;
}

const ThemeToggleIcon: React.FC<ThemeToggleIconProps> = ({
  isDarkMode,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 p-2 rounded-full focus:outline-none"
      aria-label="Toggle Theme"
    >
      {isDarkMode ? (
        <FaMoon className="text-gray-800 dark:text-gray-400" />
      ) : (
        <FaSun className="text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
};

export default ThemeToggleIcon;
