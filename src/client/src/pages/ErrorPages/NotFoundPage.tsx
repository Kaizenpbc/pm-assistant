import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full text-center">
        <div className="text-8xl font-bold text-white/90 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-4">Page not found</h1>
        <p className="text-white/80 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-white text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Go to Home
          </Link>
          <Link
            to="/dashboard"
            className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
