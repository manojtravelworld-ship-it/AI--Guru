import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface RegistrationFormProps {
  onLoginSuccess: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    motherTongue: 'Malayalam',
    syllabus: 'CBSE',
    phoneNumber: '',
    otp: '',
    state: '',
    district: '',
    place: '',
    schoolName: '',
    otherDetails: ''
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = () => {
    if (formData.phoneNumber.length >= 10) {
      setOtpSent(true);
      alert('OTP sent to ' + formData.phoneNumber);
    } else {
      alert('Please enter a valid phone number');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Development bypass: allow admin to enter directly
    onLoginSuccess();
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Left side: Form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
          
          {/* Welcome Section */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Nexus AI Guru</h1>
            <p className="text-slate-400 mt-2">Your AI-Powered Learning Assistant</p>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6">Student Registration</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              
              <div>
                <label className="text-slate-300 text-sm mb-1 block">Medium of AI teaching</label>
                <select name="motherTongue" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700">
                  <option value="Malayalam">Malayalam</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm mb-1 block">Syllabus</label>
                <select name="syllabus" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700">
                  <option value="CBSE">CBSE</option>
                  <option value="Kerala State (Malayalam Medium)">Kerala State (Malayalam Medium)</option>
                  <option value="Kerala State (English Medium)">Kerala State (English Medium)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} className="flex-1 p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
                <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send OTP</button>
              </div>

              {otpSent && (
                <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              )}
              
              <input type="text" name="state" placeholder="State" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              <input type="text" name="district" placeholder="District" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              <input type="text" name="place" placeholder="Place" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              <input type="text" name="schoolName" placeholder="School Name" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700" />
              <textarea name="otherDetails" placeholder="Other Details" onChange={handleChange} className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"></textarea>
              
              <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2">
                Register & Start <ArrowRight size={20} strokeWidth={3} />
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">Forgot Password?</a>
          </div>
        </div>
      </div>
      
      {/* Right side: Info */}
      <div className="w-1/2 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-12 text-center">
        <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white">Welcome to Nexus AI Guru</h2>
            <p className="text-xl text-slate-300">Empowering students with AI-driven personalized learning.</p>
        </div>
      </div>
    </div>
  );
};
