import React, {Component} from 'react';
import {Spring, config} from 'react-spring/renderprops';
import axios from "axios";
import classnames from 'classnames';

export class UserDetails extends Component {
  state = {
    errors: {}
  };

  continue = e => {
    e.preventDefault();
    const {values} = this.props;

    axios.post('/api/user/preregister', values)
      .then(() => {
        this.props.nextStep();
      })
      .catch(err => {
        this.setState({errors: err.response.data});
      });
  };

  render() {
    const {values, handleChange} = this.props;
    const {errors} = this.state;

    return (
      <React.Fragment>
        <Spring
          config={config.molasses}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
        >
          {props => (
            <div style={props}>
              <h2>Đăng ký tài khoản nè!</h2>
              <p className="subtitle">
                Đã có acc rồi hả? <span onClick={this.props.gotoLogin}>Đăng nhập lẹ!</span>
              </p>
    
              <input
                className={classnames('validation', { invalid: errors.email })}
                type="email"
                name="email"
                placeholder="Nhập email của bạn"
                title="example@leducanh.name.vn"
                required
                minLength="1"
                maxLength="64"
                onChange={handleChange('email')}
                defaultValue={values.email}
              />
              <p>{errors.email}&nbsp;</p>
    
              <input
                className={classnames('validation', { invalid: errors.password || errors.confirm })}
                type="password"
                name="password"
                placeholder="Tạo mật khẩu cực xịn"
                title="Ít nhất 8 ký tự, có chữ hoa và số nha!"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                minLength="8"
                maxLength="64"
                onChange={handleChange('password')}
                defaultValue={values.password}
              />
              <p>{errors.password}&nbsp;</p>
    
              <input
                className={classnames('validation', { invalid: errors.confirm })}
                type="password"
                name="confirm"
                placeholder="Nhập lại mật khẩu coi"
                title="Ít nhất 8 ký tự, có chữ hoa và số nha!"
                required
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$"
                minLength="8"
                maxLength="64"
                onChange={handleChange('confirm')}
                defaultValue={values.confirm}
              />
              <p>{errors.confirm}&nbsp;</p>
    
              <button className="blue" onClick={this.continue}>Tiếp tục nè!</button>
            </div>
          )}
        </Spring>
      </React.Fragment>
    );
    
  }
}

export default UserDetails;