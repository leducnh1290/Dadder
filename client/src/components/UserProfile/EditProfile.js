import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import axios from 'axios';
import ReactTags from 'react-tag-autocomplete';

import { fetchProfile } from '../../store/actions/profileActions';
import { uploadImage, changeInfos } from '../../store/actions/userActions';

import Loading from '../Loading';
import ContentEditable from './ContentEditable'

import './profile.css';
import './edit.css';

const executeGoogleMaps = () => {
  setTimeout(() => {
    if (!document.getElementById('gm-map') || !document.getElementById('gm-input')) {
      return;
    }
    var map = new window.google.maps.Map(document.getElementById('gm-map'), {
      center: { lat: 46.649085, lng: 3.065825 },
      zoom: 4,
      mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('gm-input');
    var searchBox = new window.google.maps.places.SearchBox(input);
    map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
      var places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function (marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new window.google.maps.LatLngBounds();
      places.forEach(function (place) {
        if (!place.geometry) {
          return;
        }
        var icon = {
          url: place.icon,
          size: new window.google.maps.Size(71, 71),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(17, 34),
          scaledSize: new window.google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new window.google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
          document.getElementById('gm-lat').value = place.geometry.viewport.na.l;
          document.getElementById('gm-lng').value = place.geometry.viewport.ia.l;
        } else {
          bounds.extend(place.geometry.location);
          document.getElementById('gm-lat').value = place.geometry.location.lat();
          document.getElementById('gm-lng').value = place.geometry.location.lng();
        }
      });
      map.fitBounds(bounds);
    });
  }, 1000);
};

class EditProfile extends Component {
  state = {
    suggestions: []
  };

  componentWillMount() {
    const script = document.createElement('script');
    script.id = 'google-maps';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyArQlFt5ykqFyeAts_GhwHNldoOv8XzkkM&libraries=places';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
    executeGoogleMaps();

    axios.get('/api/interests/getAll')
      .then(res => {
        this.setState({
          suggestions: res.data
        });
      })
      .catch(err => {
      });
  }

  componentDidMount() {
    document.title = 'Chỉnh sửa thông tin cá nhân';
    this.props.fetchProfile(this.props.me.id);
  }

  componentWillUnmount() {
    const script = document.getElementById('google-maps');
    document.getElementsByTagName('head')[0].removeChild(script);
    // window.google = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.profile !== this.props.profile) {
      this.setState({
        ...nextProps.profile
      });
    }
    if (this.props.submitOutcome !== nextProps.submitOutcome && nextProps.submitOutcome === true) {
      this.props.history.push('/account/profile');
      // window.location.href = '/account/profile';
    }
  }

  componentDidUpdate() {
    if (this.state.rgb) {
      const { r, g, b } = this.state.rgb;
      document.querySelectorAll('.profile__cp-content.my.tags button').forEach(tag => {
        tag.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      });
    }
  }

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



  photoAction = (e) => {
    const position = e.clientY - e.target.offsetTop + window.scrollY;
    if (position < 20) {
      axios.delete(`/api/picture/${e.target.id}`)
        .then(() => {
          this.props.fetchProfile(this.props.me.id);
        })
        .catch(err => {
        });
    } else if (position > 70) {
      axios.post(`/api/picture/profile_pic/${e.target.id}`)
        .then(() => {
          this.props.fetchProfile(this.props.me.id);
        })
        .catch(err => {
        });
    }
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleFirstName = (e) => {
    this.setState({
      firstName: e.target.value
    });
  };

  handleLastName = (e) => {
    this.setState({
      lastName: e.target.value
    });
  };

  handleBio = (e) => {
    this.setState({
      bio: e.target.value
    });
  };

  handleUsername = (e) => {
    this.setState({
      username: e.target.value
    });
  };

  handleNewPhoto = (e) => {
    if (e.target.files[0]) {
      this.props.uploadImage(e.target.files[0], this.props.me.id);
    }
  };

  handleDelete(i) {
    const interests = this.state.interests.slice(0);
    interests.splice(i, 1);
    this.setState({ interests });
  }

  handleAdd(interest) {
    const interests = [].concat(this.state.interests, interest);
    this.setState({ interests });
  }

  submitChanges = () => {
    const newLat = parseFloat(document.getElementById('gm-lat').value);
    const newLng = parseFloat(document.getElementById('gm-lng').value);
    if (newLat === 0 || newLng === 0) {
      this.props.changeInfos(this.state);
    } else {
      this.props.changeInfos({
        ...this.state,
        latitude: newLat,
        longitude: newLng
      });
    }
  };

  render() {
    if (!this.props.profile)
      return (<Loading />);
    const { profile } = this.props;
    const popularity = this.getPopularity(profile.popularity);
    const { r, g, b } = profile.rgb;
    const bgPhoto = { backgroundImage: `url('${profile.profile_pic}')` };
    const bgColor = { backgroundColor: `rgb(${r}, ${g}, ${b})` };

    return (
      <React.Fragment>
        <div className="profile__top">
          <div className="profile__top-img" style={bgPhoto} />
        </div>
        <div className="centered">
          <div className="profile__main">
            <div className="profile__side-panel" style={bgColor}>
              <div className="profile__sp-img" style={bgPhoto}>
                <div className="profile__sp-gradient"
                  style={{ background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgb(${r}, ${g}, ${b}))` }} />
              </div>
              <div className="profile__sp-content">
                <div>
                  <button onClick={this.submitChanges}>Okey Bro</button>
                </div>
                <div>
                  <h1>
                    <ContentEditable html={profile.firstName}
                      onChange={this.handleFirstName}>{profile.firstName}</ContentEditable>
                    <ContentEditable html={profile.lastName}
                      onChange={this.handleLastName}>{profile.lastName}</ContentEditable>
                  </h1>
                </div>
                <div>
                  <p><ContentEditable html={profile.username}
                    onChange={this.handleUsername}>{profile.username}</ContentEditable>&nbsp;</p>
                </div>
                <div className="profile__sp-infos">
                  <div>
                    <div>GIỚI TÍNH</div>
                    <div className="select-wrapper">
                      <select className="editable" defaultValue={profile.gender} name="gender"
                        onChange={this.handleChange}>
                        <option disabled>Chọn giới tính đi nè...</option>
                        <option value="male">Toàn chân</option>
                        <option value="female">Nga mi</option>
                        <option value="other">Quỳ hoa bảo điển</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <div>Thọ</div>
                    <div className="select-wrapper age">
                      <input type="number" className="editable age-input" name="age"
                        defaultValue={profile.age} max="99" min="18" placeholder="?"
                        onChange={this.handleChange} />
                    </div>
                  </div>
                  <div>
                    <div>Gu</div>
                    <div className="select-wrapper">
                      <select className="editable" defaultValue={profile.sexuality} name="sexuality"
                        onChange={this.handleChange}>
                        <option disabled>Gu yêu đương của bạn...</option>
<option value="heterosexual">Thẳng</option>
<option value="homosexual">Cong</option>
<option value="bisexual">Cả hai</option>
                      </select>
                    </div>
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
                  <p><ContentEditable html={profile.bio}
                    onChange={this.handleBio}>{profile.bio ? profile.bio : `${profile.firstName} n'Chưa thèm viết bio luôn!`}</ContentEditable>&nbsp;
                  </p>
                </div>
                <div className="profile__cp-title">
                  <h4>Đam mê</h4>
                </div>
                <div className="profile__cp-content my tags">
                  <ReactTags tags={this.state.interests} suggestions={this.state.suggestions}
                    minQueryLength={1}
                    handleDelete={this.handleDelete.bind(this)}
                    handleAddition={this.handleAdd.bind(this)}
                    placeholder="VD: Chơi gay, ThichlamDaddy, ThichlamBaby..."
                    autofocus={false}
                    allowNew={true} />
                </div>
                <div className="profile__cp-title">
                  <h4>Ảnh</h4>
                </div>
                <div className="profile__cp-content my photos">
                  {profile.photos.map((photo, i) => (
                    <div key={i} style={{ backgroundImage: `url('${photo.url}')` }} onClick={this.photoAction}
                      id={photo.n} />
                  ))}
                  {!profile.photos.length &&
                    <div className="no-photo" style={bgColor} title="Cet utilisateur n'a pas publié de photos." />}
                  <input ref={fileInput => this.fileInput = fileInput} type="file" hidden
                    onChange={this.handleNewPhoto} />
                  <div className={classnames('add-photo', {
                    'loading': this.props.loading
                  })} style={bgColor} onClick={() => this.fileInput.click()} />
                </div>
                <div className="profile__cp-title">
                  <h4>Nơi cư ngụ</h4>
                </div>
                <div className="profile__cp-content map">
                  <input id="gm-input" type="text" placeholder="ex: Lyon, 11 rue Féraud" />
                  <input hidden id="gm-lat" type="text" />
                  <input hidden id="gm-lng" type="text" />
                  <div id="gm-map" />
                  <div className="no-map">F5 đê</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

EditProfile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
  changeInfos: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile.user,
  error: state.errors.profile,
  me: state.auth.user,
  loading: state.user.loading,
  submitOutcome: state.user.outcome
});

export default connect(mapStateToProps, { fetchProfile, uploadImage, changeInfos })(withRouter(EditProfile));