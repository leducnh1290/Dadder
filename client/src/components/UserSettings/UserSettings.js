import React, { Component } from 'react';
import classnames from 'classnames';

import Panels from './Panels';
import Response from './Response';

import './settings.css';

class UserSettings extends Component {
  state = {
    step: 0
  };

  componentDidMount() {
    document.title = 'Cài đặt tài khoản';
  }

  render() {
    const { step } = this.state;

    return (
      <React.Fragment>
        <div className="settings__top-bar">
          <div className="settings__top-bar_links">
            <div className={classnames('settings__top-bar_link', {
              'active': step === 0
            })} onClick={() => this.setState({ step: 0 })}>
              Tài khoản của tui
            </div>
            <div className={classnames('settings__top-bar_link', {
              'active': step === 1
            })} onClick={() => this.setState({ step: 1 })}>
              Thông báo nè 
            </div>
            <div className={classnames('settings__top-bar_link', {
              'active': step === 2
            })} onClick={() => this.setState({ step: 2 })}>
              Bảo mật nè 

            </div>
          </div>
        </div>
        <div className="centered">
          <div className="settings__container">
            <div className="settings__panel">
              <Panels step={step} />
              <Response />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default UserSettings;