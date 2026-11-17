import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-lav-200 bg-white/60 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-2 max-w-sm text-sm text-ink-soft">A student product concept in development. Not available for purchase.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <li><Link className="rounded hover:text-iris" href="/#how-it-works">How it works</Link></li>
            <li><Link className="rounded hover:text-iris" href="/#our-story">Our story</Link></li>
            <li><Link className="rounded hover:text-iris" href="/app">Try the app</Link></li>
            <li><Link className="rounded hover:text-iris" href="/reserve">Reserve</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
