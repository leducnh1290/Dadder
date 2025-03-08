import React, { Component } from "react";
import { connect } from "react-redux";

import io from "socket.io-client";

import UserPic from "./UserPic";
import Messages from "./Messages";

import {
  getMatches,
  getMessages,
  sendMessage,
} from "../../store/actions/chatActions";

import "./chatpanel.css";

const socket = io("http://localhost:5000");

class ChatPanel extends Component {
  state = {
    shown: false,
    message: "",
  };

  componentDidMount() {
    this.props.getMatches();

  }

  toggleChat = () => {
    const { shown } = this.state;

    this.setState({
      shown: !shown,
    });
    this.props.getMatches();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.current && nextProps.current !== this.props.current) {
      socket.on("newMessage", () => {
        setTimeout(() => {
          this.props.getMessages(nextProps.current);
        }, 50);
      });
      socket.on("incomingCall", ({ caller }) => {
        alert(`📞 Nhận cuộc gọi từ user ${caller}`);
         // Hiển thị UI chấp nhận/từ chối cuộc gọi ở đây
     });
    }
    if (nextProps.matches && nextProps.matches !== this.props.matches) {
      for (let i = 0; i < nextProps.matches.length; i++) {
        socket.emit(
          "room",
          `r${Math.max(
            nextProps.matches[i].me,
            nextProps.matches[i].id
          )}-${Math.min(nextProps.matches[i].me, nextProps.matches[i].id)}`
        );
        socket.emit("register", nextProps.matches[i].me);
      }
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onSendMessage = (e) => {
    e.preventDefault();
    if (this.props.current && this.state.message !== "") {
      this.props.sendMessage(this.props.current, this.state.message);
      this.setState({
        message: "",
      });
      if (this.props.matches && this.props.matches[0])
        socket.emit(
          "send message",
          `r${Math.max(
            this.props.matches[0].me,
            this.props.current
          )}-${Math.min(this.props.matches[0].me, this.props.current)}`
        );
      const msgDiv = document.querySelector(".chat__messages");
      setTimeout(() => {
        msgDiv.scrollTop = msgDiv.scrollHeight;
      }, 100);
    }
  };
  handleCall = () => {
    if (this.props.current) {
        console.log(`Gọi đến user ID: ${this.props.current}`);
        alert(`Đang gọi đến user ID: ${this.props.current}...`);

        socket.emit("startCall", {
          caller:this.props.matches && this.props.matches.length > 0 
          ? this.props.matches[0].me 
          : null,
            receiver: this.props.current,
        });
    } else {
        alert("Vui lòng chọn một người để gọi!");
    }
};

  render() {
    const { matches } = this.props;
    const styleChat = { height: this.state.shown ? "21rem" : "0" };

    return (
      <React.Fragment>
        <div id="chatpanel">
          <div className="chat__title-bar" onClick={this.toggleChat}>
            <div className="chat__title-text">Chat nhanh</div>
          </div>
          <div className="chat__interface" style={styleChat}>
            <div className="chat__users-bar">
              {matches &&
                Array.isArray(matches) &&
                matches.map((match) => (
                  <UserPic
                    key={match.id}
                    userId={match.id}
                    notif={false}
                    current={match.id === this.props.current}
                  />
                ))}
              <div className="chat__ub-no-users">
                Hiện tại bạn chưa ghép nối với bất kỳ ai !
              </div>
            </div>
            <Messages />
            <form onSubmit={this.onSendMessage}>
              <div className="chat__input-bar">
                <div className="chat__input">
                  <input
                    type="text"
                    name="message"
                    minLength="1"
                    maxLength="250"
                    placeholder="Nhập tin nhắn của bạn..."
                    onChange={this.handleChange}
                    value={this.state.message}
                  />
                </div>
                <div className="chat__buttons">
                  <button
                    type="button"
                    className="chat__call-button"
                    onClick={this.handleCall}
                  >
                  </button>
                  <button type="submit" className="chat__button">
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  matches: state.chat.matches,
  messages: state.chat.messages,
  message: state.chat.message,
  current: state.chat.current,
});

export default connect(mapStateToProps, {
  getMatches,
  getMessages,
  sendMessage,
})(ChatPanel);
