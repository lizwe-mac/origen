import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { ReceiptList } from './components/ReceiptList';
import { ManualReceiptForm } from './components/ManualReceiptForm';
import { ReceiptDetail } from './components/ReceiptDetail';
import { Receipt } from '@origen/models';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'manual' | 'upload' | 'detail'>('list');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (token: string) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  const handleAddManual = () => {
    setCurrentView('manual');
  };

  const handleUpload = () => {
    setCurrentView('upload');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedReceipt(null);
  };

  const handleSelectReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    // TODO: Implement receipt detail view
    console.log('Selected receipt:', receipt);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setCurrentView('detail');
  };

  if (!isAuthenticated) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Origen</h1>
              <span className="ml-2 text-sm text-gray-500">Receipt Manager</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <ReceiptList
            onAddManual={handleAddManual}
            onUpload={handleUpload}
            onSelectReceipt={handleSelectReceipt}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {currentView === 'manual' && (
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Receipts
              </button>
            </div>
            <ManualReceiptForm
              onSuccess={handleBackToList}
              onCancel={handleBackToList}
            />
          </div>
        )}

        {currentView === 'upload' && (
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to Receipts
              </button>
            </div>
            <div className="text-center py-12">
              <h2 className="text-lg font-medium mb-4">Upload Receipt</h2>
              <p className="text-gray-500">
                File upload functionality will be implemented here.
              </p>
            </div>
          </div>
        )}

        {currentView === 'detail' && selectedReceipt && (
          <ReceiptDetail
            receipt={selectedReceipt}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  );
}

export default App;
