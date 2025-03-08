import React, {Component} from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import axios from 'axios';

class ProtectedRoute extends Component {
  render() {
    axios.post('/api/connection')
      .then(res => {})
      .catch(err => {});
    const {component, ...rest} = this.props;
    return (
      <Route {...rest} render={() => {
        if (this.props.auth.isAuthenticated) {
          return <this.props.component {...this.props}/>
        } else {
          return <Redirect to={{
            pathname: '/',
            state: {
              from: this.props.location
            }
          }}/>
        }
      }}/>
    );
  }
}

ProtectedRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, null)(ProtectedRoute);