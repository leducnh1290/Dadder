import React, {Component} from 'react';
import classnames from 'classnames';

class Notification extends Component {
  state = {
    step: 'start'
  };

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
  

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        step: 'display'
      });
      setTimeout(() => {
        this.setState({
          step: 'end'
        });
        setTimeout(() => {
          this.setState({
            step: 'dead'
          });
          setTimeout(() => {
            this.props.killMe(this.props.notif.id);
          }, 1000);
        }, 1000);
      }, 5000);
    }, 100);
  }

  render() {
    const {content, type} = this.props.notif;
    const {step} = this.state;

    return (
      <div className={classnames('notification', {
        'start': step === 'start',
        'display': step === 'display',
        'end': step === 'end',
        'dead': step === 'dead'
      })}>
        <div className="notif__icon"/>
        <div className="notif__text">
          <div className="notif__type">{this.getTitle(type)}</div>
          <div className="notif__content">{content}</div>
        </div>
      </div>
    );
  }
}

export default Notification;