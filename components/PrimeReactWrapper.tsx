"use client";

import { PrimeReactProvider } from "primereact/api";

export default function PrimeReactWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      {children}
    </PrimeReactProvider>
  );
}
