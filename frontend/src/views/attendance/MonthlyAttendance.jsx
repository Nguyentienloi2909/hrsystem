import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography
} from '@mui/material';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { mockMonthlyData } from '../../mock/mockAttendanceData';
import AttendanceMiniTools from './components/AttendanceMiniTools'; // Import the component

const MonthlyAttendance = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Group data by user
    const groupedData = mockMonthlyData.reduce((acc, item) => {
        if (!acc[item.userFullName]) {
            acc[item.userFullName] = {};
        }
        const date = new Date(item.workday).getDate();
        acc[item.userFullName][date] = item.status;
        return acc;
    }, {});

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const handleMonthChange = (direction) => {
        setCurrentMonth((prevMonth) => {
            let newMonth = direction === 'next' ? prevMonth + 1 : prevMonth - 1;
            if (newMonth < 0) {
                newMonth = 11;
                setCurrentYear((prevYear) => prevYear - 1);
            } else if (newMonth > 11) {
                newMonth = 0;
                setCurrentYear((prevYear) => prevYear + 1);
            }
            return newMonth;
        });
    };

    return (
        <PageContainer title="Monthly Attendance" description="Monthly attendance history">
            <DashboardCard title="Monthly Attendance">
                <AttendanceMiniTools /> {/* Add the tool here */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <IconButton onClick={() => handleMonthChange('prev')}>
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h6">
                        Tháng {currentMonth + 1} Năm {currentYear}
                    </Typography>
                    <IconButton onClick={() => handleMonthChange('next')}>
                        <IconChevronRight />
                    </IconButton>
                </Box>
                <TableContainer component={Paper}>
                    <Table sx={{
                        minWidth: 650,
                        '& .MuiTableCell-root': {
                            border: '1px solid rgba(224, 224, 224, 1)',
                            padding: '8px'
                        },
                        '& .MuiTableHead-root': {
                            '& .MuiTableRow-root': {
                                backgroundColor: '#e3f2fd'
                            }
                        },
                        '& .MuiTableBody-root': {
                            '& .MuiTableRow-root': {
                                '&:nth-of-type(odd)': {
                                    backgroundColor: '#fafafa'
                                },
                                '&:nth-of-type(even)': {
                                    backgroundColor: '#ffffff'
                                },
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }
                        }
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                {Array.from({ length: daysInMonth }, (_, i) => (
                                    <TableCell key={i}>{i + 1}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(groupedData).map(([user, days]) => (
                                <TableRow key={user}>
                                    <TableCell>{user}</TableCell>
                                    {Array.from({ length: daysInMonth }, (_, i) => (
                                        <TableCell key={i}>
                                            {days[i + 1] || '.'}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DashboardCard>
        </PageContainer>
    );
};

export default MonthlyAttendance;