import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{
          background:
            "radial-gradient(ellipse at top, #e8f5e9 0%, #f9fdf9 60%, #ffffff 100%)",
        }}
      >
        {/* Icon */}
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-green-400">
          <SearchX className="h-12 w-12 text-green-500" strokeWidth={1.8} />
        </div>

        {/* 404 */}
        <h1
          className="font-extrabold leading-none tracking-tight"
          style={{ fontSize: "clamp(5rem, 20vw, 9rem)", color: "#22c55e" }}
        >
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-4 text-xl font-bold text-gray-900 text-center sm:text-2xl">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </h2>

        {/* Sub-text */}
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500 text-center">
          It looks like you took a wrong turn. Don&apos;t worry, it happens to
          the best of us.
          <br />
          Try searching for what you need or head back to the safety of your{" "}
          <Link
            to="/"
            className="font-medium text-green-500 underline underline-offset-2 hover:text-green-600 transition-colors"
          >
            dashboard
          </Link>
          .
        </p>
      </div>

      <Footer />
    </>
  );
}
