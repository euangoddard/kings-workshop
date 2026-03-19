import { useEffect, useRef } from "preact/hooks";
import { useGameStore } from "../store/gameStore";

export function useGameLoop() {
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const loop = (now: number) => {
      if (lastTimeRef.current !== 0) {
        const delta = Math.min(now - lastTimeRef.current, 200);
        useGameStore.getState().tick(delta);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, []);
}
