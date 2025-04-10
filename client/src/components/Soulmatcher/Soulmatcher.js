import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import noUiSlider from 'nouislider';
import wNumb from 'wnumb';
import ReactTags from 'react-tag-autocomplete';
import axios from 'axios';
import classnames from 'classnames';

import Card from "./Card";

import {getUsers} from "../../store/actions/soulmatcherActions";
import {likeUser, dislikeUser} from "../../store/actions/profileActions";

import './soulmatcher.css';
import '../../css/nouislider.css';

class Soulmatcher extends Component {
  state = {
    users: [],
    sort: 'relevance',
    order: 'desc',
    ageMin: 18,
    ageMax: 50,
    rangeAgeMax: 50,
    distanceMin: 0,
    distanceMax: 50,
    popularityMin: 10,
    popularityMax: 200,
    rangePopMax: 200,
    interests: [],
    suggestions: []
  };

  componentWillMount() {
    axios.get('/api/interests/getAll')
      .then((res) => {
        axios.get('/api/user/getMaxPopAndAge')
          .then((res2) => {
            setTimeout(() => {
              this.setState({
                suggestions: res.data,
                rangePopMax: res2.data[0].max_pop,
                rangeAgeMax: res2.data[0].max_age
              });

              let sliderAge = document.getElementById('age');
              let sliderPopularity = document.getElementById('popularity');
              if (sliderAge && sliderAge.noUiSlider&&sliderPopularity.noUiSlider) {
                sliderAge.noUiSlider.updateOptions({
                  range: {
                    'min': [18],
                    'max': [this.state.rangeAgeMax + 1]
                  }
                });
                sliderPopularity.noUiSlider.updateOptions({
                  range: {
                    'min': [0],
                    'max': [this.state.rangePopMax + 1]
                  }
                });
              } else {
                console.error('Không thể tìm thấy sliderAge hoặc noUiSlider chưa được khởi tạo');
              }
            

            }, 1);
          });
      });
  }

