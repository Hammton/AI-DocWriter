import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 xs:h-16">
            <div className="flex items-center space-x-2 xs:space-x-3">
              <img 
                src="/dq-logo.png" 
                alt="DQ Logo" 
                className="h-8 xs:h-10 w-auto"
              />
              <div className="min-w-0">
                <h1 className="text-lg xs:text-xl font-bold text-gray-900 truncate">
                  AI DocWriter 4.0
                </h1>
                <p className="text-xs xs:text-sm text-gray-500 hidden xs:block">
                  AI-Powered Document Generator
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};