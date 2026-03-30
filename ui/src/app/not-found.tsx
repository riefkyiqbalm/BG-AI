import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-3 text-slate-300">Halaman tidak ditemukan.</p>
        <p className="mt-2">Silakan kembali ke dashboard atau chat.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/chat" className="px-4 py-2 bg-teal-500 rounded hover:bg-teal-400">
            Chat
          </Link>
          <Link href="/dashboard" className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
