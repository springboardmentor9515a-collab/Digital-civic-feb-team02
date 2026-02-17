"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time and wait for page to be ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="preloader-wrapper">
      <div className="preloader-content">
        {/* Animated Logo */}
        <div className="preloader-logo">
          <div className="logo-outer-ring"></div>
          <div className="logo-inner-ring"></div>
          <div className="logo-center">
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Modern building/civic icon */}
              <rect x="15" y="12" width="6" height="26" fill="#4f46e5" className="building-part" />
              <rect x="23" y="8" width="6" height="30" fill="#4f46e5" className="building-part" />
              <rect x="31" y="15" width="6" height="23" fill="#4f46e5" className="building-part" />
              
              {/* Windows */}
              <rect x="17" y="15" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="17" y="20" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="17" y="25" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="17" y="30" width="2" height="2" fill="white" opacity="0.9" />
              
              <rect x="25" y="12" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="25" y="17" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="25" y="22" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="25" y="27" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="25" y="32" width="2" height="2" fill="white" opacity="0.9" />
              
              <rect x="33" y="18" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="33" y="23" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="33" y="28" width="2" height="2" fill="white" opacity="0.9" />
              <rect x="33" y="33" width="2" height="2" fill="white" opacity="0.9" />
              
              {/* Base */}
              <rect x="12" y="38" width="28" height="2" fill="#4f46e5" />
            </svg>
          </div>
        </div>

        {/* Professional Loading Text */}
        <div className="preloader-text">
          <h2 className="loading-title">CIVIX</h2>
          <p className="loading-subtitle">Digital Civic Platform</p>
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
