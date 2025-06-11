import axios from "axios";

export default class ApiService {
    // static BASE_URL = "http://192.168.1.126:7247/api";
    static BASE_URL = "http://localhost:7247/api";

    static getHeader() {
        const token = sessionStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    static async handleRequest(method, url, data = null) {
        try {
            let headers = this.getHeader();
            if (data instanceof FormData) {
                headers = { Authorization: headers.Authorization };
            }
            const response = await axios({
                method,
                url: `${this.BASE_URL}${url}`,
                data,
                headers
            });
            return response.data;
        } catch (error) {
            console.error('Lỗi API:', error.message || error); // Localized error message
            throw error;
        }
    }

    /** AUTHENTICATION */
    static loginUser(loginDetails) {
        return this.handleRequest('post', '/Auth/login', loginDetails);
    }

    static logout() {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('role');
    }

    static isAuthenticated() {
        const authToken = sessionStorage.getItem('authToken');
        return !!authToken;
    }

    static isAdmin() {
        const role = sessionStorage.getItem('role');
        return role === 'ADMIN';
    }

    static isUser() {
        const role = sessionStorage.getItem('role');
        return role === 'USER';
    }

    /** USER MANAGEMENT */
    static createUser(formData) {
        return this.handleRequest('post', '/Auth/Register', formData);
    }

    static updateUser(userId, userData) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('put', `/User/${userId}`, userData);
    }

    static deleteUser(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('delete', `/User/${userId}`);
    }

    static getAllUsers() {
        return this.handleRequest('get', '/User');
    }

