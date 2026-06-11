import React from 'react';

export const ErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B1FA2]/5 via-white to-[#A3C644]/5 px-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-[120px] sm:text-[160px] font-extrabold leading-none bg-gradient-to-r from-[#7B1FA2] to-[#A3C644] bg-clip-text text-transparent select-none">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
          Página no encontrada
        </h2>
      </div>
    </div>
  );
};

export default ErrorPage;
