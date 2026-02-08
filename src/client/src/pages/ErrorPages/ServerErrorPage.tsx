import { Link } from 'react-router-dom';

export function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-2xl w-full text-center">
        <div className="text-8xl font-bold text-white/90 mb-4">500</div>
        <h1 className="text-2xl font-bold text-white mb-4">Server error</h1>
        <p className="text-white/80 mb-8">
          Something went wrong on our side. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-white text-red-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Refresh page
          </button>
          <Link
            to="/"
            className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
