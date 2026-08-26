"use client";

import { useEffect, useRef } from "react";

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: { enabled: boolean; loading: boolean; rootMargin?: string },
) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !options.enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          !options.loading
        ) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: options.rootMargin ?? "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.enabled, options.loading, options.rootMargin]);

  return sentinelRef;
}
