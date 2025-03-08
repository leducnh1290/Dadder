import React, {Component} from 'react';
import {connect} from 'react-redux';
import {NavLink} from "react-router-dom";

import {logoutUser} from "../../store/actions/authActions";

class Account extends Component {
  onLogoutClick = () => {
    this.props.logoutUser();
    window.location.href = '/';
  };

  render() {
    return (
      <React.Fragment>
        <NavLink className="item profile" to="/account/profile">
          <div className="item__img" />
          <div className="item__txt">
            <h4>Hồ sơ của tui</h4>
            <p>Muốn biết người ta thấy mình sao? Vô đây xem liền!</p>
          </div>
        </NavLink>
        <NavLink className="item edit" to="/account/profile/edit">
          <div className="item__img" />
          <div className="item__txt">
            <h4>Chỉnh sửa hồ sơ</h4>
            <p>Cập nhật profile cho chất hơn nè (giới tính, tuổi, v.v.)</p>
          </div>
        </NavLink>
        <NavLink className="item settings" to="/account/settings">
          <div className="item__img" />
          <div className="item__txt">
            <h4>Cài đặt cá nhân</h4>
            <p>Muốn đổi pass hay email? Xử lý ngay tại đây!</p>
          </div>
        </NavLink>
        <div className="item logout" onClick={this.onLogoutClick}>
          <div className="item__img" />
          <div className="item__txt">
            <h4>Đăng xuất cái nhẹ</h4>
            <p>Nghỉ chút rồi quay lại quẹt tiếp nha! </p>
          </div>
        </div>
      </React.Fragment>
    );
  }
  
}

export default connect(null, {logoutUser})(Account);