// src/routes/Router.jsx
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { ProtectedRoute, AdminRoute, LeaderRoute } from '../guard';
import Message from '../views/message/Message';

// Layouts
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Local Pages
const HomePage = Loadable(lazy(() => import('../views/local/Home')));
const About = Loadable(lazy(() => import('../views/local/About')));
const Leave = Loadable(lazy(() => import('../views/local/Leave')));
const NLeave = Loadable(lazy(() => import('../views/local/NLeave')));
const Settings = Loadable(lazy(() => import('../views/local/Settings')));
const Report = Loadable(lazy(() => import('../views/local/Report')));
const FeedBack = Loadable(lazy(() => import('../views/local/FeedBack')));

// Authentication Pages
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const Profile = Loadable(lazy(() => import('../views/authentication/Profile')));
const EditProfile = Loadable(lazy(() => import('../views/authentication/EditProfile')));
const ChangePassword = Loadable(lazy(() => import('../views/authentication/ChangePassword')));

// Employee Management Pages
const Employees = Loadable(lazy(() => import('../views/employee/Employees')));
const EmployeesInfo = Loadable(lazy(() => import('../views/employee/EmployeeInfo')));
const EmployeeEdit = Loadable(lazy(() => import('../views/employee/EmployeeEdit')));
const EmployeeCreate = Loadable(lazy(() => import('../views/employee/EmployeeCreate')));

// Attendance Pages
const CheckWork = Loadable(lazy(() => import('../views/attendance/CheckWork')));
const History = Loadable(lazy(() => import('../views/attendance/HistoryCheckwork')));
const TKCheckWork = Loadable(lazy(() => import('../views/attendance/TKCheckwork')));
const Attendance = Loadable(lazy(() => import('../views/attendance/Attendance')));
const WeekAttendance = Loadable(lazy(() => import('../views/attendance/WeekAttendance')));
const MonthAttendance = Loadable(lazy(() => import('../views/attendance/MonthAttendance')));
const HRLeave = Loadable(lazy(() => import('../views/attendance/HRLeave')));

// Notification Pages
const NotificationDetails = Loadable(lazy(() => import('../views/notification/NotificationDetail')));
const AddNotification = Loadable(lazy(() => import('../views/notification/AddNotification')));
const EditNotification = Loadable(lazy(() => import('../views/notification/components/EditNotification')));

// Task Management Pages
const Tasks = Loadable(lazy(() => import('../views/task/AllTasks')));
const Task = Loadable(lazy(() => import('../views/task/Task')));
const TaskInfo = Loadable(lazy(() => import('../views/task/Info')));
const AddTaskPage = Loadable(lazy(() => import('../views/task/Add')));
const UpdateTaskPage = Loadable(lazy(() => import('../views/task/Update')));

// Group Management Pages
const GroupById = Loadable(lazy(() => import('../views/group/GroupById')));

// Department Management Pages
const Department = Loadable(lazy(() => import('../views/department/Department')));
const DepartmentEdit = Loadable(lazy(() => import('../views/department/components/DUpdate')));
const DepartmentCreate = Loadable(lazy(() => import('../views/department/components/DCreate')));

// Payroll Pages
const Payroll = Loadable(lazy(() => import('../views/payroll/Payroll')));
const AllPayroll = Loadable(lazy(() => import('../views/payroll/AllPayRoll')));
const PayrollDetail = Loadable(lazy(() => import('../views/payroll/PayrollDetail')));
const PayrollList = Loadable(lazy(() => import('../views/payroll/PayrollList')));

// Role Management Pages
const Role = Loadable(lazy(() => import('../views/role/Role')));

// Statistics Pages
const Statistics = Loadable(lazy(() => import('../views/statistics/Statistics')));
const StatisticAttendance = Loadable(lazy(() => import('../views/statistics/StatisticAttendance')));
const StatisticEmployee = Loadable(lazy(() => import('../views/statistics/StatisticEmployee')));
const StatisticPayroll = Loadable(lazy(() => import('../views/statistics/StatisticPayroll')));

const DefaultRedirect = () => {
  const isLoggedIn = !!sessionStorage.getItem('authToken');
  return <Navigate to={isLoggedIn ? "/home" : "/auth/login"} />;
};

