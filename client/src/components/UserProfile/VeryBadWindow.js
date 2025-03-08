import React, { Component } from 'react';
import classnames from 'classnames';

import './verybadwindow.css';
import axios from 'axios';

import reportImg from '../../assets/img/vbw-report.svg';
import reportedImg from '../../assets/img/vbw-reported.svg';
import blockImg from '../../assets/img/vbw-block.svg';
import blockedImg from '../../assets/img/vbw-blocked.svg';

class VeryBadWindow extends Component {
  state = {
    step: '',
    opened: false
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      step: nextProps.step,
      opened: nextProps.step !== '',
      isBlocked: this.state.isBlocked === undefined ? nextProps.isBlocked : this.state.isBlocked
    });
  }

  getContent = () => {
    const { isBlocked } = this.state;
    switch (this.state.step) {
      case 'report':
        return (
          <div className="vbw__popup">
            <div className="vbw__title-bar">
              <div className="vbw__close" onClick={this.closePopup} />
              <h1>Báo cáo hả?</h1>
            </div>
            <div className="vbw__main">
              <img className="vbw__main-img" src={reportImg} alt="Báo cáo hoặc chặn" />
              <div className="vbw__main-txt">
                Bạn chắc kèo muốn báo cáo người này không?
              </div>

              <button className="blue vbw__main-button" onClick={this.onReport}>Rì pót luôn sợ đếch</button>
            </div>
          </div>
        );
      case 'block':
        return (
          <div className="vbw__popup">
            <div className="vbw__title-bar">
              <div className="vbw__close" onClick={this.closePopup} />
              <h1>{isBlocked ? 'Débloquer ?' : 'Bloquer ?'}</h1>
            </div>
            <div className="vbw__main">
              <img className="vbw__main-img" src={blockImg} alt="report or block" />
              <div className="vbw__main-txt">
                {isBlocked ? 'Muốn mở khóa người này hả?' : 'Chắc kèo muốn chặn người ta luôn không?'}
              </div>
              <button className="blue vbw__main-button" onClick={this.onBlock}>{isBlocked ? 'Mở' : 'Chặn'}</button>
            </div>
          </div>
        );
      case 'report-success':
        return (
          <div className="vbw__popup">
            <div className="vbw__title-bar">
              <div className="vbw__close" onClick={this.closePopup} />
              <h1>Đã báo cáo.</h1>
            </div>
            <div className="vbw__main">
              <img className="vbw__main-img" src={reportedImg} alt="report or block" />
              <div className="vbw__main-txt">
                Bạn đã báo cáo người này thành công.{isBlocked ? '' : ' Muốn chặn luôn không nè?'}
              </div>

              {!isBlocked && (<button className="blue vbw__main-button" onClick={this.onBlock}>Luôn</button>)}
            </div>
          </div>
        );
      case 'block-success':
        return (
          <div className="vbw__popup">
            <div className="vbw__title-bar">
              <div className="vbw__close" onClick={this.closePopup} />
              <h1>{!isBlocked ? 'Đã mở chặn.' : 'Đã chặn.'}</h1>

            </div>
            <div className="vbw__main">
              <img className="vbw__main-img" src={blockedImg} alt="report or block" />
              <div className="vbw__main-txt">
              {!isBlocked ? 'Bạn đã mở chặn người dùng này rồi nè.' : 'Bạn đã chặn người dùng này rồi nha.'}

              </div>
            </div>
          </div>
        );
      default:
        return (<div />);
    }
  };

  onReport = () => {
    axios.post('/api/report', { reported: this.props.userId })
      .then(() => {
        this.setState({
          step: 'report-success'
        });
      })
      .catch(() => {
        this.setState({
          step: 'report-success'
        });
      });
  };

  onBlock = () => {
    axios.post('/api/block', { blocked: this.props.userId })
      .then(() => {
        this.setState({
          step: 'block-success',
          isBlocked: !this.state.isBlocked
        });
      })
      .catch(err => { });
  };

  closePopup = () => {
    this.setState({
      step: '',
      opened: false
    });
    this.props.closeParent();
  };

  render() {
    const content = this.getContent();

    return (
      <div className={classnames('very-bad-window', {
        'opened': this.state.opened
      })}>
        <div className="vbw__overlay" onClick={this.closePopup} />
        {content}
      </div>
    );
  }
}

export default VeryBadWindow;