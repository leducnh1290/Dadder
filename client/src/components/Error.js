import React, { Component } from 'react';
import { NavLink } from "react-router-dom";

import brokenHeart from "../assets/img/heartbroken.png";

class Error extends Component {
  componentDidMount() {
    document.title = 'Lỗi òi';
  }

  getError = () => {
    return {
      errTitle: this.props.errTitle ? this.props.errTitle : 'Lỗi 404 òi',
      errText: this.props.errText ? this.props.errText : 'Hình như trang bạn tìm hông có tồn tại á...'
    }
  };

  render() {
    const { errTitle, errText } = this.getError();

    return (
      <div className="centered">
        <div className="centered-window">
          <div className="error__window">
            <div>
              <img src={brokenHeart} alt="trái tim tan vỡ "/>
            </div>
            <div>
              <h1>Ơ kìa !</h1>
              <h4>{errTitle}</h4>
              <p>Buồn quá đi mất, nhưng mà {errText}</p>
              <NavLink to='/'>
                <button>Quay về nhen ‍️</button>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Error;
