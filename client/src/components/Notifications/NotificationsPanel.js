import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from "classnames";
import {NavLink} from 'react-router-dom';
import io from "socket.io-client";

import {getNotifs, newNotif} from '../../store/actions/notificationActions';

import noNotif from '../../assets/img/notif-none.svg';

const socket = io('http://localhost:5000');

class NotificationsPanel extends Component {
  state = {
    list: [],
    filter: 'all'
  };

  componentDidMount() {
    this.props.getNotifs();
    socket.emit('room', `r${this.props.userId}`);
    socket.on('new notif', (data) => {
      this.props.newNotif(data);
      this.props.getNotifs();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list && nextProps.list !== this.props.list && Array.isArray(nextProps.list)) {
      this.setState({
        list: nextProps.list
      });
    }
    if (nextProps.filterBy && nextProps.filterBy !== this.props.filterBy) {
      this.setState({
        filter: nextProps.filterBy
      });
    }
  }

  getTitle = (type) => {
    switch (type) {
      case 'visit':
        return 'Có ai đang dòm ngó nè! ';
      case 'like':
        return 'Tình yêu đang lơ lửng~ ';
      case 'unlike':
        return 'Hic... chia tay sớm thế à? ';
      case 'match':
        return 'Trời sinh một cặp luôn! ';
      case 'message':
        return 'Tin nhắn tới kìa !';
      default:
        return 'Hello bạn êiii! ';
    }
  };
  

  filterBy = (arr) => {
    if (this.state.filter === 'all') {
      return (arr);
    } else {
      return (arr.filter(elem => elem.type === this.state.filter));
    }
  };

  render() {
    const {list} = this.state;

    return (
      <div className="items">
        {list && list.length > 0 ? (
          this.filterBy(list).map((notif) => (
            <NavLink key={notif.id} className={classnames('item', { 'new': !notif.read })} to={`/profile/${notif.notifier_name}`}>
              <div className="item__img"/>
              <div className="item__txt">
                <h4>{this.getTitle(notif.type)}</h4>
                <p>{notif.content}</p>
              </div>
            </NavLink>
          ))
        ) : (
          <div className="item no-notif">
            <img src={noNotif} alt="no notifs"/>
            <span>Không có thông báo nào luôn á... </span>
          </div>
        )}
      </div>
    );
    
  }
}

const mapStateToProps = (state) => ({
  list: state.notifications.list,
  userId: state.auth.user.id
});

export default connect(mapStateToProps, {getNotifs, newNotif})(NotificationsPanel);