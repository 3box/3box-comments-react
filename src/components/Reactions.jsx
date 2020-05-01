import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  shortenEthAddr,
  checkIsMobileDevice,
  aggregateReactions,
  orderReactionsChronologically,
} from '../utils';

import '../css/PopupWindow.css';
import '../css/Reactions.css';

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
    const { login, hasAuthed, handleLoadingState } = this.props;

    handleLoadingState();

    try {
      if (!hasAuthed) await login();
      await this.props.thread.deletePost(reaction.postId);
      handleLoadingState();
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

    let orderedReactions;
    if (reactions.length > 0) {
      reactionsSummary = aggregateReactions(reactions);
      orderedReactions = orderReactionsChronologically(reactionsSummary);
    }

    if (myReactions.length > 0) myReactionsSummary = aggregateReactions(myReactions);

    return (
      <div className="reactions">
        {reactions.length && (
          <div className="emoji-bar" onMouseLeave={() => (this.onHover(null))}>
            {
              orderedReactions.reverse().map((emoji) => {
                const count = reactionsSummary[emoji[0]].count;
                const items = reactionsSummary[emoji[0]].items;

                const hasReacted = myReactionsSummary[emoji[0]];
                const reaction = hasReacted && myReactionsSummary[emoji[0]].items[0];
                const action = hasReacted ? () => this.deleteReaction(reaction) : () => addReaction(emoji[0]);

                return (
                  <div
                    className={`emoji-item ${hasReacted ? 'has_reacted' : ''}`}
                    key={emoji[0]}
                    onClick={action}
                    onMouseEnter={() => (this.onHover(items))}
                  >
                    {emoji[0]} {count}
                  </div>
                )
              })
            }
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
  handleLoadingState: PropTypes.func.isRequired,
  hasAuthed: PropTypes.bool.isRequired,
  reactions: PropTypes.array,
  profiles: PropTypes.object,
};

Reactions.defaultProps = {
  thread: {},
  reactions: [],
  profiles: {},
};
