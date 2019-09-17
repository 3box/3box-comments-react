import React, { Component } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';

import Loading from '../assets/3BoxCommentsSpinner.svg';
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
      isMobile: false
    }
    this.inputRef = React.createRef();
  }

  async componentDidMount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.addEventListener("keydown", this.searchEnter, false);

    const isMobile = checkIsMobileDevice();
    this.setState({ disableComment: false, isMobile });

    document.addEventListener('input', (event) => {
      if (event.target.tagName.toLowerCase() !== 'textarea') return;
      this.autoExpand(event.target);
    }, false);
  }

  autoExpand = (field) => {
    var height = field.scrollHeight - 12;
    field.style.height = height + 'px';
  };

  componentWillUnmount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.removeEventListener("keydown", this.searchEnter, false);
  }

  handleCommentText = (event) => this.setState({ comment: event.target.value });

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
    const { joinThread, thread, updateComments, openBox, box, loginFunction } = this.props;
    const { comment, disableComment, isMobile } = this.state;
    const updatedComment = comment.replace(/(\r\n|\n|\r)/gm, "");

    if (disableComment || !updatedComment) return;

    this.inputRef.current.blur();
    this.inputRef.current.style.height = isMobile ? '64px' : '74px';
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
    const { comment, postLoading, showLoggedInAs } = this.state;
    const { currentUserProfile, currentUserAddr, box } = this.props;
    const updatedProfilePicture = currentUserProfile.image ? `https://ipfs.infura.io/ipfs/${currentUserProfile.image[0].contentUrl['/']}`
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
            <SVG
              src={Profile}
              alt="Profile"
              className="input_user input_user-empty"
            />
          )}

        {postLoading ? (
          <SVG
            src={Loading}
            alt="Loading"
            className="input_postLoading"
          />
        ) : <div />}

        <p className={`input_commentAs ${showLoggedInAs ? 'showLoggedInAs' : ''}`}>
          {box ? `Commenting as ${currentUserProfile.name || shortenEthAddr(currentUserAddr)}` : 'You will log in upon commenting'}
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

        <button className="input_send" onClick={this.saveComment}>
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