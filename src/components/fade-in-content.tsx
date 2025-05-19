import { useState, useEffect, ReactNode } from "react";

interface FadeInContentProps {
  children: ReactNode;
  duration?: number; // Optional duration in ms
}

export function FadeInContent({
  children,
  duration = 200,
}: FadeInContentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set visible to true on mount to trigger the fade-in
    // Using a timeout of 0 to ensure the transition applies after the initial render
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-opacity ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
