// src/layouts/header/Profile.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from 'src/contexts/UserContext';
import {
  Avatar,
  Box,
  Menu,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { IconListCheck, IconUser, IconKey } from '@tabler/icons-react';
import ProfileImg from 'src/assets/images/profile/user-1.jpg';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleClick2 = (event) => setAnchorEl2(event.currentTarget);
  const handleClose2 = () => setAnchorEl2(null);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/auth/login');
      window.location.reload();
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
    }
  };

  const getAvatarSrc = () => {
    if (user.avatar && typeof user.avatar === 'string') {
      const trimmed = user.avatar.trim();
      return trimmed.startsWith('http')
        ? trimmed
        : `/Uploads/avatars/${trimmed}`;
    }
    return ProfileImg;
  };

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(Boolean(anchorEl2) && {
            color: 'primary.main',
          }),
        }}
      >
        <Avatar src={getAvatarSrc()} sx={{ width: 35, height: 35 }} />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{ '& .MuiMenu-paper': { width: '200px' } }}
      >
        {user.isAuthenticated ? [
          <MenuItem key="role" disabled>
            <ListItemText>
              <Typography
                variant="h6"
                fontWeight="bold"
                align="center"
                color="red"
              >
                {user.fullName || 'Người dùng'}
              </Typography>
            </ListItemText>
          </MenuItem>,
          <MenuItem key="profile" component={Link} to="/profile" onClick={handleClose2}>
            <ListItemIcon><IconUser width={20} /></ListItemIcon>
            <ListItemText>Tài khoản</ListItemText>
          </MenuItem>,
          <MenuItem key="change-password" component={Link} to="/auth/changepassword" onClick={handleClose2}>
            <ListItemIcon><IconKey width={20} /></ListItemIcon>
            <ListItemText>Đổi mật khẩu</ListItemText>
          </MenuItem>,
          <MenuItem key="tasks" component={Link} to="/manage/task" onClick={handleClose2}>
            <ListItemIcon><IconListCheck width={20} /></ListItemIcon>
            <ListItemText>Nhiệm vụ</ListItemText>
          </MenuItem>,
          <MenuItem
            key="logout"
            onClick={handleLogout}
            sx={{
              textAlign: 'center',
              color: 'white',
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
              borderRadius: '4px',
              margin: '8px',
            }}
          >
            <ListItemText>Đăng xuất</ListItemText>
          </MenuItem>
        ] : (
          <MenuItem component={Link} to="/auth/login" onClick={handleClose2} >
            <ListItemText>Đăng nhập</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Profile;