import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EngaAreaPage() {
  const navigate = useNavigate();

  // Redirect to the new comprehensive localities page
  React.useEffect(() => {
    navigate('/localities');
  }, [navigate]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the locality ratings page</p>
      </div>
    </div>
  );
}