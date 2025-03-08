import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {connect} from 'react-redux';

import './sidebar.css';

export class Sidebar extends Component {
  render() {
    switch (this.props.auth.isAuthenticated) {
      default:
      case false:
       return (
      <React.Fragment>
        <div id="sidebar">
          <div className="icon closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div className="links">
            <div>
              <h1>Dadder</h1>
            </div>
            <div>
              <NavLink to="/">Trang chủ</NavLink>
            </div>
          </div>
        </div>
        <div id="overlay">
        </div>
      </React.Fragment>
       );
      case true:
        return (
      <React.Fragment>
        <div id="sidebar">
          <div className="icon closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div className="links">
            <div>
              <h1>Dadder</h1>
            </div>
            <div>
              <NavLink to="/soulmatcher">Dadder Recommend</NavLink>
            </div>
            <div>
              <NavLink to="/search">Tìm kiếm đối tượng</NavLink>
            </div>
          </div>
        </div>
        <div id="overlay">
        </div>
      </React.Fragment>
        );
    }
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Sidebar);