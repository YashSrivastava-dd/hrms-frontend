import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 pt-6 bg-gray-50">
      <div className="flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            © 2025 All Rights Reserved
          </p>
          <p className="text-xs text-gray-500">
            Designed and Developed by{" "}
            <span className="font-semibold text-gray-700">D&D Healthcare</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
