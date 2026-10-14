'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const ANIMATION_DURATION_MS = 1_850;
const EXIT_DURATION_MS = 450;

export default function FirstLaunchSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animationDuration = prefersReducedMotion ? 250 : ANIMATION_DURATION_MS;
    const exitDuration = prefersReducedMotion ? 250 : EXIT_DURATION_MS;

    const exitTimer = window.setTimeout(() => setIsExiting(true), animationDuration);
    const hideTimer = window.setTimeout(
      () => setIsVisible(false),
      animationDuration + exitDuration
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`first-launch-splash${isExiting ? ' first-launch-splash--exiting' : ''}`}
      role="status"
      aria-label="Loading TEESINDIA"
    >
      <div className="first-launch-splash__content">
        <div className="first-launch-splash__logo-wrap">
          <span className="first-launch-splash__halo" aria-hidden="true" />
          <Image
            className="first-launch-splash__logo"
            src="/logo.svg"
            alt="TEESINDIA"
            width={300}
            height={80}
            priority
          />
        </div>
        <p className="first-launch-splash__tagline">Premium apparel, made in India</p>
      </div>
    </div>
  );
}
