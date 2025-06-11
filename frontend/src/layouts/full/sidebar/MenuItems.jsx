import {
    IconLayoutDashboard, IconReport, IconBuilding, IconTournament, IconLicense, IconReportAnalytics,
    IconCheckbox, IconInfoCircle, IconMessage, IconDeviceImacDollar, IconUsersGroup,
    IconWallet, IconCalendarTime
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';

const getMenuItems = (userRole) => {
    const baseItems = [
        {
            navlabel: true,
            subheader: 'Trang chủ',
        },
        {
            id: uniqueId(),
            title: 'Thông báo',
            icon: IconLayoutDashboard,
            href: '/home',
        },
        {
            id: uniqueId(),
            title: 'Tin nhắn',
            icon: IconMessage,
            href: '/messages',
        },
        {
            id: uniqueId(),
            title: 'Chấm công',
            icon: IconCheckbox,
            href: '/history-checkwork',
        },
    ];

    const adminItems = [
        {
            navlabel: true,
            subheader: 'Chức năng',
        },
        {
            id: uniqueId(),
            title: 'Quản lý nhân viên',
            icon: IconBuilding,
            href: '/manage/employee/list',
        },
        {
            id: uniqueId(),
            title: 'Quản lý chấm công',
            icon: IconReportAnalytics,
            href: '/manage/attendance',
        },
        {
            id: uniqueId(),
            title: 'Quản lý lương',
            icon: IconDeviceImacDollar,
            href: '/manage/payroll/list',
        },
        {
            id: uniqueId(),
            title: 'Quản lý phòng ban',
            icon: IconTournament,
            href: '/manage/department',
        },
        {
            id: uniqueId(),
            title: 'Danh sách công việc',
            icon: IconLicense,
            href: '/manage/tasks',
        },
        {
            id: uniqueId(),
            title: 'Quản lý thống kê',
            icon: IconReport,
            href: '/manage/statistics',
        }
    ];

    const leaderItems = [
        {
            navlabel: true,
            subheader: 'Chức năng',
        },
        {
            id: uniqueId(),
            title: 'Quản lý nhóm',
            icon: IconUsersGroup,
            href: '/manage/group',
        },
        {
            id: uniqueId(),
            title: 'Quản lý nhiệm vụ',
            icon: IconLicense,
            href: '/manage/task',
        },
        {
            id: uniqueId(),
            title: 'Bảng lương',
            icon: IconWallet,
            href: '/manage/payroll',
        },
        {
            id: uniqueId(),
            title: 'Nghỉ phép',
            icon: IconCalendarTime,
            href: '/nleave',
        }
    ];

    const userItems = [
        {
            navlabel: true,
            subheader: 'Chức năng',
        },
        {
            id: uniqueId(),
            title: 'Quản lý nhóm',
            icon: IconUsersGroup,
            href: '/manage/group',
        },
        {
            id: uniqueId(),
            title: 'Nhiệm vụ của tôi',
            icon: IconLicense,
            href: '/manage/task',
        },
        {
            id: uniqueId(),
            title: 'Bảng lương',
            icon: IconWallet,
            href: '/manage/payroll',
        },
        {
            id: uniqueId(),
            title: 'Nghỉ phép',
            icon: IconCalendarTime,
            href: '/nleave',
        }
    ];

    const helpItems = [
        {
            navlabel: true,
            subheader: 'Trợ giúp',
        },
        {
            id: uniqueId(),
            title: 'Thông tin',
            icon: IconInfoCircle,
            href: '/about',
        }
    ];

    // Phân quyền chính xác theo role
    switch (userRole) {
        case 'admin':
            return [...baseItems, ...adminItems, ...helpItems];
        case 'leader':
            return [...baseItems, ...leaderItems, ...helpItems];
        default:
            return [...baseItems, ...userItems, ...helpItems];
    }
};

export default getMenuItems;
