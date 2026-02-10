
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="https://public.readdy.ai/ai/img_res/6f92bf10-52b1-4e29-8d8a-7bc5045bbcdd.png" 
              alt="CDMA Logo" 
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">CDMA Department</h1>
              <p className="text-xs text-gray-500">Personnel Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <i className="ri-calendar-line w-4 h-4 flex items-center justify-center text-teal-600"></i>
              <span>
                {currentTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="mx-2 text-gray-300">|</span>
              <i className="ri-time-line w-4 h-4 flex items-center justify-center text-teal-600"></i>
              <span className="font-mono">
                {currentTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer">
                <i className="ri-notification-3-line w-5 h-5 flex items-center justify-center"></i>
              </button>
              <button className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer">
                <i className="ri-settings-3-line w-5 h-5 flex items-center justify-center"></i>
              </button>
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                A
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
