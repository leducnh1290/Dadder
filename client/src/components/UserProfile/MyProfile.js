import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {fetchProfile} from "../../store/actions/profileActions";

import Loading from '../Loading';
import BigPicture from './BigPicture';

import './profile.css';
import './edit.css';
import {NavLink} from "react-router-dom";
import ProfileMap from './ProfileMap';

class MyProfile extends Component {
  state = {
    images: [],
    current: 0,
    bigPicture: false
  };

  componentDidMount() {
    document.title = 'Thông tin cá nhân';
    this.props.fetchProfile(this.props.me.id);
  }

  getGender = (gender) => {
    switch (gender) {
      case 'male':
        return 'Toàn chân';
      case 'female':
        return 'Nga Mi';
      default:
        return 'Quỳ Hoa BĐ';
    }
  };

  getSexuality = (sexuality) => {
    switch (sexuality) {
      case 'heterosexual':
        return 'Cây tre';
      case 'homosexual':
        return 'Cầu vồng';
      case 'bisexual':
        return 'Đa năng';
      default:
        return 'Ủa gì dạ? ';
    }
  };

  getPopularity = (popularity) => {
    const popularityLevels = {
        1: "Mới toanh",
        2: "Được biết đến",
        3: "Hot hit",
        4: "Siêu sao"
    };

    const rank = (popularity && popularity.rank) ? popularity.rank : 1;
    const score = (popularity && popularity.score) ? popularity.score : 0;

    return (
        <div className={`popularity p${rank}`}>
            {popularityLevels[rank] || "Mới toanh"}
            <div>- {score}</div>
        </div>
    );
};


  whichPhoto = (elem) => {
    for (var i = 0; (elem = elem.previousSibling); i++);
    return i;
  };

  openPicture = (e) => {
    const current = this.whichPhoto(e.target);
    this.setState({
      images: this.props.profile.photos,
      current: current,
      bigPicture: true
    });
  };

  closeBigPicture = () => {
    this.setState({
      bigPicture: false
    });
  };

  render() {
    if (!this.props.profile)
      return (<Loading/>);
    const profile = this.props.profile;
    const gender = this.getGender(profile.gender);
    const sexuality = this.getSexuality(profile.sexuality);
    const popularity = this.getPopularity(profile.popularity);
    const {r, g, b} = profile.rgb;
    const bgPhoto = {backgroundImage: `url('${profile.profile_pic}')`};
    const bgColor = {backgroundColor: `rgb(${r}, ${g}, ${b})`};

    return (
      <React.Fragment>
        <BigPicture images={this.state.images} current={this.state.current} shown={this.state.bigPicture} closeBigPicture={this.closeBigPicture}/>
        <div className="profile__top">
          <div className="profile__top-img" style={bgPhoto}/>
        </div>
        <div className="centered">
          <div className="profile__main">
            <div className="profile__side-panel" style={bgColor}>
              <div className="profile__sp-img" style={bgPhoto}>
                <div className="profile__sp-gradient"
                     style={{background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgb(${r}, ${g}, ${b}))`}}/>
              </div>
              <div className="profile__sp-content">
                <div>
                  <NavLink to="/account/profile/edit"><button>Đổi thông tin</button></NavLink>
                </div>
                <div>
                  <h1>{`${profile.firstName} ${profile.lastName}`}</h1>
                </div>
                <div>
                  <p>{profile.username}</p>
                </div>
                <div className="profile__sp-infos">
                  <div>
                    <div>Phái</div>
                    <div>{gender}</div>
                  </div>
                  <div>
                    <div>Thọ</div>
                    <div>{profile.age ? profile.age : '?'} năm</div>
                  </div>
                  <div>
                    <div>Gu</div>
                    <div>{sexuality}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="profile__right-panel">
              <div className="profile__middle-panel">
                <div className="connected">Đang onl nà</div>
                {popularity}
              </div>
              <div className="profile__center-panel">
                <div className="profile__cp-title">
                  <h4>BIO</h4>
                </div>
                <div className="profile__cp-content bio">
                  <p>{profile.bio ? profile.bio : `${profile.firstName} chưa cập nhập bio`}</p>
                </div>
                <div className="profile__cp-title">
                  <h4>Sở thích</h4>
                </div>
                <div className="profile__cp-content tags">
                  {profile.interests.map((interest, i) => (
                    <div key={i} style={bgColor}>{interest.tag}</div>
                  ))}
                </div>
                <div className="profile__cp-title">
                  <h4>Ảnh</h4>
                </div>
                <div className="profile__cp-content photos">
                  {profile.photos.map((photo, i) => (
                    <div key={i} style={{backgroundImage: `url('${photo.url}')`}}
                    onClick={this.openPicture} title="Cliquer pour agrandir"/>
                  ))}
                  {!profile.photos.length && <div className="no-photo" style={bgColor} title="Cet utilisateur n'a pas publié de photos."/>}
                </div>
                <div className="profile__cp-title">
                  <h4>Nơi cư ngụ</h4>
                </div>
                <div className="profile__cp-content map">
                <ProfileMap lat={profile.latitude} lon={profile.longitude} gender={profile.gender} name={profile.firstName} />
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

MyProfile.propTypes = {
  fetchProfile: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile.user,
  error: state.errors.profile,
  me: state.auth.user
});

export default connect(mapStateToProps, {fetchProfile})(MyProfile);