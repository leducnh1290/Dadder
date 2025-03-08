import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import axios from 'axios';

import {changeEmail, changeNotifs, changePassword, deleteAccount} from '../../store/actions/settingsActions';

class Panels extends Component {
  state = {
    errors: {},
    email: '',
    password: '',
    oldPassword: '',
    newPassword: '',
    newConfirm: '',
    notifVisit: true,
    notifLike: true,
    notifUnlike: true,
    notifMatch: true,
    notifMessage: true,
    sure: false
  };

  componentWillMount() {
    axios.get('/api/notifs/settings')
      .then(res => {
        this.setState({
            ...res.data
          });
      })
      .catch(err => {});
    axios.get('/api/user/email')
      .then(res => {
        this.setState({
          email: res.data.email
        });
      })
      .catch(err => {});
  }

  submitEmail = (e) => {
    if (e.target.value.length) {
      this.props.changeEmail(this.state);
    } else {
      axios.get('/api/user/email')
        .then(res => {
          this.setState({
            email: res.data.email
          });
        })
        .catch(err => {});
    }
  };

  deleteAccount = (e) => {
    e.preventDefault();

    if (this.state.sure) {
      this.props.deleteAccount(this.state);
    } else {
      this.setState({
        sure: true
      });
    }
  };

  submitPassword = (e) => {
    e.preventDefault();

    this.props.changePassword(this.state);
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  };

  handleToggle = (e) => {
    this.setState({
      [e.target.name]: !this.state[e.target.name]
    });
    setTimeout(() => {
      this.props.changeNotifs(this.state);
    }, 100);
  };

  render() {
    const {
      errors, email, sure, password, oldPassword, newPassword, newConfirm,
      notifVisit, notifLike, notifUnlike, notifMatch, notifMessage
    } = this.state;

    switch (this.props.step) {
      default:
      case 0:
        return (
          <React.Fragment>
            <h1 className="settings__component">Tài khoản của tui</h1>
            <form className="settings__component">
              <label>Đổi email nè</label>
              <input
                className={classnames('validation', {'invalid': errors.email})}
                type="email"
                name="email"
                placeholder="Nhập email mới nha"
                title="example@soulmatch.com"
                required
                minLength="1"
                maxLength="64"
                value={email}
                onChange={this.handleChange}
                onBlur={this.submitEmail}/>
            </form>
            <form className="settings__component" onSubmit={this.deleteAccount}>
              <label>Xóa tài khoản luôn hả?</label>
              <input
                className={classnames('', {'invalid': errors.password})}
                type="password"
                name="password"
                placeholder="Nhập mật khẩu xác nhận nha"
                title="Mật khẩu của bạn"
                required
                minLength="8"
                maxLength="64"
                value={password}
                onChange={this.handleChange}/>
              <button type="submit" className="purple delete">{sure ? 'Chắc chưa? ' : 'Xóa luôn '}</button>
            </form>
          </React.Fragment>
        );
      case 1:
        return (
          <React.Fragment>
            <h1 className="settings__component">Thông báo nè</h1>
            <form className="settings__component">
              <label>Muốn được thông báo khi nào nè:</label><br/>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="notifVisit"
                  name="notifVisit"
                  checked={notifVisit}
                  onChange={this.handleToggle}/>
                <div/>
                <label htmlFor="notifVisit">Ai đó ghé thăm hồ sơ tui.</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="notifLike"
                  name="notifLike"
                  checked={notifLike}
                  onChange={this.handleToggle}/>
                <div/>
                <label htmlFor="notifLike">Ai đó thả tym tui.</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="notifUnlike"
                  name="notifUnlike"
                  checked={notifUnlike}
                  onChange={this.handleToggle}/>
                <div/>
                <label htmlFor="notifUnlike">Ai đó bỏ tym tui .</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="notifMatch"
                  name="notifMatch"
                  checked={notifMatch}
                  onChange={this.handleToggle}/>
                <div/>
                <label htmlFor="notifMatch">Tui match với ai đó.</label>
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="notifMessage"
                  name="notifMessage"
                  checked={notifMessage}
                  onChange={this.handleToggle}/>
                <div/>
                <label htmlFor="notifMessage">Có người nhắn tin nè .</label>
              </div>
            </form>
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <h1 className="settings__component">Bảo mật nha</h1>
            <form className="settings__component" onSubmit={this.submitPassword}>
              <label>Nhập lại mật khẩu cũ nè</label>
              <input
                className={classnames('', {'invalid': errors.password})}
                type="password"
                name="oldPassword"
                placeholder="Nhập mật khẩu cũ vào đây nè"
                title="Mật khẩu cũ của bạn"
                required
                minLength="8"
                maxLength="64"
                value={oldPassword}
                onChange={this.handleChange}/>
              <label>Tạo mật khẩu mới siêu cấp vip pro</label>
              <input
                className={classnames('validation', {'invalid': errors.newPassword || errors.newConfirm})}
                type="password"
                name="newPassword"
                placeholder="8 ký tự nha, có 1 chữ hoa & số luôn"
                title="8 ký tự, có chữ hoa & số nha"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                minLength="8"
                maxLength="64"
                value={newPassword}
                onChange={this.handleChange}/>
              <label>Xác nhận lại mật khẩu mới nè</label>
              <input
                className={classnames('validation', {'invalid': errors.newPassword || errors.newConfirm})}
                type="password"
                name="newConfirm"
                placeholder="Nhập lại mật khẩu mới cho chắc nè"
                title="8 ký tự, có chữ hoa & số nha"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                minLength="8"
                maxLength="64"
                value={newConfirm}
                onChange={this.handleChange}/>
              <button type="submit" className="blue">Đổi luôn </button>
            </form>
          </React.Fragment>
        );
    }
  }

}

export default connect(null, {changeEmail, changeNotifs, changePassword, deleteAccount})(Panels);