import React, { Component } from 'react';
import ProfileHover from 'profile-hover';
import PropTypes from 'prop-types';
import Linkify from 'react-linkify';
import makeBlockie from 'ethereum-blockies-base64';
import SVG from 'react-inlinesvg';

import { timeSince, shortenEthAddr, filterComments, REPLIABLE_COMMENT_LEVEL_MAX, REPLY_THREAD_SHOW_COMMENT_COUNT } from '../utils';
import Delete from '../assets/Delete.svg';
import Reply from '../assets/Reply.svg';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Comment.scss';
import Input from './Input';
import Dialogue from './Dialogue';
import Vote from './Vote';
import Reactions from './Reactions';

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingDelete: false,
      hoverComment: false,
      hoverGallery: false,
      showReply: false,
    };
    this.toggleHoverComment = this.toggleHoverComment.bind(this);
    this.toggleHoverGallery = this.toggleHoverGallery.bind(this);
  }

  deleteComment = async (commentId, e) => {
    e.preventDefault();
    const {
      thread,
      joinThread,
      box,
      loginFunction,
      openBox
    } = this.props;

    if (!box || !Object.keys(box).length) {
      this.setState({ loadingDelete: true });
      loginFunction ? await loginFunction() : await openBox();
    }

    // if user hasn't joined thread yet
    if (!Object.keys(thread).length) await joinThread();

    try {
      this.setState({ loadingDelete: false });
      await this.props.thread.deletePost(commentId);
    } catch (error) {
      console.error('There was an error deleting your comment', error);
    }
  }

  toggleReplyInput = (e) => {
    const { showReply } = this.state;
    this.setState({ showReply: !showReply});
  }

  toggleHoverComment(state) {
    this.setState({ hoverComment: state })
  }

  toggleHoverGallery(state) {
    this.setState({ hoverGallery: state })
  }

  render() {
    const {
      loadingDelete,
      showReply,
      hoverComment,
      hoverGallery
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
      joinThread,
      openBox,
      profiles,
    } = this.props;

    const profilePicture = profile.ethAddr &&
      (profile.image ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl['/']}`
        : makeBlockie(profile.ethAddr));
    const canDelete = isMyComment || isMyAdmin;
    const hasThread = !!Object.keys(thread).length;

    const children_comments = comment.children ? filterComments(comment.children, "comment") : [];
    const votes = comment.children ? filterComments(comment.children, "vote") : [];
    const reactions = comment.children ? filterComments(comment.children, "reaction") : [];

    const notHoverChildren = !children_comments || children_comments.length === 0 || !hoverGallery;
    const visibleClass = hoverComment && notHoverChildren ? "visible" : "";

    const showCommentCount = REPLY_THREAD_SHOW_COMMENT_COUNT;

    return (
      <div className={`comment ${canDelete ? 'isMyComment' : ''}`} onMouseOver={() => this.toggleHoverComment(true)} onMouseLeave={() => this.toggleHoverComment(false)}>
        <Vote
          currentUserAddr={currentUserAddr}
          currentUser3BoxProfile={currentUser3BoxProfile}
          thread={thread}
          ethereum={ethereum}
          adminEthAddr={adminEthAddr}
          box={box}
          loginFunction={loginFunction}
          isLoading3Box={isLoading3Box}
          joinThread={joinThread}
          updateComments={updateComments}
          openBox={openBox}
          parentId={comment.postId}
          votes={votes}
          profiles={profiles}
        />

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

          {!loadingDelete && (
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
                  joinThread={joinThread}
                  updateComments={updateComments}
                  openBox={openBox}
                  parentId={comment.postId}
                  reactions={reactions}
                  profiles={profiles}
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
                joinThread={joinThread}
                updateComments={updateComments}
                openBox={openBox}
                parentId={comment.postId}
                onSubmit={() => { this.setState({ showReply: false })}}
              />
            </div>
          )}

          {children_comments && children_comments.length > 0 && (
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
              joinThread={joinThread}
              updateComments={updateComments}
              openBox={openBox}
              onMouseOver={() => this.toggleHoverGallery(true)}
              onMouseLeave={() => this.toggleHoverGallery(false)}
            />
          )}
        </div >
      </div >
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
  joinThread: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  box: PropTypes.object,
  loginFunction: PropTypes.func,
  openBox: PropTypes.func.isRequired,
  currentUserAddr: PropTypes.string,
  currentUser3BoxProfile: PropTypes.object,
  ethereum: PropTypes.object,
  isLoading3Box: PropTypes.bool,
  updateComments: PropTypes.func.isRequired,
  profiles: PropTypes.object,
};

Comment.defaultProps = {
  thread: {},
};
