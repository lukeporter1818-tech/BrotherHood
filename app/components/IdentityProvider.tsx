"use client";

import { createContext, useContext, useState } from "react";

export type Identity = "REAL" | "ANON";

type IdentityContextValue = {
  identity: Identity;
  setIdentity: (next: Identity) => void;
  realName: string | null;
  anonHandle: string;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);

export function IdentityProvider({
  realName,
  anonHandle,
  children,
}: {
  realName: string | null;
  anonHandle: string;
  children: React.ReactNode;
}) {
  const [identity, setIdentity] = useState<Identity>(
    realName ? "REAL" : "ANON",
  );

  return (
    <IdentityContext.Provider
      value={{ identity, setIdentity, realName, anonHandle }}
    >
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used inside IdentityProvider");
  return ctx;
}
