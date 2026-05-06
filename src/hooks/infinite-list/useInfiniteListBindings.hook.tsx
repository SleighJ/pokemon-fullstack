import { useInfiniteScrollRef } from './useInfiniteScrollRef.hook';

type InfiniteScrollQuerySlice = {
  fetchNextPage: () => void;
  isPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
};

type ScrollOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInfiniteListBindings(
  q: InfiniteScrollQuerySlice,
  options?: ScrollOptions,
) {
  const lastRowRef = useInfiniteScrollRef(
    q.fetchNextPage,
    q.isPending,
    q.isFetchingNextPage,
    q.hasNextPage,
    options,
  );

  return { lastRowRef };
}