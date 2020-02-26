import React, { Component } from 'react';
import ProfileHover from 'profile-hover';
import PropTypes from 'prop-types';
import Linkify from 'react-linkify';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';

import {
  timeSince,
  shortenEthAddr,
  filterComments,
  REPLIABLE_COMMENT_LEVEL_MAX,
  encodeMessage,
  aggregateReactions,
} from '../utils';

import EmojiIcon from './Emoji/EmojiIcon';
import EmojiPicker from './Emoji/EmojiPicker';
import PopupWindow from './Emoji/PopupWindow';
import ArrowUp from '../assets/ArrowUp.svg';
import ArrowDown from '../assets/ArrowDown.svg';
import Delete from '../assets/Delete.svg';
import Reply from '../assets/Reply.svg';
import Dots from '../assets/Dots.svg';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import Input from './Input';
import Vote from './Vote';
import Reactions from './Reactions';
import '../css/Comment.css';
import '../css/Vote.css';

class Comment extends Component {
  constructor(props) {
    super(props);
    const { ethereum, loginFunction } = this.props;
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

    this.state = {
      loadingDelete: false,
      showControlsOnMobile: false,
      emojiPickerIsOpen: false,
      emojiFilter: '',
      noWeb3,
    };
    this.upvote = () => { this.vote(1); }
    this.downvote = () => { this.vote(-1); }
  }

  async componentDidMount() {
    this.emojiPickerButton = document.querySelector('#sc-emoji-picker-button');
  }

  vote = async (direction) => {
    const {
      updateComments,
      login,
      comment,
      thread,
    } = this.props;
    const { disableVote, noWeb3 } = this.state;

    if (noWeb3 || disableVote) return;

    await login();

    try {
      const myVote = this.getMyVote();
      if (myVote) {
        if (myVote.message.data === direction) {
          // undo vote
          await thread.deletePost(myVote.postId);
        } else {
          // re-vote
          await thread.deletePost(myVote.postId);
          const message = encodeMessage("vote", direction, comment.postId);
          await thread.post(message);
        }
      } else {
        const message = encodeMessage("vote", direction, comment.postId);
        await thread.post(message);
      }

      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your vote', error);
    }
  }

  deleteComment = async (commentId, e) => {
    e.preventDefault();
    const {
      login,
      hasAuthed,
      thread,
    } = this.props;

    if (!hasAuthed) {
      this.setState({ loadingDelete: true });
      await login();
    }

    try {
      this.setState({ loadingDelete: false });
      await thread.deletePost(commentId);
    } catch (error) {
      console.error('There was an error deleting your comment', error);
    }
  }

  getMyVote = () => {
    const {
      currentUserAddr,
      profiles,
      comment
    } = this.props;

    const votes = comment.children ? filterComments(comment.children, "vote") : [];

    const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
    const myVotes = votes.filter(v => {
      const profile = profiles[v.author];
      const voterAddr = profile && profile.ethAddr.toLowerCase();
      return voterAddr === currentUserAddrNormalized
    });
    return myVotes && myVotes.length > 0 ? myVotes[0] : null;
  }

  toggleEmojiPicker = (e) => {
    const { emojiPickerIsOpen } = this.state;
    e.stopPropagation();
    e.preventDefault();
    this.setState({ emojiPickerIsOpen: !emojiPickerIsOpen });
  }

