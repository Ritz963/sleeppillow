import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PrototypeApp } from "@/components/prototype/PrototypeApp";
import { Wordmark } from "@/components/site/Wordmark";

export const metadata: Metadata = {
  title: "Try the app",
  description: "An interactive prototype of the SleepPillow bedtime app. Hardware controls are simulated.",
};

export default function AppPrototypePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(ellipse_at_50%_35%,#dcd6fb_0%,#f3f1fd_45%,#f8f7fe_75%)]">
      <header className="mx-auto flex h-14 w-full max-w-6xl shrink-0 items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg text-sm font-semibold text-ink hover:text-iris" aria-label="Back to SleepPillow home">
          <ArrowLeft className="size-4" aria-hidden />
          <Wordmark className="text-xl sm:text-2xl" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-semibold">
          <Link href="/#waitlist" className="hidden rounded-full px-3 py-2 text-ink hover:text-iris sm:block">
            Join the waitlist
          </Link>
          <Link href="/reserve" className="rounded-full bg-iris px-4 py-2 text-white hover:bg-iris-600">
            Reserve
          </Link>
        </nav>
      </header>

      <main id="main" className="flex flex-1 flex-col items-center px-2 pb-3 sm:pb-6">
        <div className="mb-2 px-2 text-center sm:mb-4">
          <h1 className="font-display text-lg font-bold text-ink sm:text-2xl">Try the SleepPillow app</h1>
          <p className="hidden text-sm text-ink-soft sm:block">Tap around inside the phone. Pillow hardware is simulated.</p>
        </div>
        <PrototypeApp />
      </main>
    </div>
  );
}
