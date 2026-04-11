"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-2xl rounded-[32px] border border-white/10 bg-[#0f2035] p-10 shadow-[0_20px_80px_rgba(0,212,200,0.15)]">
        <div className="mb-6 inline-flex rounded-full bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">
          Error terjadi
        </div>
        <h1 className="mb-4 text-4xl font-semibold text-white sm:text-5xl">
          Maaf, halaman ini gagal dimuat
        </h1>
        <p className="mb-8 text-base leading-7 text-slate-300">
          Terjadi kesalahan saat memuat konten. Silakan muat ulang atau kembali ke beranda.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
          >
            Muat ulang
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-teal-300 hover:text-teal-300"
          >
            Kembali ke Beranda
          </a>
        </div>
        <pre className="mt-8 overflow-x-auto rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
          {error.message}
        </pre>
      </div>
    </div>
  );
}