const Router = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <ProtectedRoute element={FullLayout} />
      </Suspense>
    ),
    children: [
      { path: '/', element: <DefaultRedirect /> },
      { path: '/home', element: <ProtectedRoute element={HomePage} /> },
      { path: '/about', element: <ProtectedRoute element={About} /> },
      { path: '/checkwork', element: <ProtectedRoute element={CheckWork} /> },
      { path: '/history-checkwork', element: <ProtectedRoute element={History} /> },
      { path: '/tkcheckwork', element: <ProtectedRoute element={TKCheckWork} /> },
      { path: '/nleave', element: <ProtectedRoute element={NLeave} /> },
      { path: '/leave', element: <ProtectedRoute element={Leave} /> },
      { path: '/settings', element: <ProtectedRoute element={Settings} /> },
      { path: '/report', element: <ProtectedRoute element={Report} /> },
      { path: '/feedback', element: <ProtectedRoute element={FeedBack} /> },

      // Attendance Management
      { path: '/manage/attendance', element: <ProtectedRoute element={Attendance} /> },
      { path: '/manage/attendance/week', element: <ProtectedRoute element={WeekAttendance} /> },
      { path: '/manage/attendance/month', element: <ProtectedRoute element={MonthAttendance} /> },
      { path: '/manage/attendance/hrleave', element: <ProtectedRoute element={HRLeave} /> },
      // { path: '/manage/attendance/hrleave', element: <LeaderRoute element={HRLeave} /> },

      // Payroll
      { path: '/manage/payroll', element: <ProtectedRoute element={Payroll} /> },
      { path: '/manage/all-payroll', element: <AdminRoute element={AllPayroll} /> },
      { path: '/manage/payroll/detail/:userId/:month/:year', element: <ProtectedRoute element={PayrollDetail} /> },
      { path: '/manage/payroll/list', element: <ProtectedRoute element={PayrollList} /> },

      // Employee Management
      { path: '/manage/employee/list', element: <AdminRoute element={Employees} /> },
      { path: '/manage/employee/info/:id', element: <ProtectedRoute element={EmployeesInfo} /> },
      { path: '/manage/employee/edit/:id', element: <AdminRoute element={EmployeeEdit} /> },
      { path: '/manage/employee/create', element: <AdminRoute element={EmployeeCreate} /> },

      // Department Management
      { path: '/manage/department', element: <AdminRoute element={Department} /> },
      { path: '/manage/department/edit/:id', element: <AdminRoute element={DepartmentEdit} /> },
      { path: '/manage/department/create', element: <AdminRoute element={DepartmentCreate} /> },

      // Role Management
      { path: '/manage/role', element: <AdminRoute element={Role} /> },

      // Task Management
      { path: '/manage/tasks', element: <ProtectedRoute element={Tasks} /> },
      { path: '/manage/task', element: <ProtectedRoute element={Task} /> },
      { path: '/manage/task/:id', element: <ProtectedRoute element={TaskInfo} /> },
      { path: '/manage/task/add', element: <LeaderRoute element={AddTaskPage} /> },
      // In Router.jsx, the route is defined as:
      { path: '/manage/task/update/:id', element: <LeaderRoute element={UpdateTaskPage} /> },

      // Statistics
      { path: '/manage/statistics', element: <ProtectedRoute element={Statistics} /> },
      { path: '/manage/statistics/attendance', element: <ProtectedRoute element={StatisticAttendance} /> },
      { path: '/manage/statistics/employees', element: <AdminRoute element={StatisticEmployee} /> },
      { path: '/manage/statistics/payroll', element: <AdminRoute element={StatisticPayroll} /> },

      // Group Management
      { path: '/manage/group', element: <ProtectedRoute element={GroupById} /> },


      // Notification
      { path: '/notification/:id', element: <ProtectedRoute element={NotificationDetails} /> },
      { path: '/notification/add', element: <AdminRoute element={AddNotification} /> },
      { path: '/notification/edit', element: <AdminRoute element={EditNotification} /> },

      // Messages
      { path: '/messages/:userId?', element: <ProtectedRoute element={Message} /> },
      { path: '/messages/group/:groupId?', element: <ProtectedRoute element={Message} /> },
      // Profile
      { path: '/profile', element: <ProtectedRoute element={Profile} /> },
      { path: '/edit-profile', element: <ProtectedRoute element={EditProfile} /> },
      { path: '/auth/changepassword', element: <ProtectedRoute element={ChangePassword} /> },

      // Error
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;