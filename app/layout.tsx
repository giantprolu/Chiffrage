import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import PrimeReactWrapper from "@/components/PrimeReactWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chiffrage - Nathan",
  description: "Suivi du chiffrage quotidien",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <PrimeReactWrapper>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </PrimeReactWrapper>
      </body>
    </html>
  );
}
