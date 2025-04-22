import '@/styles/globals.css';
import '@/styles/animations.css';
import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Hydrate } from 'react-query/hydration';
import { Provider } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { ModalProvider } from '@/components/modal-views/context';
import ModalsContainer from '@/components/modal-views/container';
import DrawersContainer from '@/components/drawer-views/container';
import SettingsButton from '@/components/settings/settings-button';
import SettingsDrawer from '@/components/settings/settings-drawer';
import { WalletProvider } from '@/lib/hooks/use-connect';
import { CheckMark } from '@/components/icons/checkmark';
import { LongArrowUp } from '@/components/icons/long-arrow-up';
import { SearchIcon } from '@/components/icons/search';
import { PlusIcon } from '@/components/icons/plus';
import { Header } from '@/layouts/header';
import Layout from '@/layouts/_layout';

function CustomApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  const { pathname } = router;

  // fix for animation
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.2); opacity: 0.5; }
        100% { transform: scale(1); opacity: 0.7; }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Provider store={store}>
          <ThemeProvider
            attribute="class"
            enableSystem={false}
            defaultTheme="light"
          >
            <WalletProvider>
              <ModalProvider>
                <AnimatePresence
                  exitBeforeEnter
                  initial={false}
                  onExitComplete={() => window.scrollTo(0, 0)}
                >
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </AnimatePresence>
                <ModalsContainer />
                <DrawersContainer />
                <SettingsButton />
                <SettingsDrawer />
                <Toaster position="top-center" />
              </ModalProvider>
            </WalletProvider>
          </ThemeProvider>
        </Provider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default CustomApp; 