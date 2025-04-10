import axios from 'axios';
import { ADMIN_GET_STATS, ADMIN_GET_USERS, GET_ERRORS, LOADING,DELETE_USER,GET_PRO_USERS } from './types';


// Trong file adminActions.js
export const deleteUserAction  = (userId) => async (dispatch) => {
  dispatch({ type: LOADING, payload: true });
  try {
    await axios.delete(`/api/admin/users/${userId}`);
    dispatch({ type: DELETE_USER, payload: userId });
    // Gọi lại danh sách user sau khi xóa
    dispatch(getAdminUsers()); 
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
          payload: (err.response && err.response.data) ? err.response.data : { error: 'Unknown error' }
    });
  } finally {
    dispatch({ type: LOADING, payload: false });
  }
};
// Lấy thống kê hệ thống (Tổng user, đang hoạt động, match, giới tính)
export const getAdminStats = () => dispatch => {
  dispatch({ type: LOADING, payload: true });

  axios.get('/api/admin/status')
    .then(res => {
      dispatch({
        type: ADMIN_GET_STATS,
        payload: res.data
      });
      dispatch({ type: LOADING, payload: false });
    })
    .catch(err => {
        console.error('Lỗi getAdminStats:', err);
      dispatch({
        type: GET_ERRORS,
        payload: (err.response && err.response.data) ? err.response.data : { error: 'Unknown error' }

      });
      dispatch({ type: LOADING, payload: false });
    });
};

// Lấy danh sách người dùng có phân trang
export const getAdminUsers = (page = 1, limit = 10, search = '', status = 'all') => dispatch => {
  dispatch({ type: LOADING, payload: true });

  let url = `/api/admin/users?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (status !== 'all') {
    url += `&status=${encodeURIComponent(status)}`;
  }

  axios.get(url)
    .then(res => {
      dispatch({
        type: ADMIN_GET_USERS,
        payload: res.data
      });
      dispatch({ type: LOADING, payload: false });
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: (err.response && err.response.data) ? err.response.data : { error: 'Unknown error' }

      });
      dispatch({ type: LOADING, payload: false });
    });
};
export const banUserAction = (userId, reason = 'Vi phạm chưa xác định') => async (dispatch) => {
  dispatch({ type: LOADING, payload: true });
  try {
    await axios.post(`/api/admin/users/${userId}/ban`, { reason });

    // Gọi lại danh sách user sau khi ban
    dispatch(getAdminUsers());

    // Nếu cần lưu vào store:
    // dispatch({ type: BAN_USER, payload: userId });
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: (err.response && err.response.data) ? err.response.data : { error: 'Lỗi khi ban user' }
    });
  } finally {
    dispatch({ type: LOADING, payload: false });
  }
};
// Trong adminActions.js
export const getProUsers = (page = 1, limit = 10, search = '', status = 'all', plan = 'all') => dispatch => {
  dispatch({ type: LOADING, payload: true });
  
  let url = `/api/admin/prouser?page=${page}&limit=${limit}`;
  
  if (search) url += `&search=${search}`;
  if (status !== 'all') url += `&status=${status}`;
  if (plan !== 'all') url += `&plan=${plan}`;

  axios.get(url)
    .then(res => {
      dispatch({
        type: GET_PRO_USERS,
        payload: res.data
      });
      dispatch({ type: LOADING, payload: false });
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: (err.response && err.response.data) ? err.response.data : { error: 'Lỗi khi tải danh sách user pro' }
      });
      dispatch({ type: LOADING, payload: false });
    });
};
export const unbanUserAction = (userId) => async (dispatch) => {
  dispatch({ type: LOADING, payload: true });
  try {
    await axios.post(`/api/admin/users/${userId}/unban`);

    // Gọi lại danh sách user sau khi unban
    dispatch(getAdminUsers());

    // Nếu cần lưu vào store:
    // dispatch({ type: UNBAN_USER, payload: userId });
  } catch (err) {
    dispatch({
      type: GET_ERRORS,
      payload: (err.response && err.response.data) ? err.response.data : { error: 'Lỗi khi unban user' }
    });
  } finally {
    dispatch({ type: LOADING, payload: false });
  }
};

