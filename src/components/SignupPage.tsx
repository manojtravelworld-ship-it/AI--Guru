import React, { useState } from 'react';

export const SignupPage: React.FC<{onSignup: () => void, onBack: () => void}> = ({ onSignup, onBack }) => {
  return (
    <div className="w-full h-full bg-slate-950 p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto py-8 flex flex-col md:flex-row md:items-center min-h-full">
        <div className="w-full md:w-1/2 p-8 space-y-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
          <h1 className="text-2xl font-black text-white text-center">Student Signup</h1>
          <p className="text-slate-400 text-center mb-6">Join AI-Guru to start learning!</p>
          
          <input type="text" placeholder="Full Name of Student" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="tel" placeholder="Phone Number" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="email" placeholder="Email Address" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="password" placeholder="Enter Password" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="password" placeholder="Confirm Password" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          
          <div className="grid grid-cols-2 gap-4">
              <select className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700">
                  <option>Medium of AI Class</option>
                  <option>English</option>
                  <option>Malayalam</option>
              </select>
              <select className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700">
                  <option>Syllabus</option>
                  <option>CBSE</option>
                  <option>Kerala State</option>
              </select>
          </div>
          
          <select className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700">
              <option>Standard (V-XII)</option>
              {[5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>Standard {n}</option>)}
          </select>
          
          <input type="text" placeholder="Country" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="text" placeholder="State" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="text" placeholder="District" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="text" placeholder="Place" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          <input type="text" placeholder="Name of the School" className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-700" />
          
          <button 
            onClick={onSignup}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition-colors mt-6"
          >
            Complete Signup
          </button>

          <div className="flex justify-between items-center text-sm pt-2">
              <button className="text-slate-400 hover:text-white transition-colors">Forgot Password?</button>
              <button 
                  onClick={onBack}
                  className="text-emerald-500 hover:text-white font-bold transition-colors"
              >
                  Already have an account? Login
              </button>
          </div>
        </div>
        
        <div className="hidden md:block md:w-1/2 p-12 text-center">
            <div className="text-gray-300 font-black mb-6">
                <p className="text-4xl">Welcome</p>
                <p className="text-2xl my-2">to</p>
                <p className="text-6xl text-gray-200">AI-Guru</p>
            </div>
            <p className="text-2xl text-emerald-400 font-semibold">Your Premier AI Teaching Platform</p>
        </div>
      </div>
    </div>
);
};
