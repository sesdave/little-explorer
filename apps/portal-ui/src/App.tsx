import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. Import
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // 2. Import DevTools
import { router } from './routes';
import { Snackbar } from './components/ui/Snackbar';

// 3. Initialize the QueryClient
// We do this outside the component so it doesn't get re-created on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Staff Tip: Prevents excessive API calls during development
      staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
      retry: 1, // Only retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch every time you switch browser tabs
    },
  },
});

function App() {
  return (
    // 4. Wrap everything in the Provider
    <QueryClientProvider client={queryClient}>
      <Snackbar />
      <RouterProvider router={router} />
      
      {/* 5. Add DevTools (only visible in development) */}
      {/* This adds a floating icon to help you inspect your cache */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;