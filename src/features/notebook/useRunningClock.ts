import { useEffect, useState } from "react";

export const useRunningClock = (enabled: boolean): number => {
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    if (!enabled) return;
    setClock(Date.now());
    const timer = window.setInterval(() => setClock(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return clock;
};
