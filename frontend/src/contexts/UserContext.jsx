// src/contexts/UserContext.jsx
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import ApiService from '../service/ApiService';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedRole = sessionStorage.getItem('role');
        const savedToken = sessionStorage.getItem('authToken');
        const savedFullName = sessionStorage.getItem('fullName');
        return {
            role: savedRole || null,
            isAuthenticated: !!savedToken,
            token: savedToken || null,
            userId: null,
            avatar: null,
            email: null,
            fullName: savedFullName || null,
            phoneNumber: null,
        };
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user.isAuthenticated && !user.userId && user.token) {
                try {
                    const profile = await ApiService.getUserProfile();
                    console.log('User profile:', profile); // Log để kiểm tra

                    // Loại bỏ các trường lương và tin nhắn trước khi lưu vào sessionStorage
                    const {
                        // receivedMessages, // removed because it's unused
                        ...profileToStore
                    } = profile;

                    // Lưu các trường còn lại vào sessionStorage
                    sessionStorage.setItem('userProfile', JSON.stringify(profileToStore));

                    setUser((prev) => ({
                        ...prev,
                        ...profileToStore,
                        userId: profile?.id || prev.userId,
                        avatar: profile?.avatar || prev.avatar,
                        email: profile?.email || prev.email,
                        fullName: profile?.fullName || prev.fullName,
                        phoneNumber: profile?.phoneNumber || prev.phoneNumber,
                        bankName: profile?.bankName || prev.bankName,
                        bankNumber: profile?.bankNumber || prev.bankNumber,
                        monthSalary: profile?.monthSalary || prev.monthSalary,
                        role: prev.role, // Giữ nguyên role từ login
                    }));
                    // Lưu fullName vào localStorage (tùy chọn)
                    if (profile?.fullName) {
                        localStorage.setItem('fullName', profile.fullName);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser((prev) => ({
                        ...prev,
                        userId: null,
                        avatar: null,
                        email: null,
                        fullName: null,
                        phoneNumber: null,
                    }));
                }
            }
        };

        fetchUserProfile();
    }, [user.isAuthenticated, user.token, user.userId]);

    const login = async (username, password) => {
        try {
            // Xóa cache profile trước khi login
            localStorage.removeItem('userProfile');
            sessionStorage.removeItem('groupName');
            const response = await ApiService.loginUser({
                Email: username,
                PasswordHash: password
            });
            console.log('API login response:', response);

            // Nếu tài khoản bị xóa hoặc bị khóa
            if (response.statusCode === 403 && response.message === 'User is inactive') {
                return { error: 'Tài khoản của bạn đã bị khóa hoặc bị xóa. Vui lòng liên hệ quản trị viên.' };
            }

            const { role, token, fullName, groupName } = response;
            if (!token) {
                return { error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.' };
            }

            const newUser = {
                role,
                isAuthenticated: true,
                token,
                userId: null,
                avatar: null,
                email: null,
                fullName: null,
                phoneNumber: null,
                groupName: null,
            };
            setUser(newUser);
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('fullName', fullName);
            if (groupName) sessionStorage.setItem('groupName', groupName);
            console.log('User set after login:', newUser);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' };
        }
    };

    const logout = () => {
        ApiService.logout();
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('fullName');
        sessionStorage.removeItem('groupName');
        // Xóa cache profile khi logout
        localStorage.removeItem('userProfile');
        setUser({
            role: null,
            isAuthenticated: false,
            token: null,
            userId: null,
            avatar: null,
            email: null,
            fullName: null,
            phoneNumber: null,
            groupName: null,
        });
    };

    const value = useMemo(() => ({ user, login, logout, setUser }), [user]);
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};


export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};