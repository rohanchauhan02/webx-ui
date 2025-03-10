
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { ThemeProvider } from '../components/ThemeProvider'
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "../lib/queryClient"

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
