import React from 'react';

export const LoginPage: React.FC<{onLogin: () => void, onSignup: () => void}> = ({ onLogin, onSignup }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="p-8 space-y-6 bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-sm shadow-2xl">
        <h1 className="text-3xl font-black text-white text-center">OpenVidya</h1>
        <p className="text-slate-400 text-center">Please login or sign up to continue</p>
        <button 
          onClick={onLogin}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition-colors"
        >
          Login with Google
        </button>
        <button 
          onClick={onSignup}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl font-bold transition-colors"
        >
          Don't have an account? Sign Up
        </button>
        <button 
          onClick={onLogin}
          className="w-full text-emerald-500 hover:text-emerald-400 font-bold transition-colors text-sm"
        >
          Enter as Administrator
        </button>
      </div>
    </div>
  );
};
