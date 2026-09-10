import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="nb-page flex flex-col items-center justify-center h-screen p-4 text-center">
      <p className="nb-data text-sm text-soft">missing page · no entry filed</p>
      <h1 className="nb-data font-bold text-7xl mt-2">404</h1>
      <h2 className="font-display font-extrabold text-2xl mt-2">Page not on file</h2>
      <p className="text-sm text-soft mt-1 mb-5">The page you are looking for was never recorded.</p>
      <Link to="/" className="nb-btn">
        Back to the bench
      </Link>
    </div>
  );
}

export default NotFoundPage;
