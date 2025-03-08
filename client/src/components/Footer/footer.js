import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';

import './footer.css'
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../store/actions/authActions";

class Footer extends Component {
  onLogoutClick = () => {
    this.props.logoutUser();
    window.location.href = '/';
  };

  render() {
    return (
      <footer id="footer" className="centered">
        <div className="footer-container">
          {/* Nếu chưa đăng nhập */}
          {!this.props.auth.isAuthenticated ? (
            <>
              <div className="footer-section">
                <h4>Dadder</h4>
                <NavLink to="/"><p> Trang chủ</p></NavLink>
              </div>
              <div className="footer-section">
                <h4>Đội ngũ phát triển</h4>
                <a href="https://fb.com/leducanh1290/" target="_blank" rel="noopener noreferrer">
                  <p> Đức Anh</p>
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="footer-section">
                <h4>Dadder</h4>
                <NavLink to="/soulmatcher"><p>Dadder</p></NavLink>
                <NavLink to="/search"><p> Tìm kiếm</p></NavLink>
              </div>
              <div className="footer-section">
                <h4>Tài khoản của ní</h4>
                <NavLink to="/account/profile"><p> Hồ sơ</p></NavLink>
                <NavLink to="/account/settings"><p>️ Cài đặt</p></NavLink>
                <NavLink to="" onClick={this.onLogoutClick}><p> Đăng xuất</p></NavLink>
              </div>
              <div className="footer-section">
                <h4>Đội ngũ phát triển</h4>
                <a href="https://fb.com/leducanh1290/" target="_blank" rel="noopener noreferrer">
                  <p> Đức Anh</p>
                </a>
              </div>  
            </>
          )}
        </div>
      </footer>
    );
  }
  
}

Footer.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, {logoutUser})(Footer);