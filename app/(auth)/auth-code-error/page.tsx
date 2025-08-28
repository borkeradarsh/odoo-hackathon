import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was an error during the authentication process.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-600">This could happen if:</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>The authentication link has expired</li>
            <li>The link has already been used</li>
            <li>There was a network error</li>
          </ul>
          <div className="pt-4">
            <Link
              href="/login"
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
