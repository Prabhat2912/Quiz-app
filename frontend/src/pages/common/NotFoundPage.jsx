import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-black">
      <h1 className="text-5xl font-bold mb-4 text-red-600">404</h1>
      <h2 className="text-2xl mb-2">Page Not Found</h2>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="primary-contained-btn">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
