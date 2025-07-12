import { QueryClient, QueryFunction } from "@tanstack/react-query";

export async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<any> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      console.log('Raw error response:', text);
      if (text) {
        try {
          const json = JSON.parse(text);
          console.log('Parsed JSON:', json);
          errorMessage = json.message || json.error || text;
        } catch (parseError) {
          console.log('JSON parse failed, using text as-is');
          errorMessage = text;
        }
      }
    } catch (readError) {
      console.log('Failed to read response, using status text');
      // errorMessage already set to res.statusText
    }
    console.log('Final error message:', errorMessage);
    throw new Error(errorMessage);
  }

  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const text = await res.text();
        console.log('Query error response:', text);
        if (text) {
          try {
            const json = JSON.parse(text);
            console.log('Query parsed JSON:', json);
            errorMessage = json.message || json.error || text;
          } catch (parseError) {
            console.log('Query JSON parse failed, using text as-is');
            errorMessage = text;
          }
        }
      } catch (readError) {
        console.log('Query failed to read response, using status text');
        // errorMessage already set to res.statusText
      }
      console.log('Query final error message:', errorMessage);
      throw new Error(errorMessage);
    }

    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
