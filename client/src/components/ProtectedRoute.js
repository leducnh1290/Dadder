import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';

class ProtectedRoute extends Component {
  state = {
    isBanned: false,  // Mặc định người dùng chưa bị ban
    banReason: '',
    isLoading: true,   // Mặc định đang tải
  };

  componentDidMount() {
    // Kiểm tra trạng thái ban của người dùng
    axios.post('/api/user/band')
      .then(res => {
        if (res.data.isBanned) {
          this.setState({ isBanned: true,   banReason: res.data.reason, isLoading: false });
        } else {
          this.setState({ isBanned: false, isLoading: false });
        }
      })
      .catch(err => {
        console.error('Lỗi khi kiểm tra trạng thái ban:', err);
        this.setState({ isLoading: false });
      });
  }

  render() {
    const { component, ...rest } = this.props;
    const { isBanned,banReason, isLoading } = this.state;

    if (isLoading) {
      return <div>Loading...</div>;  // Hiển thị loading trong khi đang kiểm tra trạng thái
    }

    if (isBanned) {
      // Nếu người dùng bị ban, chuyển hướng họ tới trang ban
      return <Redirect to={{ pathname: '/ban', state: { reason: banReason } }} />;
    }

    // Nếu người dùng đã đăng nhập và không bị ban, chuyển hướng đến trang index
    if (this.props.auth.isAuthenticated) {
      return <this.props.component {...this.props} />;
    } else {
      return <Redirect to={{ pathname: '/', state: { from: this.props.location } }} />;
    }
  }
}

ProtectedRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(ProtectedRoute);
