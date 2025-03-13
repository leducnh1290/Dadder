import React, { Component } from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import VideoCallPopup from "../VideoCallPopup";
import UserPic from "./UserPic";
import Messages from "./Messages";

import {
  getMatches,
  getMessages,
  sendMessage,
} from "../../store/actions/chatActions";

import "./chatpanel.css";
import '../VideoCallPopUp.css';

// Sửa port kết nối socket
const socket = io("http://localhost:5000");

class ChatPanel extends Component {
  state = {
    shown: false,
    message: "",
    isCallPopupOpen: false, // Popup chấp nhận/từ chối cuộc gọi
    isInCall: false, // Đang trong cuộc gọi
    callerId: null, // ID người gọi
    targetUserId: null, // ID người nhận
    currentUserId: null // ID của mình
  };

  componentDidMount() {
    this.props.getMatches();
    // Lấy ID người dùng hiện tại từ matches
    if (this.props.matches && this.props.matches.length > 0) {
      this.setState({ currentUserId: this.props.matches[0].me });
    }
  }

  toggleChat = () => {
    this.setState({ shown: !this.state.shown });
    this.props.getMatches();
  };

  componentDidUpdate(prevProps) {
    // Cập nhật ID người dùng khi matches thay đổi
    if (this.props.matches && this.props.matches !== prevProps.matches) {
      if (this.props.matches.length > 0) {
        this.setState({ currentUserId: this.props.matches[0].me });
        
        // Đăng ký socket room cho mỗi match
        this.props.matches.forEach(match => {
          socket.emit("room", `r${Math.max(match.me, match.id)}-${Math.min(match.me, match.id)}`);
          socket.emit("register", match.me);
        });
      }
    }

    // Cập nhật tin nhắn khi người chat hiện tại thay đổi
    if (this.props.current && this.props.current !== prevProps.current) {
      socket.off("newMessage");
      socket.on("newMessage", () => {
        this.props.getMessages(this.props.current);
      });
    }

    // Thiết lập các socket listener cho cuộc gọi
    if (!prevProps.matches && this.props.matches) {
      // Khi có cuộc gọi đến
      socket.off("incomingCall");
      socket.on("incomingCall", ({ callerId }) => {
        this.setState({
          isCallPopupOpen: true,
          callerId: callerId,
          targetUserId: this.state.currentUserId
        });
        console.log("caller id", callerId+" my id"+this.state.currentUserId);
      });
      // Khi cuộc gọi được chấp nhận
      socket.off("callAccepted");
      socket.on("callAccepted", () => {
        this.setState({ 
          isCallPopupOpen: false,
          isInCall: true 
        });
      });

      // Khi cuộc gọi bị từ chối
      socket.off("callRejected");
      socket.on("callRejected", ({ message }) => {
        this.setState({ 
          isCallPopupOpen: false,
          isInCall: false,
          callerId: null,
          targetUserId: null
        });
        alert(message || "Cuộc gọi bị từ chối");
      });

      // Khi cuộc gọi kết thúc
      socket.off("callEnded");
      socket.on("callEnded", () => {
        this.setState({ 
          isCallPopupOpen: false,
          isInCall: false,
          callerId: null,
          targetUserId: null
        });
        alert("Cuộc gọi đã kết thúc");
      });
    }
  }

  // Xử lý khi bấm nút gọi
  handleCall = () => {
    if (!this.props.current) {
      alert("Vui lòng chọn một người để gọi!");
      return;
    }

    this.setState({
      callerId: this.state.currentUserId,
      targetUserId: this.props.current
    });

    // Gửi yêu cầu gọi
    socket.emit("callRequest", {
      caller: this.state.currentUserId,
      receiver: this.props.current
    });
  };

  // Xử lý chấp nhận cuộc gọi
  handleAcceptCall = () => {
    socket.emit("acceptCall", {
      caller: this.state.callerId,
      receiver: this.state.currentUserId
    });

    this.setState({ 
      isCallPopupOpen: false,
      isInCall: true 
    });
  };

  // Xử lý từ chối cuộc gọi
  handleRejectCall = () => {
    socket.emit("rejectCall", {
      caller: this.state.callerId,
      receiver: this.state.currentUserId
    });

    this.setState({ 
      isCallPopupOpen: false,
      isInCall: false,
      callerId: null,
      targetUserId: null
    });
  };

  // Xử lý kết thúc cuộc gọi
  handleEndCall = () => {
    socket.emit("endCall", {
      caller: this.state.callerId,
      receiver: this.state.targetUserId
    });

    this.setState({ 
      isCallPopupOpen: false,
      isInCall: false,
      callerId: null,
      targetUserId: null
    });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Gửi tin nhắn
  onSendMessage = (e) => {
    e.preventDefault();
    if (this.props.current && this.state.message !== "") {
      this.props.sendMessage(this.props.current, this.state.message);
      
      if (this.props.matches && this.props.matches[0]) {
        socket.emit("send message", {
          room: `r${Math.max(this.props.matches[0].me, this.props.current)}-${Math.min(this.props.matches[0].me, this.props.current)}`,
          messageData: this.state.message
        });
      }

      this.setState({ message: "" });
    }
  };

  render() {
    const { matches } = this.props;
    const { 
      shown, 
      isCallPopupOpen, 
      isInCall, 
      currentUserId, 
      targetUserId,
      callerId 
    } = this.state;
    
    const styleChat = { height: shown ? "21rem" : "0" };

    return (
      <React.Fragment>
        <div id="chatpanel">
          <div className="chat__title-bar" onClick={this.toggleChat}>
            <div className="chat__title-text">Chat nhanh</div>
          </div>

          <div className="chat__interface" style={styleChat}>
            <div className="chat__users-bar">
              {matches && Array.isArray(matches) && matches.length > 0 ? (
                matches.map((match) => (
                  <UserPic
                    key={match.id}
                    userId={match.id}
                    notif={true}
                    current={match.id === this.props.current}
                  />
                ))
              ) : (
                <div className="chat__ub-no-users">
                  Hiện tại bạn chưa ghép nối với bất kỳ ai!
                </div>
              )}
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
                    className={`chat__call-button ${isInCall ? 'active' : ''}`}
                    onClick={isInCall ? this.handleEndCall : this.handleCall}
                  >
                    {isInCall ? '📞' : '📞'}
                  </button>
                  <button type="submit" className="chat__button">
                    ➤
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Popup chấp nhận/từ chối cuộc gọi */}
          {isCallPopupOpen && !isInCall && (
            <div className="call-popup">
              <h3>Cuộc gọi đến...</h3>
              <div className="call-buttons">
                <button onClick={this.handleAcceptCall} className="accept-call">
                  Chấp nhận
                </button>
                <button onClick={this.handleRejectCall} className="reject-call">
                  Từ chối
                </button>
              </div>
            </div>
          )}

          {/* Component video call */}
          <VideoCallPopup 
            isOpen={isInCall}
            onClose={this.handleEndCall}
            userId={currentUserId}
            targetUserId={currentUserId ===
            callerId?targetUserId:callerId}
            initiateCall={callerId === this.state.currentUserId}
            socket={socket}
           
          />
          
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
