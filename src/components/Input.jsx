import React, { Component } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import Loading from '../assets/3BoxCommentsSpinner.svg';
import Logo from '../assets/3BoxLogo.svg';
import Send from '../assets/Send.svg';
import Profile from '../assets/Profile.svg';
import './styles/Input.scss';
import { shortenEthAddr, checkIsMobileDevice } from '../utils';

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      comment: '',
      time: '',
      disableComment: true,
      postLoading: false,
      isMobile: checkIsMobileDevice()
    }
    this.inputRef = React.createRef();
  }

  async componentDidMount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.addEventListener("keydown", this.searchEnter, false);

    this.setState({ disableComment: false });

    document.addEventListener('input', (event) => {
      if (event.target.tagName.toLowerCase() !== 'textarea') return;
      this.autoExpand(event.target);
    }, false);
  }

  autoExpand = (field) => {
    var height = field.scrollHeight;
    field.style.height = height + 'px';
  };

  componentWillUnmount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.removeEventListener("keydown", this.searchEnter, false);
  }

  handleCommentText = (event) => {
    const { ethereum, loginFunction } = this.props
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;
    if (!noWeb3) this.setState({ comment: event.target.value });
  }

  searchEnter = (event) => {
    const { comment, isMobile } = this.state;
    const updatedComment = comment.replace(/(\r\n|\n|\r)/gm, "");

    if (event.keyCode === 13 && !event.shiftKey && updatedComment && !isMobile) {
      this.saveComment();
    } else if (event.keyCode === 13 && !event.shiftKey && !updatedComment && !isMobile) {
      event.preventDefault();
    }
  }

  handleLoggedInAs = () => {
    const { showLoggedInAs } = this.state;
    this.setState({ showLoggedInAs: !showLoggedInAs });
  }

  saveComment = async () => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum
    } = this.props;
    const { comment, disableComment, isMobile } = this.state;
    const updatedComment = comment.replace(/(\r\n|\n|\r)/gm, "");
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

    if (noWeb3) return;
    if (disableComment || !updatedComment) return;

    this.inputRef.current.blur();
    this.inputRef.current.style.height = (isMobile) ? '64px' : '74px';
    this.setState({ postLoading: true, comment: '' });

    if (!box || !Object.keys(box).length) loginFunction ? await loginFunction() : await openBox();

    if (!Object.keys(thread).length) await joinThread();

    try {
      await this.props.thread.post(comment);
      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your comment', error);
    }
  }

  render() {
    const { comment, postLoading, showLoggedInAs, isMobile } = this.state;
    const { currentUser3BoxProfile, currentUserAddr, box, ethereum, loginFunction } = this.props;
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;
    const updatedProfilePicture = currentUser3BoxProfile.image ? `https://ipfs.infura.io/ipfs/${currentUser3BoxProfile.image[0].contentUrl['/']}`
      : currentUserAddr && makeBlockie(currentUserAddr);

    return (
      <div className="input">
        {updatedProfilePicture ? (
          <img
            src={updatedProfilePicture}
            alt="Profile"
            className="input_user"
          />
        ) : (
            <div className="input_emptyUser">
              <SVG
                src={Profile}
                alt="Profile"
                className="input_emptyUser_icon"
              />
            </div>
          )}

        {postLoading ? (
          <div className="input_postLoading">
            <SVG
              src={Loading}
              alt="Loading"
              className="input_postLoading_spinner"
            />
            <span className="input_postLoading_text">
              <SVG src={Logo} alt="Logo" className="footer_text_image" />
            </span>
          </div>
        ) : <div />}

        <p className={`input_commentAs ${showLoggedInAs ? 'showLoggedInAs' : ''}`}>
          {((!box || !Object.keys(box).length) && !noWeb3) ? 'You will log in upon commenting' : ''}
          {(box && Object.keys(box).length > 0 && !noWeb3) ? `Commenting as ${currentUser3BoxProfile.name || shortenEthAddr(currentUserAddr)}` : ''}
          {noWeb3 ? 'Cannot comment without Web3' : ''}
        </p>

        <textarea
          type="text"
          value={comment}
          placeholder="Write a comment..."
          className={`input_form ${postLoading ? 'hidePlaceholder' : ''}`}
          onChange={this.handleCommentText}
          onFocus={this.handleLoggedInAs}
          onBlur={this.handleLoggedInAs}
          ref={this.inputRef}
        />

        <button className={`input_send ${isMobile ? 'input_send-visible' : ''}`} onClick={this.saveComment}>
          <SVG
            src={Send}
            alt="Send"
            className="input_send_icon"
          />
        </button>
      </div>
    );
  }
}

export default Input;

Input.propTypes = {
  box: PropTypes.object,
  thread: PropTypes.object,
  ethereum: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  currentUserAddr: PropTypes.string,
  loginFunction: PropTypes.func,

  updateComments: PropTypes.func.isRequired,
  openBox: PropTypes.func.isRequired,
  joinThread: PropTypes.func.isRequired,
};

Input.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
};