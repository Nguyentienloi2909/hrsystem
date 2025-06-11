// src/guard.js
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

export const ProtectedRoute = ({ element: Component }) => {
    const { user } = useUser();
    const location = useLocation();

    if (user === null || user.isAuthenticated === undefined) {
        return <CircularProgress />;
    }

    return user.isAuthenticated ? (
        <Component />
    ) : (
        <Navigate to="/auth/login" replace state={{ from: location }} />
    );
};

ProtectedRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
};

export const AdminRoute = ({ element: Component }) => {
    const { user } = useUser();
    const location = useLocation();

    if (user === null || user.isAuthenticated === undefined) {
        return <CircularProgress />;
    }

    return user.isAuthenticated && user.role === 'ADMIN' ? (
        <Component />
    ) : (
        <Navigate to="/auth/login" replace state={{ from: location }} />
    );
};

AdminRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
};

export const LeaderRoute = ({ element: Component }) => {
    const { user } = useUser();
    const location = useLocation();

    if (user === null || user.isAuthenticated === undefined) {
        return <CircularProgress />;
    }

    return user.isAuthenticated && user.role === 'LEADER' ? (
        <Component />
    ) : (
        <Navigate to="/auth/login" replace state={{ from: location }} />
    );
};

LeaderRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
};

export const UserRoute = ({ element: Component }) => {
    const { user } = useUser();
    const location = useLocation();

    if (user === null || user.isAuthenticated === undefined) {
        return <CircularProgress />;
    }

    return user.isAuthenticated && user.role === 'USER' ? (
        <Component />
    ) : (
        <Navigate to="/auth/login" replace state={{ from: location }} />
    );
};

UserRoute.propTypes = {
    element: PropTypes.elementType.isRequired,
};