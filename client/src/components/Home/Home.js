import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import UserForm from "../UserForm/UserForm";

import triCouple from "../../assets/img/tri-couple.svg";
import triMap from "../../assets/img/tri-map.svg";
import triChat from "../../assets/img/tri-chat.svg";

import './home.css';

class Home extends Component {
  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/soulmatcher');
    }
    document.title = 'Dadder';
  }

  render() {
    return (
      <React.Fragment>
        <div id="carousel" className="centered">
          <div>
            <div>
              <div className="intro">
              <h1>2025 rồi vẫn chưa có bồ hả ní ?</h1>  
<p>Định kiếm bồ hả? Vô đây là chuẩn bài luôn!  
   Biết đâu "chân ái" của fen đang lượn lờ ngay gần mà hông hay.  
   Vuốt cái là có liền! Match phát, yêu đương liền tay, làm phát chơi lớn hông nè?</p>

              </div>
            </div>
            <div>
              <div className="login">
                <UserForm location={this.props.location}/>
              </div>
            </div>
          </div>
        </div>
        <div id="triptych" className="centered">
  <div>
    <div>
    <img src={triCouple} alt="Ghép đôi" />
    <h2>Fen ơi, tìm bồ xịn nè!</h2>
  <p>Thuật toán đỉnh kout giúp fen chốt đơn nhanh gọn, khỏi sợ lạc trôi!</p>
</div>
<div>
  <img src={triMap} alt="test"/>
  <h2>Crush sát vách nè!</h2>
  <p>Ai mà biết được, có khi tình yêu đang ngay gần, vuốt nhẹ phát là thấy liền!</p>
</div>
<div>
  <img src={triChat} alt="test"/>
  <h2>Match cái, chát liền tay!</h2>
  <p>Vừa mắt nhau rồi thì chần chừ chi nữa? Hai cú click là "chốt đơn" liền nè!</p>
    </div>
  </div>
</div>
      </React.Fragment>
    );
  }
}

Home.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Home);