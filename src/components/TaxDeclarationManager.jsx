import React, { useState } from 'react';
import TaxDeclarationsList from './TaxDeclarationsList';
import TaxDeclarationView from './TaxDeclarationView';
import DeclarationForm from './DeclarationForm';
import { safeSetLocalStorage } from '../utils/safariHelpers';

const TaxDeclarationManager = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'view', 'create'
  const [selectedDeclaration, setSelectedDeclaration] = useState(null);

  const handleViewDeclaration = (declaration) => {
    setSelectedDeclaration(declaration);
    setCurrentView('view');
  };

  const handleCreateNew = () => {
    // Update the sidebar selection to show Declaration Form as active
    safeSetLocalStorage("selectedTag", "declarationForm");
    
    // Dispatch a custom event to notify the sidebar about the navigation change
    const navigationEvent = new CustomEvent('navigationChange', {
      detail: { tag: 'declarationForm' }
    });
    window.dispatchEvent(navigationEvent);
    
    setCurrentView('create');
  };

  const handleBackToList = () => {
    // Update the sidebar selection back to Tax Declarations
    safeSetLocalStorage("selectedTag", "taxDeclarations");
    
    // Dispatch a custom event to notify the sidebar about the navigation change
    const navigationEvent = new CustomEvent('navigationChange', {
      detail: { tag: 'taxDeclarations' }
    });
    window.dispatchEvent(navigationEvent);
    
    setCurrentView('list');
    setSelectedDeclaration(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'view':
        return (
          <TaxDeclarationView 
            declaration={selectedDeclaration}
            onBack={handleBackToList}
          />
        );
      case 'create':
        return (
          <div>
            <div className="mb-4">
              <button
                onClick={handleBackToList}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Tax Declarations</span>
              </button>
            </div>
            <DeclarationForm />
          </div>
        );
      case 'list':
      default:
        return (
          <TaxDeclarationsList 
            onViewDeclaration={handleViewDeclaration}
            onCreateNew={handleCreateNew}
          />
        );
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full p-4 md:p-6">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default TaxDeclarationManager;
