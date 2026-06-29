import React, { useState } from 'react';

export const RegistrationForm: React.FC<{onRegister: (grade: string) => void}> = ({ onRegister }) => {
  const [grade, setGrade] = useState('9');
  return (
    <div className="p-6 space-y-6 bg-slate-900 rounded-2xl border border-slate-800">
      <h2 className="text-xl font-black text-white">Student Registration</h2>
      <select 
        value={grade} 
        onChange={(e) => setGrade(e.target.value)}
        className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800"
      >
        {['8', '9', '10', '11', '12'].map(g => <option key={g} value={g}>Class {g}</option>)}
      </select>
      <button 
        onClick={() => onRegister(grade)}
        className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold"
      >
        Register
      </button>
    </div>
  );
};
