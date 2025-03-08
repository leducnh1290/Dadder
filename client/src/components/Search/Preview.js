import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import axios from 'axios';
import getAverageColor from 'get-average-color';
import {NavLink} from "react-router-dom";

import {likeUser} from "../../store/actions/profileActions";

import './preview.css';

let unmounted = false;

class Preview extends Component {
  state = {
    id: '',
    username: '...',
    firstName: '...',
    lastName: '...',
    age: '...',
    gender: '...',
    sexuality: '...',
    profile_pic: '',
    rgb: {},
    distance: '...',
    like: 'no'
  };

  componentDidMount() {
    unmounted = false;
    axios.get(`/api/profile/${this.props.userId}`)
      .then(res => {
        getAverageColor(res.data.profile_pic)
          .then(rgb => {
            if (!unmounted) {
              this.setState({
                ...res.data,
                rgb: rgb,
                distance: (Math.round(this.props.distance / 100) / 10 + ' km').replace('.', ',')
              });
            }
          })
          .catch(err => {
          });
      })
      .catch(err => {
      });
  }

  componentWillUnmount() {
    unmounted = true;
  }

  componentWillReceiveProps(nextProps) {
    axios.get(`/api/profile/${nextProps.userId}`)
      .then(res => {
        getAverageColor(res.data.profile_pic)
          .then(rgb => {
            if (!unmounted) {
              this.setState({
                ...res.data,
                rgb: rgb,
                distance: (Math.round(nextProps.distance / 100) / 10 + ' km').replace('.', ',')
              });
            }
          })
          .catch(err => {
          });
      })
      .catch(err => {
      });
  }


  getGender = (gender) => {
    switch (gender) {
      case 'male':
        return 'Toàn chân';
      case 'female':
        return 'Nga mi';
      case 'other':
        return 'Quỳ Hoa BĐ';
      default:
        return 'Ủa alo?';
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
  

  onLikeUser = () => {
    this.props.likeUser(this.state.id);
    this.setState({
      like: this.state.like === 'both' || this.state.like === 'me' ? 'no' : 'me'
    });
  };

  render() {
    const {profile_pic, firstName, lastName, username, gender, age, sexuality, distance, like} = this.state;
    const {r, g, b} = this.state.rgb;
    const genre = this.getGender(gender);
    const sexualite = this.getSexuality(sexuality);
    const bg = {backgroundColor: `rgb(${r}, ${g}, ${b})`};

    return (
      <div className="preview" style={bg}>
        <NavLink to={`/profile/${username}`}>
          <div className="preview__profile-pic" style={{backgroundImage: `url("${profile_pic}")`}}/>
          <div className="preview__name">{firstName + ' ' + lastName}</div>
          <div className="preview__username">{username}</div>
        </NavLink>
        <div className="preview__infos">
  <div>
    <div>Thọ</div>
    <div>{age} năm</div>
  </div>
  <div>
    <div>Cách khoảng</div>
    <div>{distance}</div>
  </div>
  <div>
    <div>Phái</div>
    <div>{genre}</div>
  </div>
  <div>
    <div>Team</div>
    <div>{sexualite}</div>
  </div>
</div>

        <button className={classnames('preview__button pink', {
          'dislike': like === 'me' || like === 'both'
        })} onClick={this.onLikeUser}/>
      </div>
    );
  }
}

export default connect(null, {likeUser})(Preview);