  componentDidMount() {
    document.title = 'Soulmatcher';
    let sliderAge = document.getElementById('age');
    let sliderDistance = document.getElementById('distance');
    let sliderPopularity = document.getElementById('popularity');

    noUiSlider.create(sliderAge, {
      start: [18, 50],
      connect: true,
      range: {
        'min': 18,
        'max': 77
      },
      tooltips: [wNumb({decimals: 0}), wNumb({decimals: 0})],
      pips: {
        mode: 'steps',
        stepped: true,
        density: 6
      }
    });
    noUiSlider.create(sliderDistance, {
      start: [0, 50],
      connect: true,
      range: {
        'min': [0],
        '25%': [10, 1],
        '50%': [50, 5],
        '75%': [100, 50],
        'max': [500]
      },
      tooltips: [wNumb({decimals: 1}), wNumb({decimals: 1})],
      pips: {
        mode: 'range',
        stepped: true,
        density: 4
      }
    });
    noUiSlider.create(sliderPopularity, {
      start: [10, this.state.popularityMax],
      connect: true,
      range: {
        'min': 0,
        'max': 200
      },
      tooltips: [wNumb({decimals: 0}), wNumb({decimals: 0})],
      pips: {
        mode: 'steps',
        stepped: true,
        density: 5
      }
    });
    sliderAge.noUiSlider.on('update', (values, handle) => {
      this.setState({
        ageMin: parseInt(values[0], 10),
        ageMax: parseInt(values[1], 10)
      });
    });
    sliderDistance.noUiSlider.on('update', (values, handle) => {
      this.setState({
        distanceMin: parseFloat(values[0]),
        distanceMax: parseFloat(values[1])
      });
    });
    sliderPopularity.noUiSlider.on('update', (values, handle) => {
      this.setState({
        popularityMin: parseInt(values[0], 10),
        popularityMax: parseInt(values[1], 10)
      });
    });
    this.props.getUsers(this.state);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.users && Array.isArray(nextProps.users)) {
      this.setState({
        users: nextProps.users
      });
    }
  }

  handleChange = (input) => e => {
    this.setState({
      [input]: e.target.value
    });
  };

  handleDelete(i) {
    const interests = this.state.interests.slice(0);
    interests.splice(i, 1);
    this.setState({interests});
  }

  handleAdd(interest) {
    const interests = [].concat(this.state.interests, interest);
    this.setState({interests});
  }

  onLike = () => {
    if (this.state.users[0]) {
      this.props.likeUser(this.state.users[0].id);
    }
    const card = document.querySelector('div.card:last-child');
    if (!card) return;
    card.style.transform = 'translateX(200vw)';
    setTimeout(() => {
      this.removeOneUser();
    }, 500);
  };

  onDislike = () => {
    if (this.state.users[0]) {
      this.props.dislikeUser(this.state.users[0].id);
    }
    const card = document.querySelector('div.card:last-child');
    if (!card) return;
    card.style.transform = 'translateX(-200vw)';
    setTimeout(() => {
      this.removeOneUser();
    }, 500);
  };

  onGetUsers = () => {
    this.props.getUsers(this.state);
  };

  removeOneUser = () => {
    let newUsersArr = this.state.users;
    newUsersArr.splice(0, 1);
    this.setState({
      users: newUsersArr
    });
  };

  render() {
    const {users} = this.state;

    return (
      <React.Fragment>
        <div className="centered this">
          <div id="soulmatcher">
            {/* Sidebar Lọc & Sắp Xếp */}
            <div className="sidebar">
              <div className="sidebar__sort">
                <div className="sidebar__title-box">
                  <div className="sidebar__title"> Sắp xếp theo</div>
                </div>
                <select name="sort" title="sort" required onChange={this.handleChange('sort')}
                        defaultValue="pertinence">
                  <option value="" disabled> Chọn tiêu chí...</option>
                  <option value="relevance"> Mức độ hợp cạ</option>
                  <option value="age"> Tuổi tác</option>
                  <option value="distance"> Khoảng cách</option>
                  <option value="popularity"> Độ nổi tiếng</option>
                  <option value="interests"> Sở thích chung</option>
                </select>
                <select name="order" title="order" required onChange={this.handleChange('order')}
                        defaultValue="desc">
                  <option value="" disabled> Thứ tự hiển thị...</option>
                  <option value="asc">Từ bé đến lớn</option>
                  <option value="desc">Từ lớn đến bé</option>
                </select>
              </div>
              
              {/* Bộ lọc */}
              <div className="sidebar__filter">
                <div className="sidebar__title-box">
                  <div className="sidebar__title"> Lọc theo</div>
                </div>
                <div>
                  <div className="sidebar__subtitle"> Tuổi</div>
                  <div id="age" className="noUiSlider"/>
                </div>
                <div>
                  <div className="sidebar__subtitle">️ Khoảng cách</div>
                  <div id="distance" className="noUiSlider"/>
                </div>
                <div>
                  <div className="sidebar__subtitle"> Độ nổi tiếng</div>
                  <div id="popularity" className="noUiSlider"/>
                </div>
                <div>
                  <div className="sidebar__subtitle"> Sở thích</div>
                  <ReactTags tags={this.state.interests} suggestions={this.state.suggestions}
                             minQueryLength={1}
                             handleDelete={this.handleDelete.bind(this)}
                             handleAddition={this.handleAdd.bind(this)}
                             placeholder=" Nhập sở thích của bạn"
                             autofocus={false}/>
                </div>
                <button className={classnames('sidebar__button blue', {
                  'loading': this.props.loading
                })} onClick={this.onGetUsers}> Tìm kiếm</button>
              </div>
            </div>
    
            {/* Main Panel */}
            <div className="main-panel">
              <button className="dislike purple" onClick={this.onDislike}></button>
              <div className="cards">
                <div className="no-cards">
                  <h1>Hiện tại chưa có ai hợp với fen...</h1>
                  <p>Trái tim này trống vắng quá, chưa tìm thấy ai hợp vibe </p>
                </div>
                {(users && Array.isArray(users)) &&
                users.slice(0, 3).reverse().map((user, i) => (
                  <Card key={user.id} userId={user.id} distance={user.dist} removeOneUser={this.removeOneUser}/>
                ))}
              </div>
              <button className="like green" onClick={this.onLike}></button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
    
  }
}

Soulmatcher.propTypes = {
  getUsers: PropTypes.func.isRequired,
  likeUser: PropTypes.func.isRequired,
  dislikeUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  users: state.soulmatcher.users,
  loading: state.soulmatcher.loading
});

export default connect(mapStateToProps, {getUsers, likeUser, dislikeUser})(Soulmatcher);