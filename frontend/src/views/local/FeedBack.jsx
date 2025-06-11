import React, { useState } from 'react';
import {
    Grid,
    Card,
    TextField,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Rating
} from '@mui/material';
import { IconSend } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const FeedBack = () => {
    const [feedback, setFeedback] = useState({
        content: '',
        rating: 5
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Feedback submitted:', feedback);
        // Add API call here
    };

    const handleChange = (e) => {
        setFeedback({
            ...feedback,
            [e.target.name]: e.target.value
        });
    };

    // Example feedback data
    const feedbackList = [
        {
            id: 1,
            user: 'Nguyễn Văn A',
            content: 'Hệ thống chấm công rất tiện lợi và dễ sử dụng.',
            rating: 5,
            date: '2024-01-20'
        },
        {
            id: 2,
            user: 'Trần Thị B',
            content: 'Cần cải thiện thêm tính năng báo cáo.',
            rating: 4,
            date: '2024-01-19'
        }
    ];

    return (
        <PageContainer title="Góp ý" description="Góp ý về hệ thống">
            <Grid container spacing={3}>
                {/* Feedback Form */}
                <Grid item xs={12} md={4}>
                    <DashboardCard title="Gửi góp ý">
                        <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography component="legend">Đánh giá</Typography>
                                <Rating
                                    name="rating"
                                    value={feedback.rating}
                                    onChange={(event, newValue) => {
                                        setFeedback({ ...feedback, rating: newValue });
                                    }}
                                />
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                name="content"
                                label="Nội dung góp ý"
                                value={feedback.content}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                endIcon={<IconSend />}
                                fullWidth
                            >
                                Gửi góp ý
                            </Button>
                        </Box>
                    </DashboardCard>
                </Grid>

                {/* Feedback List */}
                <Grid item xs={12} md={8}>
                    <DashboardCard title="Danh sách góp ý">
                        <List>
                            {feedbackList.map((item) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar>{item.user[0]}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {item.user}
                                                    </Typography>
                                                    <Rating value={item.rating} readOnly size="small" />
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {item.content}
                                                    </Typography>
                                                    <br />
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {new Date(item.date).toLocaleDateString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    </DashboardCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default FeedBack;