"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/shared/api/instance.api";

export function UserActivityTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // When pathname changes or component unmounts, log the duration of the PREVIOUS path
    const currentPath = pathname;
    const now = Date.now();
    
    if (lastPathRef.current && lastPathRef.current !== currentPath) {
      const durationSeconds = Math.floor((now - startTimeRef.current) / 1000);
      
      // Fire and forget POST request
      api.post("/activities/track", {
        action: "page_view",
        path: lastPathRef.current,
        duration: durationSeconds,
      }).catch(console.error);
    }

    // Reset tracking for the new path
    startTimeRef.current = now;
    lastPathRef.current = currentPath;

    return () => {
      // Unmount logic (e.g. closing tab might not always catch this reliably, but it's good effort)
      // For reliable exit tracking, navigator.sendBeacon is preferred, but api.post is okay for SPA navigation.
    };
  }, [pathname]);

  // Optionally use beforeunload to track when they close the tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (lastPathRef.current) {
        const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const payload = JSON.stringify({
          action: "page_view",
          path: lastPathRef.current,
          duration: durationSeconds,
        });
        
        // Use sendBeacon for more reliable delivery on page exit
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        // To handle tokens with sendBeacon, it's tricky. Since we're just doing best effort, we can skip auth for beacon or let backend handle anonymous beacons if possible, or omit it.
        // We'll just rely on standard API calls on navigation.
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return null; // Invisible component
}
