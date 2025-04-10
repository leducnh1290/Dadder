import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';
import axios from "axios";
import getAverageColor from "get-average-color";

import {likeUser, dislikeUser} from "../../store/actions/profileActions";

import './card.css';

let unmounted = false;

class Card extends Component {
  state = {
    id: '',
    username: '...',
    firstName: '...',
    lastName: '...',
    age: '...',
    gender: '...',
    sexuality: '...',
    bio: '...',
    profile_pic: '',
    rgb: {},
    photos: [],
    popularity: '...',
    latitude: '',
    longitude: '',
    interests: [],
    like: '',
    distance: '...'
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
               distance: new Intl.NumberFormat('vi-VN').format(this.props.distance / 1000) + ' km'
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

  timeout;
  dx;
  dy;

  onDrag = (e) => {
    e.persist();
    if (!!e.button) {
      return;
    }
    const div = document.querySelector('.card.u' + this.props.userId);
    if (!div) {
      return;
    }
    let Ox, Oy;
    document.onmousemove = (event) => {
      Ox = event.pageX;
      Oy = event.pageY;
    };
    div.style.transition = 'box-shadow 0.4s, background-color 1s';
    this.timeout = setInterval(() => {
      this.dx = Ox - e.pageX;
      this.dy = Oy - e.pageY;
      const {r, g, b} = this.state.rgb;
      div.style.transform = `translate(${this.dx}px, ${this.dy}px)`;
      if (this.dx < -150) {
        div.style.transition = 'box-shadow 0.4s, background-color 1s';
        div.classList.add('disliking');
        div.style.boxShadow = `0 10px 40px -8px rgba(0, 0, 0, 0.3), 0 0 0 0.4rem rgb(${r}, ${g}, ${b}) inset,
        0 0 0 0.8rem white inset`;
        let card = document.querySelector(`.card.u${this.props.userId} .after`);
        if (card) {
          card.style.background = `linear-gradient(to top right,
          rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))`;
        }
      } else if (this.dx > 150) {
        div.style.transition = 'box-shadow 0.4s, background-color 1s';
        div.classList.add('liking');
        div.style.boxShadow = `0 10px 40px -8px rgba(0, 0, 0, 0.3), 0 0 0 0.4rem rgb(${r}, ${g}, ${b}) inset,
        0 0 0 0.8rem white inset`;
        let card = document.querySelector(`.card.u${this.props.userId} .after`);
        if (card) {
          card.style.background = `linear-gradient(to top left,
          rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}), rgb(${r}, ${g}, ${b}), rgba(0, 0, 0, 0), rgba(0, 0, 0, 0))`;
        }
      } else {
        div.style.transition = 'background-color 1s';
        div.classList.remove('disliking', 'liking');
        div.style.boxShadow = '0 10px 40px -8px rgba(0, 0, 0, 0.3)';
      }
    }, 10);
  };

  onDrop = (e) => {
    e.persist();
    const div = document.querySelector('.card.u' + this.props.userId);
    div.style.transition = 'box-shadow 0.4s, transform 1s, background-color 1s';
    if (this.dx < -150) {
      this.props.dislikeUser(this.state.id);
      div.style.transform = 'translateX(-200vw)';
      setTimeout(() => {
        this.props.removeOneUser();
      }, 500);
    } else if (this.dx > 150) {
      this.props.likeUser(this.state.id);
      div.style.transform = 'translateX(200vw)';
      setTimeout(() => {
        this.props.removeOneUser();
      }, 500);
    } else {
      div.style.transform = '';
      div.style.boxShadow = '';
    }
    clearInterval(this.timeout);
  };

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
  render() {
    const {profile_pic, firstName, lastName, username, gender, age, sexuality, photos, interests, distance} = this.state;
    const {r, g, b} = this.state.rgb;
    const genre = this.getGender(gender);
    const sexualite = this.getSexuality(sexuality);
    const bg = {backgroundColor: `rgb(${r}, ${g}, ${b})`};

    return (
      <div className={'card u' + this.props.userId} onMouseDown={this.onDrag} onMouseUp={this.onDrop} style={bg}>
        <div className="after"/>
        <div className="card__content">
          <div className="card__profile-pic" style={{backgroundImage: `url("${profile_pic}")`}}/>
          <div className="card__name">
            {firstName + ' ' + lastName}
          </div>
          <div className="card__username">
            {username}
          </div>
          <div className="card__infos">
            <div>
              <div>Cách khoảng</div>
              <div>{distance}</div>
            </div>
            <div>
              <div>Phái</div>
              <div>{genre}</div>
            </div>
            <div>
              <div>Thọ</div>
              <div>{age}</div>
            </div>
            <div>
              <div>Gu</div>
              <div>{sexualite}</div>
            </div>
          </div>
          <div className="card__photos">
            {photos.map((photo, i) => (
              <div key={i} style={{backgroundImage: `url('${photo.url}')`}} onClick={this.photoAction}/>
            ))}
            <div className="empty"/>
          </div>
          <div className="card__tags">
            {interests.map((interest, i) => (
              <div key={i} style={{color: `rgb(${r}, ${g}, ${b})`}}>{interest.tag}</div>
            ))}
          </div>
          <div className="card__more">
            <NavLink to={'/profile/' + username}>Ghé thăm profile của {firstName} nà</NavLink>
          </div>
        </div>
      </div>
    );
  }
}

Card.propTypes = {
  likeUser: PropTypes.func.isRequired
};

export default connect(null, {likeUser, dislikeUser})(Card);