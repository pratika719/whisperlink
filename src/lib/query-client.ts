import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 60,000 ms
        gcTime: 5 * 60 * 1000, // 300,000 ms (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

//queryclient s for cache storage not every click calls api it derives from cache
//useQuery for server side rendering

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: create a singleton client if not already initialized
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
