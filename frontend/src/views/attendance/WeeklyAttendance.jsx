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
import { mockWeeklyData } from '../../mock/mockAttendanceData';
import AttendanceMiniTools from './components/AttendanceMiniTools'; // Import the component

const WeeklyAttendance = () => {
    const [currentWeek, setCurrentWeek] = useState(0);
    const weeksInMonth = 4; // Assuming 4 weeks per month for simplicity

    // Calculate current month based on currentWeek
    const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)

    // Group data by user
    const groupedData = mockWeeklyData.reduce((acc, item) => {
        if (!acc[item.userFullName]) {
            acc[item.userFullName] = {};
        }
        acc[item.userFullName][new Date(item.workday).getDay()] = item.status;
        return acc;
    }, {});

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const handleWeekChange = (direction) => {
        setCurrentWeek((prevWeek) => {
            if (direction === 'next') {
                return (prevWeek + 1) % weeksInMonth;
            } else {
                return (prevWeek - 1 + weeksInMonth) % weeksInMonth;
            }
        });
    };

    return (
        <PageContainer title="Weekly Attendance" description="Weekly attendance history">
            <DashboardCard title="Weekly Attendance">
                <AttendanceMiniTools /> {/* Add the tool here */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <IconButton onClick={() => handleWeekChange('prev')}>
                        <IconChevronLeft />
                    </IconButton>
                    <Typography variant="h6">
                        Week {currentWeek + 1} of Month {currentMonth}
                    </Typography>
                    <IconButton onClick={() => handleWeekChange('next')}>
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
                                {daysOfWeek.map((day, index) => (
                                    <TableCell key={index}>{day}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(groupedData).map(([user, days]) => (
                                <TableRow key={user}>
                                    <TableCell>{user}</TableCell>
                                    {daysOfWeek.map((_, index) => (
                                        <TableCell key={index}>
                                            {days[index] || 'vv'}
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

export default WeeklyAttendance;