import { useMediaQuery, Box, Drawer, CircularProgress } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import SidebarItems from './SidebarItems';
import { Sidebar, Logo } from 'react-mui-sidebar';
import logo from '../../../assets/images/logos/logo-3.svg';
import getMenuItems from './MenuItems';
import ApiService from '../../../service/ApiService';

const SIDEBAR_WIDTH = '270px';

const scrollbarStyles = {
  '&::-webkit-scrollbar': {
    width: '7px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#eff2f7',
    borderRadius: '15px',
  },
  '&:hover::-webkit-scrollbar-thumb': {
    backgroundColor: '#d4d9e2',
  }
};

import PropTypes from 'prop-types';

const DrawerContent = ({ loading, sidebarContent, children }) => {
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}>
        <CircularProgress />
      </Box>
    );
  }
  return children || sidebarContent;
};

DrawerContent.propTypes = {
  loading: PropTypes.bool.isRequired,
  sidebarContent: PropTypes.node,
  children: PropTypes.node
};

const MSidebar = ({
  isSidebarOpen,
  isMobileSidebarOpen,
  onSidebarClose
}) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const [userData, setUserData] = useState({ role: 'user', name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Lấy token hiện tại
        const currentToken = sessionStorage.getItem('authToken');
        // Lấy profile và token đã cache
        const cachedProfile = localStorage.getItem('userProfile');
        let profile = null;
        let cachedToken = null;
        if (cachedProfile) {
          try {
            profile = JSON.parse(cachedProfile);
            cachedToken = profile?.token;
          } catch (e) { /* intentionally empty */ }
        }
        // Nếu có profile cache và token khớp thì dùng cache, ngược lại gọi API và cập nhật cache
        if (cachedProfile && currentToken && cachedToken === currentToken) {
          const role = ['admin', 'leader', 'user'].includes(
            profile?.roleName?.toLowerCase()?.trim()
          ) ? profile.roleName.toLowerCase().trim() : 'user';
          setUserData({
            role,
            name: profile?.fullName || '',
            email: profile?.email || ''
          });
        } else {
          const response = await ApiService.getUserProfile();
          // Lưu token vào profile cache để kiểm tra lần sau
          localStorage.setItem('userProfile', JSON.stringify({ ...response, token: currentToken }));
          const role = ['admin', 'leader', 'user'].includes(
            response?.roleName?.toLowerCase()?.trim()
          ) ? response.roleName.toLowerCase().trim() : 'user';
          setUserData({
            role,
            name: response?.fullName || '',
            email: response?.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(prev => ({ ...prev, role: 'user' }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const menuItems = useMemo(() => getMenuItems(userData.role), [userData.role]);

  const sidebarContent = (
    <Sidebar
      width={SIDEBAR_WIDTH}
      collapsewidth="80px"
      open={isSidebarOpen}
      themeColor="#5d87ff"
      themeSecondaryColor="#49beff"
      showProfile={false}
    >
      <Logo img={logo} />
      <Box sx={{ overflowY: 'auto', ...scrollbarStyles }}>
        <SidebarItems items={menuItems} />
      </Box>
    </Sidebar>
  );

  if (lgUp) {
    return (
      <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              ...scrollbarStyles,
            },
          }}
        >
          <DrawerContent loading={loading} sidebarContent={sidebarContent} />
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: SIDEBAR_WIDTH,
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      <DrawerContent loading={loading} sidebarContent={sidebarContent} />
    </Drawer>
  );
};

MSidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  isMobileSidebarOpen: PropTypes.bool.isRequired,
  onSidebarClose: PropTypes.func.isRequired
};

export default MSidebar;
