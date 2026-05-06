import { useCallback, useEffect, useRef } from 'react';

type Options = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInfiniteScrollRef(
  fetchNextPage: () => void,
  isLoading: boolean,
  isFetching: boolean,
  hasNextPage: boolean | undefined,
  {
    root = null,
    rootMargin = '240px',
    threshold = 0,
  }: Options = {},
) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchNextRef = useRef(fetchNextPage);
  const gateRef = useRef({ isFetching, hasNextPage, isLoading });

  useEffect(() => {
    fetchNextRef.current = fetchNextPage;
  }, [fetchNextPage]);

  useEffect(() => {
    gateRef.current = { isFetching, hasNextPage, isLoading };
  }, [isFetching, hasNextPage, isLoading]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  return useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || isLoading) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          const { isFetching: fetching, hasNextPage: more } = gateRef.current;
          if (!more || fetching) return;
          fetchNextRef.current();
        },
        { root, rootMargin, threshold },
      );

      obs.observe(node);
      observerRef.current = obs;
    },
    [isLoading, root, rootMargin, threshold],
  );
}