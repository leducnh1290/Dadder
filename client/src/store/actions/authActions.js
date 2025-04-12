import axios from 'axios';
import jwt_decode from 'jwt-decode';

import setAuthToken from '../../utils/setAuthToken';

import {GET_ERRORS, SET_CURRENT_USER} from './types';

export const loginUser = (userData) => dispatch => {
  axios.post('/api/user/login', userData)
    .then(res => {
      const {token} = res.data;
      localStorage.setItem('jwtToken', token);
      setAuthToken(token);
      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
export const loginWithGoogle = (userData) => dispatch => {
  axios.post('/api/user/login/google', userData )
    .then(res => {
      const { token } = res.data;
      localStorage.setItem('jwtToken', token);
      setAuthToken(token);
      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
    })
    .catch(err => {
      const errorPayload = (err.response && err.response.data) || { 
        message: 'Đăng nhập bằng Google thất bại' 
      };

      // Xử lý lỗi đặc biệt từ Google
      if (err.code === 'auth/account-exists-with-different-credential') {
        errorPayload.email = 'Email này đã được đăng ký với phương thức khác';
      }

      dispatch({
        type: GET_ERRORS,
        payload: errorPayload
      });
    });
};
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
};

export const logoutUser = () => dispatch => {
  localStorage.removeItem('jwtToken');
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};