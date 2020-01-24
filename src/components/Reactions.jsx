import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { shortenEthAddr, checkIsMobileDevice, aggregateReactions } from '../utils';

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
    const {
      reactions,
      toggleEmojiPicker,
      renderEmojiPopup,
      addReaction,
      getMyReactions,
    } = this.props;

    const myReactions = getMyReactions();
    let reactionsSummary = {}, myReactionsSummary = {};

    if (reactions.length > 0) reactionsSummary = aggregateReactions(reactions);
    if (myReactions.length > 0) myReactionsSummary = aggregateReactions(myReactions);

    return (
      <div className="reactions">
        {reactions.length && (
          <div className="emoji-bar" onMouseLeave={() => (this.onHover(null))}>{
            Object.keys(reactionsSummary).map((emoji, i) => {
              const count = reactionsSummary[emoji].count;
              const items = reactionsSummary[emoji].items;

              const hasReacted = myReactionsSummary[emoji];
              const reaction = hasReacted && myReactionsSummary[emoji].items[0];
              const action = hasReacted ? () => this.deleteReaction(reaction) : () => addReaction(emoji);
              const isFirst = i === 0;

              return (
                <div
                  className={`emoji-item ${hasReacted ? 'has_reacted' : ''} ${isFirst ? 'isFirst' : ''}`}
                  key={emoji}
                  onClick={action}
                  onMouseEnter={() => (this.onHover(items))}
                >
                  {emoji} {count}
                </div>
              )
            })
          }
            <EmojiIcon
              onClick={toggleEmojiPicker}
              isActive={emojiPickerIsOpen}
              tooltip={renderEmojiPopup()}
              isInlinePicker
            />
          </div>
        )}

        <p className={`hint ${this.state.hintText ? 'visible' : ''}`}>
          {this.state.hintText}
        </p>
      </div>
    );
  }
}

export default Reactions;

Reactions.propTypes = {
  thread: PropTypes.object,
  login: PropTypes.func.isRequired,
  toggleEmojiPicker: PropTypes.func.isRequired,
  renderEmojiPopup: PropTypes.func.isRequired,
  addReaction: PropTypes.func.isRequired,
  getMyReactions: PropTypes.func.isRequired,
  reactions: PropTypes.array,
  profiles: PropTypes.object,
};

Reactions.defaultProps = {
  thread: {},
  reactions: [],
  profiles: {},
};
