import React from 'react';
import { Box, Typography, Container, Grid, Paper, useTheme } from '@mui/material';

const About = () => {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: theme.palette.background.paper }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4, color: theme.palette.primary.main }}>
                    Về Công Ty LD Technology
                </Typography>
                <Typography gutterBottom align="center" sx={{ mb: 10 }}>
                    <img
                        src="src/assets/images/logos/logo-3.svg"
                        alt="Ảnh logo Cty"
                        style={{
                            width: '300px',
                            height: 'auto',
                            // backgroundColor: 'whitesmoke', // Use a lighter background color
                            padding: '10px', // Optional: Add padding for better appearance
                            borderRadius: '8px' // Optional: Add border-radius for a softer look
                        }}
                    />
                </Typography>
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            border: `5px solid ${theme.palette.grey[400]}`,
                            borderRadius: '8px',
                            p: 2,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: 3,
                            },
                        }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', color: theme.palette.primary.main }}>
                                Giới Thiệu Hệ Thống
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', color: theme.palette.text.primary, mb: 2 }}>
                                Hệ thống Quản lý Nhân sự là một ứng dụng web hiện đại, được thiết kế để tối ưu hóa quy trình quản lý nhân sự trong doanh nghiệp. Với giao diện thân thiện và tính năng đa dạng, hệ thống giúp doanh nghiệp quản lý hiệu quả thông tin nhân viên, chấm công, lương thưởng và đánh giá hiệu suất.
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            border: `5px solid ${theme.palette.grey[400]}`,
                            borderRadius: '8px',
                            p: 2,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: 3,
                            },
                        }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', color: theme.palette.text.secondary }}>
                                Tính Năng Chính
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', color: theme.palette.text.primary, mb: 2 }}>
                                <Box component="ul" sx={{ pl: 4 }}>
                                    <Box component="li">Quản lý thông tin nhân viên toàn diện</Box>
                                    <Box component="li">Phân quyền và quản lý người dùng</Box>
                                    <Box component="li">Quản lý chấm công và nghỉ phép</Box>
                                    <Box component="li">Tính lương và phụ cấp tự động</Box>
                                    <Box component="li">Đánh giá hiệu suất nhân viên</Box>
                                    <Box component="li">Báo cáo và thống kê chi tiết</Box>
                                </Box>
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            border: `5px solid ${theme.palette.grey[400]}`,
                            borderRadius: '8px',
                            p: 2,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: 3,
                            },
                        }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', color: theme.palette.primary.main }}>
                                Lợi Ích
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', color: theme.palette.text.primary, mb: 2 }}>
                                <Box component="ul" sx={{ pl: 4 }}>
                                    <Box component="li">Tự động hóa quy trình quản lý nhân sự</Box>
                                    <Box component="li">Giảm thiểu sai sót trong xử lý dữ liệu</Box>
                                    <Box component="li">Tiết kiệm thời gian và chi phí quản lý</Box>
                                    <Box component="li">Tăng cường bảo mật thông tin</Box>
                                    <Box component="li">Hỗ trợ ra quyết định nhanh chóng</Box>
                                </Box>
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{
                            width: '100%',
                            height: '100%',
                            border: `5px solid ${theme.palette.grey[400]}`,
                            borderRadius: '8px',
                            p: 2,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: 3,
                            },
                        }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', textAlign: 'center', color: theme.palette.primary.main }}>
                                Hỗ Trợ Người Dùng
                            </Typography>
                            <Typography variant="body1" paragraph sx={{ textAlign: 'justify', color: theme.palette.text.primary, mb: 2 }}>
                                <Box component="ul" sx={{ pl: 4 }}>
                                    <Box component="li">Giao diện thân thiện, dễ sử dụng</Box>
                                    <Box component="li">Hướng dẫn sử dụng chi tiết</Box>
                                    <Box component="li">Hỗ trợ kỹ thuật 24/7</Box>
                                    <Box component="li">Cập nhật tính năng thường xuyên</Box>
                                    <Box component="li">Bảo mật dữ liệu theo tiêu chuẩn</Box>
                                </Box>
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default About;