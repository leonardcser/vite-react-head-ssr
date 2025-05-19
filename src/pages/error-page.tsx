import { Link } from "react-router";

export function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold text-red-500">Oops!</h1>
      <p className="mt-4 text-xl">Something went wrong...</p>
      <Link
        to="/"
        className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800"
      >
        Go back to Home
      </Link>
    </div>
  );
}
