import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { shortenEthAddr, checkIsMobileDevice, encodeMessage, aggregateReactions } from '../utils';

import EmojiIcon from './Emoji/EmojiIcon';
import './styles/PopupWindow.scss';
import './styles/Reactions.scss';

class Reactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      time: '',
      emojiPickerIsOpen: false,
      postLoading: false,
      hintText: null,
      isMobile: checkIsMobileDevice(),
    }
    this.onHover = this.onHover.bind(this);
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
      return reactionAddr === currentUserAddrNormalized
    });
    return myReactions;
  }

  react = async (emoji) => {
    const {
      login,
      updateComments,
      loginFunction,
      ethereum,
      parentId
    } = this.props;

    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

    if (noWeb3) return;

    await login();

    try {
      console.log("react with emoji", emoji);
      const myReactions = this.getMyReactions();

      if (myReactions) {
        const reactions = aggregateReactions(myReactions);
        if (reactions[emoji]) {
          console.log("ignore because you already reacted with this emoji", emoji);
        } else {
          const message = encodeMessage("reaction", emoji, parentId);
          await this.props.thread.post(message);
        }
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

  deleteReaction = async (reaction) => {
    const { login, thread } = this.props;

    try {
      await login();
      await thread.deletePost(reaction.postId);
    } catch (error) {
      console.error('There was an error deleting one reaction', error);
    }
  }

  getAuthor = (reaction) => {
    const { profiles } = this.props;
    const profile = profiles[reaction.author];
    return profile.name || shortenEthAddr(profile.ethAddr.toLowerCase());
  }

  onHover = (items) => {
    if (items && items.length > 0) {
      let users = "";
      try {
        if (items.length === 1) {
          users = `${this.getAuthor(items[0])}`;
        } else if (items.length === 2) {
          users = `${this.getAuthor(items[0])} and ${this.getAuthor(items[1])}`;
        } else {
          users = `${this.getAuthor(items[0])}, ${this.getAuthor(items[1])} and ${items.length - 2} others`;
        }
        const emoji = items[0].message.data;
        const text = `${users} reacted with ${emoji} emoji`;
        this.setState({ hintText: text });
      } catch (error) {
        console.error("There was an error when setting hint", error);
      }
    } else {
      this.setState({ hintText: null });
    }
  }

  render() {
    const { emojiPickerIsOpen } = this.state;
    const { reactions, toggleEmojiPicker, renderEmojiPopup } = this.props;

    const myReactions = this.getMyReactions();
    let reactionsSummary = {}, myReactionsSummary = {};
    if (reactions.length > 0) {
      reactionsSummary = aggregateReactions(reactions);
    }
    if (myReactions.length > 0) {
      myReactionsSummary = aggregateReactions(myReactions);
    }

    return (
      <div className="reactions">
        {reactions.length && (
          <div className="emoji-bar" onMouseLeave={() => (this.onHover(null))}>{
            Object.keys(reactionsSummary).map(emoji => {
              const count = reactionsSummary[emoji].count;
              const items = reactionsSummary[emoji].items;
              if (myReactionsSummary[emoji]) {
                const r = myReactionsSummary[emoji].items[0];
                return <div className="emoji-item has_reacted" key={emoji} onClick={() => (this.deleteReaction(r))} onMouseEnter={() => (this.onHover(items))}>{emoji} {count}</div>;
              } else {
                return <div className="emoji-item" key={emoji} onClick={() => (this.react(emoji))} onMouseEnter={() => (this.onHover(items))}>{emoji} {count}</div>;
              }

            })
          }</div>
        )}

        <EmojiIcon
          onClick={toggleEmojiPicker}
          isActive={emojiPickerIsOpen}
          tooltip={renderEmojiPopup()}
        />

        <p className={`hint ${this.state.hintText ? 'visible' : ''}`}>
          {this.state.hintText}
        </p>
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
  login: PropTypes.func.isRequired,
  toggleEmojiPicker: PropTypes.func.isRequired,
  renderEmojiPopup: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  reactions: PropTypes.array,
  profiles: PropTypes.object,
};

Reactions.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
  reactions: [],
  profiles: {},
};
