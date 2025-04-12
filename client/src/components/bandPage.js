import React from 'react';
import { NavLink, useLocation } from "react-router-dom";

import brokenHeart from "../assets/img/heartbroken.png";

const Error = (props) => {
  const location = useLocation();  // Sử dụng hook useLocation trong functional component
  const reason = (location.state && location.state.reason) || 'Không có lý do cụ thể';  // Lý do bị ban

  const getError = () => {
    return {
      errTitle: props.errTitle ? props.errTitle : 'Ôi không toang thật rồi :((',
      errText: reason,
    }
  };

  const { errTitle, errText } = getError();

  return (
    <div className="centered">
      <div className="centered-window">
        <div className="error__window">
          <div>
            <img src={brokenHeart} alt="trái tim tan vỡ" />
          </div>
          <div>
            <h1>Ơ kìa Bạn đã bị band !</h1>
            <h4>{errTitle}</h4>
            <p>Buồn quá đi mất, nhưng mà bạn đã bị admin sai đẹp chiêu band vì lý do: {errText}</p>
            <NavLink to='/soulmatcher'>
              <button>Quay về nhen ‍️</button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Error;
