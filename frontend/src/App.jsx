import { CssBaseline } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Router from './routes/Router';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { UserProvider } from './contexts/UserContext';
import { MessageBadgeProvider } from './contexts/MessageBadgeContext';
import ApiService from './service/ApiService';
import GlobalMessageListener from './contexts/GlobalMessageListener';

function App() {
  const routing = useRoutes(Router);
  const [initialUserData, setInitialUserData] = useState(null);

  useEffect(() => {
    const preloadUserData = async () => {
      try {
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          setInitialUserData(JSON.parse(cachedProfile));
        } else {
          const response = await ApiService.getUserProfile();
          localStorage.setItem('userProfile', JSON.stringify(response));
          setInitialUserData(response);
        }
      } catch (error) {
        console.error('Error preloading user data:', error);
      }
    };
    preloadUserData();
  }, []);

  return (
    <UserProvider value={{ user: initialUserData || { isAuthenticated: false } }}>
      <CustomThemeProvider>
        <SignalRProvider>
          <NotificationProvider>
            <MessageBadgeProvider>
              <CssBaseline />
              <GlobalMessageListener />
              {routing}
            </MessageBadgeProvider>
          </NotificationProvider>
        </SignalRProvider>
      </CustomThemeProvider>
    </UserProvider>
  );
}

export default App;