    static async getUserProfile() {
        const currentToken = sessionStorage.getItem('authToken');
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
            try {
                const profile = JSON.parse(cachedProfile);
                if (profile?.token === currentToken) {
                    return profile;
                }
            } catch {
                // intentionally ignored JSON parse error
            }
        }
        const response = await this.handleRequest('get', '/User/getProfile');
        // Lưu kèm token vào cache
        localStorage.setItem('userProfile', JSON.stringify({ ...response, token: currentToken }));
        return response;
    }

    static getUser(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('get', `/User/${userId}`);
    }

    static changePassword(passwordData) {
        return this.handleRequest('post', '/User/change-password', passwordData);
    }

    /** DEPARTMENT MANAGEMENT */
    static async getAllDepartments() {
        const response = await this.handleRequest('get', '/Department');
        return response;
    }

    static getDepartmentById(departmentId) {
        if (!departmentId) {
            throw new Error('ID phòng ban không được để trống');
        }
        return this.handleRequest('get', `/Department/${departmentId}`);
    }

    static createDepartment(departmentData) {
        return this.handleRequest('post', '/Department', departmentData);
    }

    static updateDepartment(departmentId, departmentData) {
        if (!departmentId) {
            throw new Error('ID phòng ban không được để trống');
        }
        return this.handleRequest('put', `/Department/${departmentId}`, departmentData);
    }

    static deleteDepartment(departmentId) {
        if (!departmentId) {
            throw new Error('ID phòng ban không được để trống');
        }
        return this.handleRequest('delete', `/Department/${departmentId}`);
    }

    /** ATTENDANCE MANAGEMENT */
    static checkIn() {
        return this.handleRequest('post', '/Attendance/checkin', {});
    }

    static checkOut(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('post', `/Attendance/checkout?userId=${userId}`);
    }

    static applyLeave(userId, leaveData) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('post', `/Attendance/leave/${userId}`, leaveData);
    }

    static getTodayAttendance() {
        return this.handleRequest('get', '/Attendance/today');
    }

    static getAttendance(month, year) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/attendance?month=${month}&year=${year}`);
    }


    static getAllAttendance(month, year) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/attendanceAll?month=${month}&year=${year}`);
    }

    // static getTKAttendanceToMonthByUser(month, year) {
    //     if (!month || !year || month < 1 || month > 12 || year < 2000) {
    //         throw new Error('Tháng hoặc năm không hợp lệ');
    //     }
    //     return this.handleRequest('get', `/Attendance/summary/monthly?month=${month}&year=${year}`);
    // }

    // static getTKAttendanceToWeekByUser(month, year) {
    //     if (!month || !year || month < 1 || month > 12 || year < 2000) {
    //         throw new Error('Tháng hoặc năm không hợp lệ');
    //     }
    //     return this.handleRequest('get', `/Attendance/summary/weekly?month=${month}&year=${year}`);
    // }

    static getTKAttendanceToWeekByUserId(userId, month, year) {
        if (!userId || !month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('ID, tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/summary/weekly/${userId}?month=${month}&year=${year}`);
    }

    /**
     * Lấy thống kê chấm công theo tháng của 1 user
     * @param {number} userId
     * @param {number} month 
     * @param {number} year 
     * @returns {Promise<any>}
     */
    static getAttendanceSummaryMonthly(userId, month, year) {
        if (!userId || !month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('ID, tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/summary/monthly/${userId}?month=${month}&year=${year}`);
    }

    static getTKAttendanceToYear(year) {
        if (!year || year < 2000) {
            throw new Error('Năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/summary/year?year=${year}`);
    }
    //     Hàm này lấy thống kê chấm công theo tháng của tất cả người dùng
    static getTKAttendanceToMonth(month, year) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Attendance/summary/month?month=${month}&year=${year}`);
    }

    static getTKAttendanceToWeek() {
        return this.handleRequest('get', '/Attendance/summary/week');
    }

    /** TASK MANAGEMENT */
    static createTask(taskData) {
        return this.handleRequest('post', '/Task', taskData); // Fixed typo: '.post' -> 'post'
    }

    static updateTask(taskId, taskData) {
        if (!taskId) {
            throw new Error('ID công việc không được để trống');
        }
        return this.handleRequest('put', `/Task/${taskId}`, taskData);
    }

    static updateTaskStatus(taskId) {
        if (!taskId) {
            throw new Error('ID công việc không được để trống');
        }
        return this.handleRequest('put', `/Task/updateStatus/${taskId}`);
    }


    static getTask(taskId) {
        if (!taskId) {
            throw new Error('ID công việc không được để trống');
        }
        return this.handleRequest('get', `/Task/${taskId}`);
    }

    static deleteTask(taskId) {
        if (!taskId) {
            throw new Error('ID công việc không được để trống');
        }
        return this.handleRequest('delete', `/Task/${taskId}`);
    }

    static getAllTasks() {
        return this.handleRequest('get', '/Task/all');
    }

    static getTasksByUser(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('get', `/Task/user/${userId}`);
    }

    static getTasksByLeader(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('get', `/Task/AssignedTask/${userId}`);
    }

    /** ROLE MANAGEMENT */
    static getAllRoles() {
        return this.handleRequest('get', '/Role');
    }

    static createRole(roleData) {
        return this.handleRequest('post', '/Role', roleData);
    }

    static getRole(roleId) {
        if (!roleId) {
            throw new Error('ID vai trò không được để trống');
        }
        return this.handleRequest('get', `/Role/${roleId}`);
    }

    static updateRole(roleId, roleData) {
        if (!roleId) {
            throw new Error('ID vai trò không được để trống');
        }
        return this.handleRequest('put', `/Role/${roleId}`, roleData);
    }

    static deleteRole(roleId) {
        if (!roleId) {
            throw new Error('ID vai trò không được để trống');
        }
        return this.handleRequest('delete', `/Role/${roleId}`);
    }

    /** GROUP MANAGEMENT */
    static getAllGroups() {
        return this.handleRequest('get', '/Group');
    }

    static createGroup(groupData) {
        return this.handleRequest('post', '/Group', groupData);
    }

    static getGroup(groupId) {
        if (!groupId) {
            throw new Error('ID nhóm không được để trống');
        }
        return this.handleRequest('get', `/Group/${groupId}`);
    }

    static updateGroup(groupId, groupData) {
        if (!groupId) {
            throw new Error('ID nhóm không được để trống');
        }
        return this.handleRequest('put', `/Group/${groupId}`, groupData);
    }

    static deleteGroup(groupId) {
        if (!groupId) {
            throw new Error('ID nhóm không được để trống');
        }
        return this.handleRequest('delete', `/Group/${groupId}`);
    }

    /** GROUP MEMBER MANAGEMENT */
    static addUserToGroup(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error('ID nhóm hoặc ID người dùng không được để trống');
        }
        return this.handleRequest('post', `/Group/${groupId}/add-user/${userId}`);
    }

    static removeUserFromGroup(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error('ID nhóm hoặc ID người dùng không được để trống');
        }
        return this.handleRequest('delete', `/Group/${groupId}/remove-user/${userId}`);
    }

    /** BANK MANAGEMENT */
    static async getBankList() {
        try {
            const response = await axios.get('https://api.vietqr.io/v2/banks');
            return response.data?.data || [];
        } catch (error) {
            console.error('Lỗi khi lấy danh sách ngân hàng:', error.message || error);
            return [];
        }
    }

    /** SALARY MANAGEMENT */
    static getPayroll(payrollId) {
        if (!payrollId) {
            throw new Error('ID lương không được để trống');
        }
        return this.handleRequest('get', `/Salary/${payrollId}`);
    }

    static getSalaryById(userId, month, year) {
        if (!userId || !month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Thông tin người dùng, tháng hoặc năm không hợp lệ');
        }
        const url = `/Salary/getSalarById?userId=${userId}&month=${month}&year=${year}`;
        return this.handleRequest('get', url);
    }

    static calculateAllSalaries(month, year) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Salary/calculate-all?month=${month}&year=${year}`);
    }

    static getSalariesByQuarter(year, quarter) {
        if (!year || !quarter || year < 2000 || quarter < 1 || quarter > 4) {
            throw new Error('Năm hoặc quý không hợp lệ');
        }
        const url = `/Salary/quarter/${year}/${quarter}`;
        return this.handleRequest('get', url);
    }

    static getSalariesByYear(year) {
        if (!year || year < 2000) {
            throw new Error('Năm không hợp lệ');
        }
        const url = `/Salary/year/${year}`;
        return this.handleRequest('get', url);
    }

    static getSalariesByMonth(year, month) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Salary/calculate-all?month=${month}&year=${year}`);
    }

    static createPayroll(payrollData) {
        return this.handleRequest('post', '/Salary', payrollData);
    }

    static updatePayroll(payrollId, payrollData) {
        if (!payrollId) {
            throw new Error('ID lương không được để trống');
        }
        return this.handleRequest('put', `/Salary/${payrollId}`, payrollData);
    }

    static deletePayroll(payrollId) {
        if (!payrollId) {
            throw new Error('ID lương không được để trống');
        }
        return this.handleRequest('delete', `/Salary/${payrollId}`);
    }

    /** NOTIFICATION MANAGEMENT */
    static sendNotification(notificationData) {
        return this.handleRequest('post', '/Notification/send', notificationData);
    }

    static updateNotification(notificationData) {
        if (!notificationData?.id) {
            throw new Error('ID thông báo không được để trống');
        }
        return this.handleRequest('put', `/Notification/${notificationData.id}`, notificationData);
    }

    static deleteNotification(notificationId) {
        if (!notificationId) {
            throw new Error('ID thông báo không được để trống');
        }
        return this.handleRequest('delete', `/Notification/${notificationId}`);
    }

    static getAllNotifications() {
        return this.handleRequest('get', '/Notification/all');
    }

    static getStatusNotification() {
        return this.handleRequest('get', '/Notification/user');
    }

    static updateStatusNotification(notificationId) {
        if (!notificationId) {
            throw new Error('ID thông báo không được để trống');
        }
        return this.handleRequest('put', `/Notification/user/${notificationId}`);
    }

    /** STATUS MANAGEMENT */
    static getStatusAttendance() {
        return this.handleRequest('get', '/Status/StatusAttendance');
    }

    static getStatusTask() {
        return this.handleRequest('get', '/Status/StatusTask');
    }

    static getComment(taskId) {
        if (!taskId) {
            throw new Error('ID công việc không được để trống');
        }
        return this.handleRequest('get', `/Comment/${taskId}`);
    }

    static async getCurrentUserId() {
        const profile = await this.getUserProfile();
        return profile?.id;
    }

    static sendComment(commentData) {
        return this.handleRequest('post', '/Comment', commentData);
    }

    /** MESSAGE MANAGEMENT */
    static getChatGroups() {
        return this.handleRequest('get', '/GroupChat');
    }

    static getChatGroupById(groupId) {
        if (!groupId) {
            throw new Error('ID nhóm chat không được để trống');
        }
        return this.handleRequest('get', `/Message/chatGroups/${groupId}`);
    }

    static getChatByUserId(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        return this.handleRequest('get', `/Message/private/${userId}`);
    }

    static createGroupChat(groupData) {
        return this.handleRequest('post', '/GroupChat', groupData);
    }

    static addUserToGroupChat(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error('ID nhóm chat hoặc ID người dùng không được để trống');
        }
        return this.handleRequest('post', `/GroupChat/${groupId}/add-user/${userId}`);
    }

    static deleteUserFromGroupChat(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error('ID nhóm chat hoặc ID người dùng không được để trống');
        }
        return this.handleRequest('delete', `/GroupChat/${groupId}/remove-user/${userId}`);
    }

    /** LEAVE REQUEST MANAGEMENT */
    static createLeaveRequest(leaveData) {
        // leaveData: { userId, startDate, endDate, reason, ... }
        return this.handleRequest('post', '/LeaveRequest/create', leaveData);
    }

    static approveLeaveRequest(requestId) {
        if (!requestId) {
            throw new Error('ID đơn nghỉ phép không được để trống');
        }
        return this.handleRequest('put', `/LeaveRequest/approve/${requestId}`);
    }

    static cancelLeaveRequest(requestId) {
        if (!requestId) {
            throw new Error('ID đơn nghỉ phép không được để trống');
        }
        return this.handleRequest('put', `/LeaveRequest/cancel/${requestId}`);
    }

    static getLeaveRequestsByUser(userId) {
        if (!userId) {
            throw new Error('ID người dùng không được để trống');
        }
        // API: http://192.168.1.126:7247/{userID}
        return this.handleRequest('get', `/LeaveRequest/${userId}`);
    }

    static getAllLeaveRequests() {
        // API: http://192.168.1.126:7247/api/LeaveRequest
        return this.handleRequest('get', '/LeaveRequest');
    }

    static getStatisticSalary(month, year) {
        if (!month || !year || month < 1 || month > 12 || year < 2000) {
            throw new Error('Tháng hoặc năm không hợp lệ');
        }
        return this.handleRequest('get', `/Salary/statistics?year=${year}&month=${month}`);
    }

    static getStatisticEmployee() {
        return this.handleRequest('get', '/User/statistics');
    }

    /**
     * Gửi email lương cho tất cả nhân viên
     * @param {number} month 
     * @param {number} year 
     */
    static sendGmailSalaryAll(month, year) {
        if (!month || !year) {
            throw new Error('Tháng và năm không được để trống');
        }
        return this.handleRequest('post', `/Salary/send-salary-emails?month=${month}&year=${year}`);
    }

    /**
     * Gửi email lương cho một nhân viên
     * @param {number} userId 
     * @param {number} month 
     * @param {number} year 
     */
    static sendGmailSalaryByUser(userId, month, year) {
        if (!userId || !month || !year) {
            throw new Error('ID, tháng và năm không được để trống');
        }
        return this.handleRequest('post', `/Salary/send-salary-email/${userId}?month=${month}&year=${year}`);
    }
}