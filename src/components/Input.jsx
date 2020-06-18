import React, { Component } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import { shortenEthAddr, checkIsMobileDevice, encodeMessage } from '../utils';

import EmojiIcon from './Emoji/EmojiIcon';
import PopupWindow from './Emoji/PopupWindow';
import EmojiPicker from './Emoji/EmojiPicker';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import Logo from '../assets/3BoxLogo.svg';
import Profile from '../assets/Profile.svg';
import '../css/Input.css';
import '../css/PopupWindow.css';

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      comment: '',
      time: '',
      emojiFilter: '',
      disableComment: true,
      postLoading: false,
      emojiPickerIsOpen: false,
      isMobile: checkIsMobileDevice()
    }
    this.inputRef = React.createRef();
  }

  async componentDidMount() {
    const el = this.inputRef.current;
    el.addEventListener("keydown", this.searchEnter, false);
    this.emojiPickerButton = document.querySelector('#sc-emoji-picker-button');

    this.setState({ disableComment: false });

    document.addEventListener('input', (event) => {
      if (event.target.tagName.toLowerCase() !== 'textarea') return;
      this.autoExpand(event.target);
    }, false);
  }

  autoExpand = (field) => {
    var height = field.scrollHeight;
    field.style.height = (height - 2) + 'px';
  };

  componentWillUnmount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.removeEventListener("keydown", this.searchEnter, false);
  }

  handleCommentText = (event) => {
    const { noWeb3 } = this.props;
    if (!noWeb3) this.setState({ comment: event.target.value });
  }

  searchEnter = (event) => {
    const { comment, isMobile } = this.state;
    const { isLoading } = this.props;
    const updatedComment = comment.replace(/(\r\n|\n|\r)/gm, "");

    if (event.keyCode === 13 && !event.shiftKey && updatedComment && !isMobile && !isLoading) {
      this.saveComment();
    } else if (event.keyCode === 13 && !event.shiftKey && !isMobile && !updatedComment) {
      event.preventDefault();
    }
  }

  handleLoggedInAs = () => {
    const { showLoggedInAs } = this.state;
    this.setState({ showLoggedInAs: !showLoggedInAs });
  }

  toggleEmojiPicker = (e) => {
    e.preventDefault();
    if (!this.state.emojiPickerIsOpen) {
      this.setState({ emojiPickerIsOpen: true });
    }
  }

  closeEmojiPicker = (e) => {
    if (this.emojiPickerButton.contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({ emojiPickerIsOpen: false });
  }

  _handleEmojiPicked = (emoji) => {
    const { comment } = this.state;
    let newComment = comment;
    const updatedComment = newComment += emoji;
    this.setState({ emojiPickerIsOpen: false, comment: updatedComment });
  }

  handleEmojiFilterChange = (event) => {
    const emojiFilter = event.target.value;
    this.setState({ emojiFilter });
  }

  _renderEmojiPopup = () => (
    <PopupWindow
      isOpen={this.state.emojiPickerIsOpen}
      onClickedOutside={this.closeEmojiPicker}
      onInputChange={this.handleEmojiFilterChange}
    >
      <EmojiPicker
        onEmojiPicked={this._handleEmojiPicked}
        filter={this.state.emojiFilter}
      />
    </PopupWindow>
  )

  saveComment = async () => {
    const {
      updateComments,
      noWeb3,
      parentId,
      grandParentId,
      onSubmit,
      login,
      isNestedInput,
      currentNestLevel,
      hasAuthed
    } = this.props;

    const { comment, disableComment, isMobile } = this.state;
    const updatedComment = comment.replace(/(\r\n|\n|\r)/gm, "");
    this.inputRef.current.blur();
    this.inputRef.current.style.height = isNestedInput ? '46px' : isMobile ? '64px' : '70px';

    if (noWeb3) return console.log('No web3');
    if (disableComment || !updatedComment) return console.log('comment is empty or disabled')

    this.setState({ postLoading: true, comment: '' });
    if (!hasAuthed) await login();

    try {
      const grandParentIdToUse = currentNestLevel === 2 && grandParentId;
      const message = encodeMessage("comment", comment, parentId, currentNestLevel, grandParentIdToUse);

      if (!this.props.thread || !Object.keys(this.props.thread).length) return console.log('Thread is empty');
      await this.props.thread.post(message);

      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your comment', error);
    }

    if (onSubmit) onSubmit();
  }

  render() {
    const {
      comment,
      postLoading,
      showLoggedInAs,
      isMobile,
      emojiPickerIsOpen,
    } = this.state;

    const {
      currentUser3BoxProfile,
      currentUserAddr,
      login,
      isLoading3Box,
      hasAuthed,
      box,
      showReply,
      toggleReplyInput,
      noWeb3
    } = this.props;

    const updatedProfilePicture = (currentUser3BoxProfile && currentUser3BoxProfile.image) ? `https://ipfs.infura.io/ipfs/${currentUser3BoxProfile.image[0].contentUrl['/']}`
      : currentUserAddr && makeBlockie(currentUserAddr);
    const isBoxEmpty = !box || !Object.keys(box).length;

    return (
      <>
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
          ) : <div />
          }

          <p className={`input_commentAs ${showLoggedInAs ? 'showLoggedInAs' : ''}`}>
            {(!noWeb3 && !currentUserAddr) ? 'You will log in upon commenting' : ''}
            {(currentUserAddr && currentUser3BoxProfile) ? `Commenting as ${currentUser3BoxProfile.name || shortenEthAddr(currentUserAddr)}` : ''}
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
          // autoFocus
          />

          <button className={`input_send ${isMobile ? 'input_send-visible' : ''}`} onClick={isBoxEmpty ? () => { } : this.saveComment}>
            <svg
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
              className="input_send_icon"
              alt="Send"
              x='0px'
              y='0px'
              width='37.393px'
              height='37.393px'
              viewBox='0 0 37.393 37.393'
              enableBackground='new 0 0 37.393 37.393'>
              <g id='Layer_2'>
                <path d='M36.511,17.594L2.371,2.932c-0.374-0.161-0.81-0.079-1.1,0.21C0.982,3.43,0.896,3.865,1.055,4.241l5.613,13.263
            L2.082,32.295c-0.115,0.372-0.004,0.777,0.285,1.038c0.188,0.169,0.427,0.258,0.67,0.258c0.132,0,0.266-0.026,0.392-0.08
            l33.079-14.078c0.368-0.157,0.607-0.519,0.608-0.919S36.879,17.752,36.511,17.594z M4.632,30.825L8.469,18.45h8.061
            c0.552,0,1-0.448,1-1s-0.448-1-1-1H8.395L3.866,5.751l29.706,12.757L4.632,30.825z' />
              </g>
            </svg>
          </button>

          {(!hasAuthed && !currentUserAddr && !isLoading3Box && !noWeb3) && (
            <button className="input_login" onClick={login}>
              Login
            </button>
          )}

          <EmojiIcon
            onClick={this.toggleEmojiPicker}
            isActive={emojiPickerIsOpen}
            tooltip={this._renderEmojiPopup()}
          />
        </div>

        {showReply && (
          <div
            className="onClickOutside"
            onClick={toggleReplyInput}
            onKeyPress={toggleReplyInput}
            role="button"
            tabIndex={0}
          />
        )}
      </>
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
  isLoading3Box: PropTypes.bool,
  noWeb3: PropTypes.bool.isRequired,
  isNestedInput: PropTypes.bool,
  showReply: PropTypes.string,
  hasAuthed: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  currentNestLevel: PropTypes.number,
  grandParentId: PropTypes.string,

  updateComments: PropTypes.func.isRequired,
  toggleReplyInput: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  onSubmit: PropTypes.func,
};

Input.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
  isNestedInput: false,
};
