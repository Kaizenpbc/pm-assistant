import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full text-center">
        <div className="text-8xl font-bold text-white/90 mb-4">403</div>
        <h1 className="text-2xl font-bold text-white mb-4">Access denied</h1>
        <p className="text-white/80 mb-8">
          You don't have permission to view this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-white text-orange-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
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
