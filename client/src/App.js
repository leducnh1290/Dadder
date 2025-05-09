import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import jwt_decode from 'jwt-decode';

import store from './store';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import ProManagement from './components/Admin/ProManagement';

import Root from './components/Root';
import Home from './components/Home/Home';
import Error from './components/Error';
import Profile from './components/UserProfile/Profile';
import MyProfile from './components/UserProfile/MyProfile';
import DisableAllCSS from './components/Admin/DisableAllCSS';
import EditProfile from './components/UserProfile/EditProfile';
import Soulmatcher from './components/Soulmatcher/Soulmatcher';
import banPage from './components/bandPage'; 
import Search from './components/Search/Search';
import Settings from './components/UserSettings/UserSettings';

import {logoutUser, setCurrentUser} from "./store/actions/authActions";
import setAuthToken from './utils/setAuthToken';

import './css/normalize.css';
import './css/global.css';
import './css/error.css';

if (localStorage.jwtToken && localStorage.jwtToken !== 'undefined') {
  setAuthToken(localStorage.jwtToken);
  const decoded = jwt_decode(localStorage.jwtToken);
  store.dispatch(setCurrentUser(decoded));
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    //TODO: Clear current profile
    window.location.href = '/';
  }
}

const AdminPage = () => (
  <AdminLayout>
    <AdminDashboard />
  </AdminLayout>
);

const AdminUsersPage = () => (
  <AdminLayout>
    <UserManagement />
  </AdminLayout>
);

const AdminProPage = () => (
  <AdminLayout>
    <ProManagement />
  </AdminLayout>
);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
        <DisableAllCSS />
          <Root>
            <Switch>
              <Route path={'/'} exact component={Home}/>
              <ProtectedRoute path={'/soulmatcher'} exact component={Soulmatcher}/>
              <ProtectedRoute path={'/admin'} exact component={AdminPage}/>
              <ProtectedRoute path={'/admin/users'} exact component={AdminUsersPage}/>
              <ProtectedRoute path={'/admin/pro'} exact component={AdminProPage}/>
              <Route path="/ban" component={banPage} />  {/* Trang Ban */}
              <ProtectedRoute path={'/search'} exact component={Search}/>
              <Route path={'/profile/:username'} exact component={Profile}/>
              
              <ProtectedRoute path={'/account/profile'} exact component={MyProfile}/>
              <ProtectedRoute path={'/account/profile/edit'} exact component={EditProfile}/>
              <ProtectedRoute path={'/account/settings'} exact component={Settings}/>
              <Route component={Error}/>
            </Switch>
          </Root>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App;