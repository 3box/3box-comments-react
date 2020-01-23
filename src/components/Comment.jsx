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
  REPLY_THREAD_SHOW_COMMENT_COUNT,
  encodeMessage,
} from '../utils';

import EmojiIcon from './Emoji/EmojiIcon';
import EmojiPicker from './Emoji/EmojiPicker';
import PopupWindow from './Emoji/PopupWindow';
import ArrowUp from '../assets/ArrowUp.svg';
import ArrowDown from '../assets/ArrowDown.svg';
import Delete from '../assets/Delete.svg';
import Reply from '../assets/Reply.svg';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import Input from './Input';
import Dialogue from './Dialogue';
import Vote from './Vote';
import Reactions from './Reactions';
import './styles/Comment.scss';
import './styles/Vote.scss';

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingDelete: false,
      hoverComment: false,
      hoverGallery: false,
      showReply: false,
      emojiPickerIsOpen: false,
      emojiFilter: '',
    };
    this.toggleHoverComment = this.toggleHoverComment.bind(this);
    this.toggleHoverGallery = this.toggleHoverGallery.bind(this);
    this.upvote = () => { this.vote(1); }
    this.downvote = () => { this.vote(-1); }
  }

  async componentDidMount() {
    this.emojiPickerButton = document.querySelector('#sc-emoji-picker-button');
  }

  vote = async (direction) => {
    const {
      updateComments,
      loginFunction,
      ethereum,
      login,
      comment,
      thread,
    } = this.props;

    const { disableVote } = this.state;
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

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
      loginFunction,
      openBox,
      hasAuthed,
      thread,
    } = this.props;

    if (!hasAuthed) {
      this.setState({ loadingDelete: true });
      loginFunction ? await loginFunction() : await openBox();
    }

    try {
      this.setState({ loadingDelete: false });
      await thread.deletePost(commentId);
    } catch (error) {
      console.error('There was an error deleting your comment', error);
    }
  }

  toggleReplyInput = () => {
    const { showReply } = this.state;
    this.setState({ showReply: !showReply });
  }

  toggleHoverComment(state) {
    this.setState({ hoverComment: state })
  }

  toggleHoverGallery(state) {
    this.setState({ hoverGallery: state })
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
    e.preventDefault();
    if (!this.state.emojiPickerIsOpen) {
      this.setState({ emojiPickerIsOpen: true });
    }
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

  render() {
    const {
      loadingDelete,
      showReply,
      hoverComment,
      hoverGallery,
      emojiPickerIsOpen
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
      openBox,
      profiles,
      hasAuthed,
      children_comments,
      votes,
      reactions,
    } = this.props;

    const profilePicture = profile.ethAddr &&
      (profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
        : makeBlockie(profile.ethAddr));
    const canDelete = isMyComment || isMyAdmin;

    const notHoverChildren = !children_comments || children_comments.length === 0 || !hoverGallery;
    const visibleClass = hoverComment && notHoverChildren ? "visible" : "";

    const showCommentCount = REPLY_THREAD_SHOW_COMMENT_COUNT;

    let voted = 0;
    const myVote = this.getMyVote();
    if (myVote) voted = myVote.message.data;

    const count = votes.reduce((sum, v) => (sum + v.message.data), 0);

    return (
      <div className={`comment ${canDelete ? 'isMyComment' : ''}`} onMouseOver={() => this.toggleHoverComment(true)} onMouseLeave={() => this.toggleHoverComment(false)}>
        <div className="comment_wrapper">
          <a
            href={profile.profileURL ? `${profile.profileURL}` : `https://3box.io/${profile.ethAddr}`}
            target={profile.profileURL ? '_self' : '_blank'}
            rel={profile.profileURL ? 'dofollow' : 'noopener noreferrer'}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="profile"
                className="comment_picture comment_picture-bgWhite"
              />
            ) : <div className="comment_picture" />}
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
                    <div className={`comment_content_context_main_user_delete ${visibleClass}`}>
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

            {(!loadingDelete && !!reactions.length) && (
              <div className="comment_footer">
                <div className={`comment_content_context_main_user_reactions ${visibleClass}`}>
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
                    openBox={openBox}
                    parentId={comment.postId}
                    reactions={reactions}
                    profiles={profiles}
                    toggleEmojiPicker={this.toggleEmojiPicker}
                    renderEmojiPopup={this.renderEmojiPopup}
                  />
                </div>

                {comment.level < REPLIABLE_COMMENT_LEVEL_MAX && (
                  <div className={`comment_content_context_main_user_reply ${visibleClass}`}>
                    <button
                      onClick={(e) => this.toggleReplyInput(e)}
                      className="comment_content_context_main_user_reply_button"
                    >
                      <SVG src={Reply} alt="Reply" className="comment_content_context_main_user_reply_button_icon" />
                      Reply
                </button>
                  </div>
                )}
              </div>
            )}

            {!loadingDelete && comment.level < REPLIABLE_COMMENT_LEVEL_MAX && showReply && (
              <div className="comment_content_context_main_user_reply_input">
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
                  openBox={openBox}
                  parentId={comment.postId}
                  onSubmit={() => { this.setState({ showReply: false }) }}
                />
              </div>
            )}

            {(children_comments && !!children_comments.length) && (
              <Dialogue
                dialogue={children_comments}
                currentUserAddr={currentUserAddr}
                currentUser3BoxProfile={currentUser3BoxProfile}
                adminEthAddr={adminEthAddr}
                profiles={profiles}
                showCommentCount={showCommentCount}
                loginFunction={loginFunction}
                isLoading3Box={isLoading3Box}
                ethereum={ethereum}
                thread={thread}
                box={box}
                useHovers={useHovers}
                login={login}
                updateComments={updateComments}
                openBox={openBox}
                hasAuthed={hasAuthed}
                onMouseOver={() => this.toggleHoverGallery(true)}
                onMouseLeave={() => this.toggleHoverGallery(false)}
              />
            )}
          </div>
        </div>

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
            openBox={openBox}
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

        <div className="comment_control">
          <button className="vote_btn" onClick={this.upvote}>
            <SVG
              src={ArrowUp}
              alt="Upvote"
              className={`vote_icon upvote ${voted === 1 ? "voted" : ""}`}
            />
          </button>

          <button className="vote_btn vote_btn-middle" onClick={this.downvote}>
            <SVG
              src={ArrowDown}
              alt="Downvote"
              className={`vote_icon downvote ${voted === -1 ? "voted" : ""}`}
            />
          </button>

          <EmojiIcon
            onClick={this.toggleEmojiPicker}
            isActive={emojiPickerIsOpen}
            tooltip={this.renderEmojiPopup()}
          />
        </div>
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
  openBox: PropTypes.func.isRequired,
  currentUserAddr: PropTypes.string,
  adminEthAddr: PropTypes.string,
  currentUser3BoxProfile: PropTypes.object,
  ethereum: PropTypes.object,
  isLoading3Box: PropTypes.bool,
  updateComments: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  profiles: PropTypes.object,
  children_comments: PropTypes.array,
  votes: PropTypes.array,
  reactions: PropTypes.array,
};

Comment.defaultProps = {
  thread: {},
  children_comments: [],
  votes: [],
  reactions: [],
};
