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
    try {
      const text = await res.text();
      console.log('Raw error response:', text);
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
        // Extract clean error message from JSON response
        const errorMessage = json.message || json.error || res.statusText;
        console.log('Final error message:', errorMessage);
        throw new Error(errorMessage);
      } catch (parseError) {
        console.log('JSON parse error, using text:', text);
        // If JSON parsing fails, use the text as is
        throw new Error(text || res.statusText);
      }
    } catch (readError) {
      console.log('Read error, using status text:', res.statusText);
      // If reading response fails, fall back to status text
      throw new Error(res.statusText);
    }
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
      try {
        const text = await res.text();
        console.log('Query error response:', text);
        try {
          const json = JSON.parse(text);
          console.log('Query parsed JSON:', json);
          // Extract clean error message from JSON response
          const errorMessage = json.message || json.error || res.statusText;
          console.log('Query final error message:', errorMessage);
          throw new Error(errorMessage);
        } catch (parseError) {
          console.log('Query JSON parse error, using text:', text);
          // If JSON parsing fails, use the text as is
          throw new Error(text || res.statusText);
        }
      } catch (readError) {
        console.log('Query read error, using status text:', res.statusText);
        // If reading response fails, fall back to status text
        throw new Error(res.statusText);
      }
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
