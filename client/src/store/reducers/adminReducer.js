import { 
  ADMIN_GET_STATS, 
  ADMIN_GET_USERS,
  DELETE_USER,
  GET_PRO_USERS,
  UPDATE_PRO_USER_STATUS,
  UPDATE_PRO_USER_PAYMENT
} from '../actions/types';

const initialState = {
  stats: {},          // Thống kê tổng quan
  users: {            // Danh sách người dùng thường
    users: [],
    pagination: null
  },
  proUsers: {         // Danh sách người dùng Pro
    users: [],
    pagination: null
  }
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ADMIN_GET_STATS:
      return {
        ...state,
        stats: action.payload
      };
      
    case ADMIN_GET_USERS:
      return {
        ...state,
        users: action.payload
      };
      
    case DELETE_USER:
      return {
        ...state,
        users: {
          ...state.users,
          users: state.users.users.filter(user => user.id !== action.payload)
        }
      };
      
    case GET_PRO_USERS:
      return {
        ...state,
        proUsers: action.payload
      };
      
    case UPDATE_PRO_USER_STATUS:
      return {
        ...state,
        proUsers: {
          ...state.proUsers,
          users: state.proUsers.users.map(user => 
            user.id === action.payload.userId 
              ? { ...user, status: action.payload.newStatus }
              : user
          )
        }
      };
      
    case UPDATE_PRO_USER_PAYMENT:
      return {
        ...state,
        proUsers: {
          ...state.proUsers,
          users: state.proUsers.users.map(user => 
            user.id === action.payload.userId 
              ? { ...user, payment_status: action.payload.newPaymentStatus }
              : user
          )
        }
      };
      
    default:
      return state;
  }
}