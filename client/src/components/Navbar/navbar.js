import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import axios from 'axios';

import {logoutUser} from '../../store/actions/authActions';
import {getNotifs} from '../../store/actions/notificationActions';

import NotificationsPanel from '../Notifications/NotificationsPanel';
import Account from './Account';

import './navbar.css'

import logo from '../../assets/img/logo.svg'

class Navbar extends Component {
  state = {
    notifMenu: false,
    userMenu: false,
    filterNotifsBy: 'all'
  };

  onLogoutClick = () => {
    this.props.logoutUser();
    window.location.href = '/';
  };

  clickAway = () => {
    this.setState({
      notifMenu: false,
      userMenu: false
    });
  };

  toggleNotifMenu = () => {
    this.setState({
      notifMenu: !this.state.notifMenu,
      userMenu: false
    });
  };

  toggleUserMenu = () => {
    this.setState({
      userMenu: !this.state.userMenu,
      notifMenu: false
    });
  };

  markAllAsRead = () => {
    axios.patch('/api/notifs/readAll')
      .then(res => {
        this.props.getNotifs();
      })
      .catch(err => {});
  };

  handleFilterChange = (e) => {
    this.setState({
      filterNotifsBy: e.target.value
    });
  };

  render() {
    const {isAuthenticated} = this.props.auth;
    const guestLinks = (
      <div/>
    );
    const authLinks = (
      <React.Fragment>
        <div><NavLink to="/soulmatcher">Dadder Recommend</NavLink></div>
<div className="vr" />
<div><NavLink to="/search"> Cho tui nhiều lựa chọn hơn đi</NavLink></div>
      </React.Fragment>
    );
    const guestButtons = (
      <div/>
    );
    const authButtons = (
      <React.Fragment>
        <div className={classnames('nav-overlay', {
          'shown': this.state.notifMenu || this.state.userMenu
        })} onClick={this.clickAway}/>
        <div className="nav-button notifications">
          <svg onClick={this.toggleNotifMenu} xmlns="http://www.w3.org/2000/svg" width="30" height="30"
               viewBox="0 0 24 24"
               fill="none"
               stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
          </svg>
          <div className={classnames('nav-menu', {
            'opened': this.state.notifMenu
          })}>
            <div className="menu__title notifications">
            <select className="custom-select" defaultValue="all" onChange={this.handleFilterChange}>
  <option value="all"> Tất cả </option>
  <option value="visit"> Ai ghé thăm</option>
  <option value="like"> Ai thích bạn</option>
  <option value="unlike"> Ai bỏ thích</option>
  <option value="match"> Ghép đôi</option>
  <option value="message"> Tin nhắn</option>
</select>

              Notifications
              <button onClick={this.markAllAsRead}/>
            </div>
            <NotificationsPanel filterBy={this.state.filterNotifsBy}/>
          </div>
        </div>
        <div className="nav-button account">
          <svg onClick={this.toggleUserMenu} xmlns="http://www.w3.org/2000/svg" width="30" height="30"
               viewBox="0 0 24 24"
               fill="none"
               stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <div className={classnames('nav-menu', {
            'opened': this.state.userMenu
          })}>
            <div className="menu__title">Lựa chọn nhanh</div>
            <Account/>
          </div>
        </div>
        <div className="nav-button" onClick={this.onLogoutClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
               stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9"/>
          </svg>
        </div>
      </React.Fragment>
    );

    return (
      <div id="navbar">
        <div className="nav-items">
          <div className="openSidebar">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
                   stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </div>
          </div>
          <div className="defaultLinks">
            {isAuthenticated ? authLinks : guestLinks}
          </div>
          <div className="logo">
            <img src={logo} alt="logo"/>
          </div>
          <div className="rightButtons">
            {isAuthenticated ? authButtons : guestButtons}
          </div>
        </div>
      </div>
    );
  }
}

Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  getNotifs: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, {logoutUser, getNotifs})(Navbar);