import React from 'react';
import { Paper, Typography, Box, LinearProgress, List, ListItem, ListItemText } from '@mui/material';

const TaskProgress = ({ progress, milestones = [], tasks = [] }) => { // Default to empty arrays
    const estimatedCompletion = (progress < 100) ? `Estimated completion: ${Math.round((100 - progress) / progress * 10)} days` : 'Completed';

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Tiến độ công việc</Typography>
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Hoàn thành</Typography>
                    <Typography variant="body2">{progress || 0}%</Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress || 0}
                    sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>{estimatedCompletion}</Typography>
            </Box>

            {/* Milestones Section */}
            <Typography variant="h6" gutterBottom>Milestones</Typography>
            <List>
                {milestones.map((milestone, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={milestone.name} secondary={`Status: ${milestone.status}`} />
                    </ListItem>
                ))}
            </List>

            {/* Task Breakdown Section */}
            <Typography variant="h6" gutterBottom>Task Breakdown</Typography>
            <List>
                {tasks.map((task, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={task.name} secondary={`Progress: ${task.progress}%`} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default TaskProgress;