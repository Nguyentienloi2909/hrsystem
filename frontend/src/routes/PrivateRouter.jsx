// src/routes/PrivateRouter.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from 'src/contexts/UserContext'; // Thêm useUser
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
    const { user } = useUser(); // Lấy user từ UserContext
    const location = useLocation();

    if (!user.isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    return children;
};
PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;