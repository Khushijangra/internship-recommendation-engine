import React, { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Inject custom styles for Google Translate
    const style = document.createElement('style');
    style.textContent = `
      .google-translate-custom .goog-te-combo {
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        padding: 4px 8px !important;
        font-size: 12px !important;
        color: #374151 !important;
        min-width: 80px !important;
      }
      .google-translate-custom .goog-te-combo:focus {
        outline: none !important;
        border-color: #2563eb !important;
        box-shadow: 0 0 0 1px #2563eb !important;
      }
      .goog-te-banner-frame { display: none !important; }
      .goog-te-menu-value { color: #374151 !important; }
    `;
    document.head.appendChild(style);

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,te,ml,kn,gu,pa,or,bn,as,ne,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
          },
          'google_translate_element'
        );
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.79-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 12.236 11.618 14z" clipRule="evenodd" />
          </svg>
          Language:
        </div>
        <div id="google_translate_element" className="google-translate-custom"></div>
      </div>
    </div>
  );
}

// Google Translate is now the primary and only translation option
