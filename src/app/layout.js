import "./globals.css";
import Link from "next/link";
import Providers from "@/components/Providers";
import AccountStatus from "@/components/AccountStatus";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
    metadataBase: new URL(SITE_URL),
  title: {
    template: "%s · Addis Eats",
    default: "Addis Eats — food delivery in Addis Ababa",
  },
  description:
    "Order Doro Wat, Kitfo, Tibs and Shiro online. Ethiopian food delivered fast across Addis Ababa.",
openGraph: {
    siteName: "Addis Eats",
    locale: "en_ET",
    type: "website",
    title: "Addis Eats — food delivery in Addis Ababa",
    description:
      "Order Doro Wat, Kitfo, Tibs and Shiro online. Ethiopian food delivered fast across Addis Ababa.",
  },
};


const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Cart" },
   { href: "/orders", label: "Orders" },
  { href: "/checkout", label: "Checkout" },
];

export default function RootLayout({ children }) {
  return (
   <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col bg-amber-50 text-stone-800">
        <Providers>
          <header className="sticky top-0 z-10 border-b border-amber-200 bg-white/95 shadow-sm backdrop-blur">
            <nav
              aria-label="Main"
              className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <Link href="/" className="text-xl font-extrabold tracking-tight text-amber-700">
                Addis Eats
              </Link>
              <ul className="flex flex-wrap items-center gap-1 text-sm font-medium">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-stone-700 transition hover:bg-amber-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
               <AccountStatus />
            </nav>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>

          <footer className="border-t border-amber-200 bg-white py-6 text-center text-sm text-stone-500">
            Addis Eats · 2026 All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}