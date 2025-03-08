import React, {Component} from 'react';
import {Spring, config} from 'react-spring/renderprops';
import classnames from "classnames";
import axios from "axios";

export class MoreDetails extends Component {
  state = {
    errors: {}
  };

  continue = e => {
    e.preventDefault();

    const {values} = this.props;

    axios.post('/api/user/register', values)
      .then(() => {
        this.props.nextStep();
      })
      .catch(err => {
        this.setState({errors: err.response.data});
      });
  };

  previous = e => {
    e.preventDefault();
    this.props.prevStep();
  };

  render() {
    const {values, handleChange} = this.props;
    const {errors} = this.state;

    return (
      <React.Fragment>
        <Spring config={config.molasses} from={{ opacity: 0 }} to={{ opacity: 1 }}>
          {props => (
            <div style={props}>
              <h2>Kể tui nghe về fen đi!</h2>
              <p className="subtitle">Điền chút info để tụi tui hiểu hơn nè...</p>
    
              <input
                className={classnames('validation', { invalid: errors.username })}
                type="text"
                name="username"
                placeholder="Chọn một cái tên thật cool"
                title="4 đến 30 ký tự, không dấu nha"
                required
                pattern="^[a-zA-Z]{4,30}$"
                minLength="4"
                maxLength="30"
                onChange={handleChange('username')}
                defaultValue={values.username}
              />
              <p>{errors.username}&nbsp;</p>
    
              <input
                className={classnames('smaller-input validation', {
                  invalid: errors.lastName || errors.name,
                })}
                style={{ marginRight: '3%' }}
                type="text"
                name="lastname"
                placeholder="Họ của bạn"
                title="1 đến 30 chữ cái"
                required
                pattern="^([a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+(( |')[a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+)*)+([-]([a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+(( |')[a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+)*)+)*$"
                minLength="1"
                maxLength="30"
                onChange={handleChange('lastName')}
                defaultValue={values.lastName}
              />
    
              <input
                className={classnames('smaller-input validation', {
                  invalid: errors.firstName || errors.name,
                })}
                type="text"
                name="firstname"
                placeholder="Tên gọi thân thương"
                title="1 đến 30 chữ cái"
                required
                pattern="^([a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+(( |')[a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+)*)+([-]([a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+(( |')[a-zA-Zàáâäçèéêëìíîïñòóôöùúûü]+)*)+)*$"
                minLength="1"
                maxLength="30"
                onChange={handleChange('firstName')}
                defaultValue={values.firstName}
              />
              <p>{errors.name}{errors.lastName}{errors.firstName}&nbsp;</p>
    
              <select
                className={classnames('validation', { invalid: errors.gender })}
                name="gender"
                title="Giới tính"
                required
                onChange={handleChange('gender')}
                defaultValue={values.gender}
              >
                <option value="" disabled hidden>Chọn giới tính nè</option>
                <option value="male">Nam thần</option>
                <option value="female">Nữ hoàng</option>
                <option value="other">Khác</option>
              </select>
              <p>{errors.gender}&nbsp;</p>
    
              <button className="back-btn" onClick={this.previous}>Quay lại</button>
              <button className="pink" onClick={this.continue}>Lên thuyền thôi!</button>
            </div>
          )}
        </Spring>
      </React.Fragment>
    );
    
  }
}

export default (MoreDetails);