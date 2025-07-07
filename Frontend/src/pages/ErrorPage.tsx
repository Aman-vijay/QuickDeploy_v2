import { useState, useEffect } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../components/Buttons';

export const ErrorPage = () => {
  const error = useRouteError();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  let errorMessage = 'Sorry, an unexpected error has occurred.';
  let errorStatus: number | string = 'Error';

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || errorMessage;
    if (error.status === 404) {
      errorMessage = 'Oops! The page you’re looking for doesn’t exist.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div
        className={`text-center max-w-2xl mx-auto transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {errorStatus}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {errorMessage}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            size="md"
            className="flex items-center gap-2"
            
          >
            <ArrowLeft size={20} /> Go Back
          </Button>
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium text-lg transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            Go Home <ArrowRight size={20} />
          </Link>
        </div>
      </div>
      <div className="mt-12 text-gray-500 dark:text-gray-400 text-sm">
        <p>Powered by QuickDeploy</p>
      </div>
    </div>
  );
};