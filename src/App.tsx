import { useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/settingsStore';
import { PageTransition } from '@/components/molecules';
import { ImmersiveBackground } from '@/components/3d/ImmersiveBackground';
import LoadingScreen from '@/components/atoms/LoadingScreen';
import ErrorBoundary from '@/components/atoms/ErrorBoundary';
import { initializePlugins } from '@/shared/plugins';

initializePlugins();

const Home = lazy(() => import('@/pages/Home'));
const Categories = lazy(() => import('@/pages/Categories'));
const AssessmentList = lazy(() => import('@/pages/AssessmentList'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const Results = lazy(() => import('@/pages/Results'));
const Profile = lazy(() => import('@/pages/Profile'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Preparing = lazy(() => import('@/pages/Preparing'));
const Empty = lazy(() => import('@/pages/Empty'));
const ErrorPage = lazy(() => import('@/pages/ErrorPage'));
const Unavailable = lazy(() => import('@/pages/Unavailable'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  const location = useLocation();
  const { animationLevel, theme, fontSize } = useSettingsStore();
  const isHomePage = location.hash === '' || location.hash === '#/';

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    root.style.fontSize = `${fontSize}px`;
  }, [theme, fontSize]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {animationLevel !== 'none' && isHomePage && <ImmersiveBackground />}
      <AnimatePresence mode="wait">
        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <Home />
                  </PageTransition>
                }
              />
              <Route
                path="/categories"
                element={
                  <PageTransition>
                    <Categories />
                  </PageTransition>
                }
              />
              <Route
                path="/assessments/:category"
                element={
                  <PageTransition>
                    <AssessmentList />
                  </PageTransition>
                }
              />
              <Route
                path="/quiz/:assessmentId"
                element={
                  <PageTransition>
                    <Quiz />
                  </PageTransition>
                }
              />
              <Route
                path="/results/:assessmentId"
                element={
                  <PageTransition>
                    <Results />
                  </PageTransition>
                }
              />
              <Route
                path="/profile"
                element={
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <PageTransition>
                    <Maintenance />
                  </PageTransition>
                }
              />
              <Route
                path="/preparing"
                element={
                  <PageTransition>
                    <Preparing />
                  </PageTransition>
                }
              />
              <Route
                path="/empty"
                element={
                  <PageTransition>
                    <Empty />
                  </PageTransition>
                }
              />
              <Route
                path="/error"
                element={
                  <PageTransition>
                    <ErrorPage />
                  </PageTransition>
                }
              />
              <Route
                path="/unavailable"
                element={
                  <PageTransition>
                    <Unavailable />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFound />
                  </PageTransition>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AnimatePresence>
    </div>
  );
}

export default App;