  renderEmojiPopup = () => (
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

  closeEmojiPicker = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ emojiPickerIsOpen: false });
  }

  _handleEmojiPicked = (emoji) => {
    this.addReaction(emoji);
    this.setState({ emojiPickerIsOpen: false });
  }

  handleEmojiFilterChange = (event) => {
    const emojiFilter = event.target.value;
    this.setState({ emojiFilter });
  }

  addReaction = async (emoji) => {
    const {
      login,
      updateComments,
      comment,
    } = this.props;
    const { noWeb3 } = this.state;

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
          const message = encodeMessage("reaction", emoji, comment.postId);
          await this.props.thread.post(message);
          this.setState({})
        }
      } else {
        const message = encodeMessage("reaction", emoji, comment.postId);
        await this.props.thread.post(message);
      }

      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your reaction', error);
    }
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

  handleShowControlsOnMobile = () => {
    const { showControlsOnMobile } = this.state;
    this.setState({ showControlsOnMobile: !showControlsOnMobile })
  }

  render() {
    const {
      loadingDelete,
      emojiPickerIsOpen,
      showControlsOnMobile,
    } = this.state;

    const {
      comment,
      profile,
      isMyComment,
      useHovers,
      isMyAdmin,
      isCommenterAdmin,
      thread,
      currentUserAddr,
      currentUser3BoxProfile,
      ethereum,
      isLoading3Box,
      updateComments,
      adminEthAddr,
      box,
      loginFunction,
      login,
      profiles,
      hasAuthed,
      votes,
      reactions,
      isNestedComment,
      showReply,
      toggleReplyInput,
    } = this.props;

    const profilePicture = profile.ethAddr &&
      (profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
        : makeBlockie(profile.ethAddr));
    const canDelete = isMyComment || isMyAdmin;

    let voted = 0;
    const myVote = this.getMyVote();
    if (myVote) voted = myVote.message.data;

    const count = votes.reduce((sum, v) => (sum + v.message.data), 0);
    const isDeletedComment = comment.message.category === 'deleted';

    return (
      <div className={`comment ${canDelete ? 'isMyComment' : ''} ${isDeletedComment ? 'isDeletedComment' : ''}`}>

        {!isDeletedComment ? (
          <>
            <div
              className="comment_wrapper"
            >
              <a
                href={profile.profileURL ? `${profile.profileURL}` : `https://3box.io/${profile.ethAddr}`}
                target={profile.profileURL ? '_self' : '_blank'}
                rel={profile.profileURL ? 'dofollow' : 'noopener noreferrer'}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="profile"
                    className={`comment_picture comment_picture-bgWhite ${isNestedComment ? 'nestedComment' : 'originalComment'}`}
                  />
                ) : <div className={`comment_picture ${isNestedComment ? 'nestedComment' : 'originalComment'}`} />}
              </a>

              <div className="comment_content">
                <div className="comment_content_context">
                  <div className="comment_content_context_main">
                    <a
                      href={profile.profileURL ? profile.profileURL : `https://3box.io/${profile.ethAddr}`}
                      className="comment_content_context_main_user"
                      target={profile.profileURL ? '_self' : '_blank'}
                      rel={profile.profileURL ? 'dofollow' : 'noopener noreferrer'}
                    >
                      <div className="comment_content_context_main_user_info">
                        {useHovers ? (
                          <ProfileHover
                            address={profile && profile.ethAddr}
                            orientation="right"
                            noTheme
                          >
                            <div className="comment_content_context_main_user_info_username">
                              {profile.name || shortenEthAddr(profile.ethAddr)}
                            </div>
                          </ProfileHover>
                        ) : (
                            <div className="comment_content_context_main_user_info_username">
                              {profile.name || shortenEthAddr(profile.ethAddr)}
                            </div>
                          )}

                        {profile.name && (
                          <div
                            className="comment_content_context_main_user_info_address"
                            title={profile.ethAddr}
                          >
                            {profile.ethAddr && `${shortenEthAddr(profile.ethAddr)} ${isCommenterAdmin ? 'ADMIN' : ''}`}
                          </div>
                        )}
                      </div>

                      {loadingDelete && <SVG className="comment_loading" src={Loading} alt="Loading" />}

                      {/* hasThread */}
                      {(!loadingDelete && profile.ethAddr) && (
                        <div className="comment_content_context_main_user_delete">
                          <button
                            onClick={(e) => this.deleteComment(comment.postId, e)}
                            className="comment_content_context_main_user_delete_button"
                          >
                            <SVG src={Delete} alt="Delete" className="comment_content_context_main_user_delete_button_icon" />
                          </button>
                        </div>
                      )}
                    </a>
                  </div>

                  <div className="comment_content_context_time">
                    {`${timeSince(comment.timestamp * 1000)} ago`}
                  </div>
                </div>

                <div className="comment_content_text">
                  <Linkify>
                    {comment.message.data}
                  </Linkify>
                </div>

                {(count !== 0 || !!reactions.length) && (
                  <div className={`comment_reactions ${isNestedComment ? 'nestedComment' : ''}`}>
                    {count !== 0 && (
                      <Vote
                        currentUserAddr={currentUserAddr}
                        currentUser3BoxProfile={currentUser3BoxProfile}
                        thread={thread}
                        ethereum={ethereum}
                        adminEthAddr={adminEthAddr}
                        box={box}
                        loginFunction={loginFunction}
                        isLoading3Box={isLoading3Box}
                        login={login}
                        updateComments={updateComments}
                        parentId={comment.postId}
                        votes={votes}
                        profiles={profiles}
                        voted={voted}
                        count={count}
                        getMyVote={this.getMyVote}
                        upvote={this.upvote}
                        downvote={this.downvote}
                      />
                    )}

                    {!!reactions.length && (
                      <Reactions
                        currentUserAddr={currentUserAddr}
                        currentUser3BoxProfile={currentUser3BoxProfile}
                        thread={thread}
                        ethereum={ethereum}
                        adminEthAddr={adminEthAddr}
                        box={box}
                        loginFunction={loginFunction}
                        isLoading3Box={isLoading3Box}
                        login={login}
                        updateComments={updateComments}
                        parentId={comment.postId}
                        reactions={reactions}
                        profiles={profiles}
                        toggleEmojiPicker={this.toggleEmojiPicker}
                        renderEmojiPopup={this.renderEmojiPopup}
                        addReaction={this.addReaction}
                        getMyReactions={this.getMyReactions}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {(!loadingDelete && comment.message.nestLevel < REPLIABLE_COMMENT_LEVEL_MAX && showReply === comment.postId) && (
              <Input
                currentUserAddr={currentUserAddr}
                currentUser3BoxProfile={currentUser3BoxProfile}
                thread={thread}
                ethereum={ethereum}
                adminEthAddr={adminEthAddr}
                box={box}
                loginFunction={loginFunction}
                isLoading3Box={isLoading3Box}
                login={login}
                hasAuthed={hasAuthed}
                updateComments={updateComments}
                showReply={showReply}
                toggleReplyInput={toggleReplyInput}
                currentNestLevel={comment.message.nestLevel + 1}
                grandParentId={comment.message.parentId}
                parentId={comment.postId}
                onSubmit={() => { this.setState({ showReply: false }) }}
                isNestedInput
              />
            )}

            <div className={`comment_control ${emojiPickerIsOpen ? 'show' : ''} ${showControlsOnMobile ? 'showOnMobile' : ''}`}>
              {
                count === 0 && (
                  <>
                    <button className="vote_btn" onClick={this.upvote}>
                      <SVG
                        src={ArrowUp}
                        alt="Upvote"
                        className="vote_icon upvote"
                      />
                    </button>

                    <button className="vote_btn vote_btn-middle" onClick={this.downvote}>
                      <SVG
                        src={ArrowDown}
                        alt="Downvote"
                        className="vote_icon downvote"
                      />
                    </button>
                  </>
                )}

              <EmojiIcon
                onClick={this.toggleEmojiPicker}
                isActive={emojiPickerIsOpen}
                tooltip={this.renderEmojiPopup()}
                isInlinePicker
              />

              {comment.message.nestLevel < REPLIABLE_COMMENT_LEVEL_MAX && (
                <button
                  onClick={() => toggleReplyInput(comment.postId)}
                  className="comment_content_context_main_user_reply_button"
                >
                  <SVG src={Reply} alt="Reply" className="comment_content_context_main_user_reply_button_icon" />
                  Reply
                </button>
              )}
            </div>

            <div className="comment_control_mobile" onClick={this.handleShowControlsOnMobile}>
              <SVG src={Dots} alt="options" className="comment_control_mobile_icon" />
            </div>
          </>
        ) : <p>This comment was deleted</p>}
      </div>
    );
  }
}

export default Comment;

Comment.propTypes = {
  thread: PropTypes.object,
  isMyAdmin: PropTypes.bool.isRequired,
  isCommenterAdmin: PropTypes.bool.isRequired,
  useHovers: PropTypes.bool.isRequired,
  isMyComment: PropTypes.bool.isRequired,
  hasAuthed: PropTypes.bool.isRequired,
  comment: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  box: PropTypes.object,
  loginFunction: PropTypes.func,
  currentUserAddr: PropTypes.string,
  adminEthAddr: PropTypes.string,
  showReply: PropTypes.string,
  currentUser3BoxProfile: PropTypes.object,
  ethereum: PropTypes.object,
  isLoading3Box: PropTypes.bool,
  isNestedComment: PropTypes.bool,
  updateComments: PropTypes.func.isRequired,
  toggleReplyInput: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  profiles: PropTypes.object,
  votes: PropTypes.array,
  reactions: PropTypes.array,
};

Comment.defaultProps = {
  thread: {},
  votes: [],
  reactions: [],
  isNestedComment: false,
};
