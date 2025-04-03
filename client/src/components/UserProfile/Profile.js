import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import axios from "axios";

import { fetchProfile } from "../../store/actions/profileActions";
import { likeUser } from "../../store/actions/profileActions";

import Loading from "../Loading";
import Error from "../Error";
import BigPicture from "./BigPicture";
import VeryBadWindow from "./VeryBadWindow";

import "./profile.css";
import ProfileMap from "./ProfileMap";

//TODO: debug problem big picture once you got out of big picture and back in

class Profile extends Component {
  state = {
    images: [],
    current: 0,
    vbwStep: "",
    bigPicture: false,
  };

  componentDidMount() {
    document.title = "Profiles";
    this.props.fetchProfile(this.props.match.params.username);
  }

  getGender = (gender) => {
    switch (gender) {
      case "male":
        return "Toàn chân";
      case "female":
        return "Nga mi";
      case "other":
        return "Quỳ Hoa BĐ";
      default:
        return "Ủa alo?";
    }
  };

  getSexuality = (sexuality) => {
    switch (sexuality) {
      case "heterosexual":
        return "Cây tre";
      case "homosexual":
        return "Cầu vồng";
      case "bisexual":
        return "Đa năng";
      default:
        return "Ủa gì dạ? ";
    }
  };

  getPopularity = (popularity) => {
    const popularityLevels = {
      1: "Mới toanh",
      2: "Được biết đến",
      3: "Hot hit",
      4: "Siêu sao",
    };

    const rank = popularity && popularity.rank ? popularity.rank : 1;
    const score = popularity && popularity.score ? popularity.score : 0;

    return (
      <div className={`popularity p${rank}`}>
        {popularityLevels[rank] || "Mới toanh"}
        <div>- {score}</div>
      </div>
    );
  };

  likeThisUser = () => {
    this.props.likeUser(this.props.profile.id);
  };

  getLikeStatus = (like) => {
    const firstName = this.props.profile.firstName || "người này";

    switch (like) {
      case "both":
        return "Hai bạn đều thích nhau!";
      case "no":
        return "Chủ động tấn công đi nào!";
      case "me":
        return `Bạn đã thích ${firstName} rồi!`;
      case "you":
        return `${firstName} đang thích bạn đó!`;
      default:
        return "Chủ động tấn công đi nào!";
    }
  };

  getLikeButton = (like) => {
    return like === "me" || like === "both" ? "BỎ THÍCH" : "THÍCH";
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
      bigPicture: true,
    });
  };

  visitProfile = (id) => {
    axios.get(`/api/visit?visited=${id}`);
  };

  openReport = () => {
    this.setState({
      vbwStep: "report",
    });
  };

  openBlock = () => {
    this.setState({
      vbwStep: "block",
    });
  };

  closeVBW = () => {
    this.setState({
      vbwStep: "",
    });
  };

  closeBigPicture = () => {
    this.setState({
      bigPicture: false,
    });
  };

  render() {
    if (this.props.error)
      return (
        <Error
          errTitle="Hồ sơ không tồn tại."
          errText="Trang hồ sơ bạn đang tìm kiếm hình như bay màu rùi."
        />
      );
    if (!this.props.profile || !this.props.profile.rgb) return <Loading />;
    if (this.props.profile.amBlocked)
      return (
        <Error
          errTitle="Bạn đã bị chặn."
          errText="Người này đã chặn bạn rùi. Thông cảm nha!"
        />
      );

    const profile = this.props.profile;
    document.title = profile.firstName + " " + profile.lastName;
    this.visitProfile(profile.id);

    const gender = this.getGender(profile.gender);
    const sexuality = this.getSexuality(profile.sexuality);
    const popularity = this.getPopularity(profile.popularity);
    const likeStatus = this.getLikeStatus(profile.like);
    const likeButton = this.getLikeButton(profile.like);

    const { r, g, b } = profile.rgb;
    const bgPhoto = { backgroundImage: `url('${profile.profile_pic}')` };
    const bgColor = { backgroundColor: `rgb(${r}, ${g}, ${b})` };

    return (
      <React.Fragment>
        <BigPicture
          images={this.state.images}
          current={this.state.current}
          shown={this.state.bigPicture}
          closeBigPicture={this.closeBigPicture}
        />
        <div className="profile__top">
          <div className="profile__top-img" style={bgPhoto} />
        </div>
        <div className="centered">
          <div className="profile__main">
            <div className="profile__side-panel" style={bgColor}>
              <div className="profile__sp-img" style={bgPhoto}>
                <div
                  className="profile__sp-gradient"
                  style={{
                    background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0), rgb(${r}, ${g}, ${b}))`,
                  }}
                />
              </div>
              <div className="profile__sp-content">
                <div>
                  <button onClick={this.likeThisUser}>{likeButton}</button>
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
                    <div>{profile.age ? profile.age : "?"}</div>
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
                <div
                  className={classnames("like", {
                    no: profile.like === "no",
                    both: profile.like === "both",
                    you: profile.like === "you",
                    me: profile.like === "me",
                  })}
                >
                  {likeStatus}
                </div>
                <div
                  className={classnames("", {
                    connected: profile.connection.status === "online",
                    disconnected: profile.connection.status === "offline",
                  })}
                >
                  {profile.connection.message}
                </div>
                {popularity}
              </div>
              <div className="profile__center-panel">
                <div className="profile__cp-title">
                  <h4>Bio</h4>
                </div>
                <div className="profile__cp-content bio">
                  <p>
                    {profile.bio
                      ? profile.bio
                      : `${profile.firstName} chưa viết gì cả.`}
                  </p>
                </div>
                <div className="profile__cp-title">
                  <h4>SỞ THÍCH</h4>
                </div>
                <div className="profile__cp-content tags">
                  {profile.interests.map((interest, i) => (
                    <div key={i} style={bgColor}>
                      {interest.tag}
                    </div>
                  ))}
                </div>
                <div className="profile__cp-title">
                  <h4>HÌNH ẢNH</h4>
                </div>
                <div className="profile__cp-content photos">
                  {profile.photos.map((photo, i) => (
                    <div
                      key={i}
                      style={{ backgroundImage: `url('${photo.url}')` }}
                      title="Bấm để xem to"
                      onClick={this.openPicture}
                    />
                  ))}
                  {!profile.photos.length && (
                    <div
                      className="no-photo"
                      style={bgColor}
                      title="Người này chưa có ảnh nào."
                    />
                  )}
                </div>
                <div className="profile__cp-title">
                  <h4>POSITION</h4>
                </div>
                <div className="profile__cp-content map">
                <ProfileMap lat={profile.latitude} lon={profile.longitude} gender={profile.gender} name={profile.firstName} />
                </div>
                <div className="profile__cp-buttons">
                  <button
                    className="report"
                    title="Báo cáo người này"
                    onClick={this.openReport}
                  />
                  <button
                    className="block"
                    title="Chặn người này"
                    onClick={this.openBlock}
                  />
                  <VeryBadWindow
                    step={this.state.vbwStep}
                    closeParent={this.closeVBW}
                    userId={profile.id}
                    isBlocked={profile.isBlocked}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Profile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  likeUser: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile.user,
  error: state.errors.profile,
});

export default connect(mapStateToProps, { fetchProfile, likeUser })(Profile);
