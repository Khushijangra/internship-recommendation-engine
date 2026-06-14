import React from 'react';

export function GovernmentFooter() {
  const logos = [
    { name: 'Government of India', src: 'https://via.placeholder.com/60x40/4F46E5/FFFFFF?text=GOI' },
    { name: 'Digital India', src: 'https://via.placeholder.com/80x40/7C3AED/FFFFFF?text=DI' },
    { name: 'NIC', src: 'https://via.placeholder.com/60x40/2563EB/FFFFFF?text=NIC' },
    { name: 'MyGov', src: 'https://via.placeholder.com/80x40/059669/FFFFFF?text=MyGov' },
    { name: 'UIDAI', src: 'https://via.placeholder.com/60x40/DC2626/FFFFFF?text=UIDAI' },
    { name: 'UPI', src: 'https://via.placeholder.com/60x40/64748B/FFFFFF?text=UPI' },
    { name: 'MyGov', src: 'https://via.placeholder.com/80x40/0EA5E9/FFFFFF?text=MyGov' }
  ];

  return (
    <div className="bg-white border-t border-border py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center">
              <img 
                src={logo.src} 
                alt={logo.name}
                className="h-10 object-contain filter grayscale hover:grayscale-0 transition-all duration-200 opacity-70 hover:opacity-100"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex">
              <div className="w-4 h-3 bg-chart-1"></div>
              <div className="w-4 h-3 bg-white border-t border-b border-gray-300"></div>
              <div className="w-4 h-3 bg-chart-3"></div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Government of India</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-IN')} | Content owned by respective departments
          </p>
        </div>
      </div>
    </div>
  );
}