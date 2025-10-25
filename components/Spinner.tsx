
import React from 'react';

const Spinner: React.FC<{ size?: number }> = ({ size = 8 }) => {
  return (
    <div className={`w-${size} h-${size} border-4 border-gray-400 border-t-primary-500 border-solid rounded-full animate-spin`}></div>
  );
};

export default Spinner;
