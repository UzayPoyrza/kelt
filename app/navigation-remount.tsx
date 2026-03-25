"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RemountInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = pathname + searchParams.toString();

  return <div key={key}>{children}</div>;
}

export function NavigationRemount({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RemountInner>{children}</RemountInner>
    </Suspense>
  );
}
