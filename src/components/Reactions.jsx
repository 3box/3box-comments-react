import React, { Component } from 'react';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import { shortenEthAddr, checkIsMobileDevice, encodeMessage } from '../utils';

import EmojiIcon from './Emoji/EmojiIcon';
import PopupWindow from './Emoji/PopupWindow';
import EmojiPicker from './Emoji/EmojiPicker';
import './styles/PopupWindow.scss';
import './styles/Reactions.scss';

class Reactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      comment: '',
      time: '',
      disableReaction: true,
      emojiPickerIsOpen: false,
      postLoading: false,
      isMobile: checkIsMobileDevice(),
    }
  }

  async componentDidMount() {
    this.emojiPickerButton = document.querySelector('#sc-emoji-picker-button');
    this.setState({ disableReaction: false });
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
    this.react(emoji);
    this.setState({ emojiPickerIsOpen: false });
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


  handleLoggedInAs = () => {
    const { showLoggedInAs } = this.state;
    this.setState({ showLoggedInAs: !showLoggedInAs });
  }

  getMyReactions = () => {
    const {
      currentUserAddr,
      reactions,
      profiles
    } = this.props;

    const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
    const myReactions = reactions.filter(r => {
      const profile = profiles[r.author];
      const reactionAddr = profile && profile.ethAddr.toLowerCase();
      console.log("my reactions", reactionAddr, currentUserAddrNormalized);
      return reactionAddr === currentUserAddrNormalized
    });
    return myReactions;
  }

  react = async (emoji) => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum,
      parentId
    } = this.props;

    const { comment, disableReaction, isMobile } = this.state;
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

    if (noWeb3) return;
    if (disableReaction) return;

    if (!box || !Object.keys(box).length) loginFunction ? await loginFunction() : await openBox();

    if (!Object.keys(thread).length) await joinThread();


    try {
      const myReactions = this.getMyReactions();
      if (myReactions) {
        // if (myVote.message.data === direction) {
        //   console.log("unvote", direction);
        //   await this.props.thread.deletePost(myVote.postId);
        // } else {
        //   console.log("revote")
        //   await this.props.thread.deletePost(myVote.postId);
        //   const message = encodeMessage("vote", direction, parentId);
        //   await this.props.thread.post(message);
        // }
      } else {
        const message = encodeMessage("reaction", emoji, parentId);
        await this.props.thread.post(message);
      }
      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your reaction', error);
    }
  }

  render() {
    const {
      comment,
      postLoading,
      showLoggedInAs,
      isMobile,
      emojiPickerIsOpen
    } = this.state;

    const {
      currentUser3BoxProfile,
      currentUserAddr,
      box,
      ethereum,
      loginFunction,
      openBox,
      isLoading3Box,
      reactions
    } = this.props;

    const myReactions = this.getMyReactions();

    return (
      <div className="reactions">
        <EmojiIcon
          onClick={this.toggleEmojiPicker}
          isActive={emojiPickerIsOpen}
          tooltip={this._renderEmojiPopup()}
        />
      </div>
    );
  }
}

export default Reactions;

Reactions.propTypes = {
  box: PropTypes.object,
  thread: PropTypes.object,
  ethereum: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  currentUserAddr: PropTypes.string,
  loginFunction: PropTypes.func,
  isLoading3Box: PropTypes.bool,

  updateComments: PropTypes.func.isRequired,
  openBox: PropTypes.func.isRequired,
  joinThread: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  reactions: PropTypes.array,
  profiles: PropTypes.array,
};

Reactions.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
  reactions: [],
  profiles: [],
};
