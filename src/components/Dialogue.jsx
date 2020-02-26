import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { filterComments, REPLY_THREAD_SHOW_COMMENT_COUNT } from '../utils';

import Comment from './Comment';
import '../css/Dialogue.css';

class Dialogue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCommentCount: this.props.showCommentCount || 30
    }
  }

  handleLoadMore = async () => {
    const { showCommentCount } = this.state;
    const { dialogue } = this.props;
    const newCount = showCommentCount + showCommentCount;
    let showLoadButton = true;
    if (newCount >= dialogue.length) showLoadButton = false;
    this.setState({ showCommentCount: newCount, showLoadButton });
  }

  render() {
    const {
      dialogue,
      profiles,
      thread,
      useHovers,
      currentUserAddr,
      adminEthAddr,
      box,
      loginFunction,
      openBox,
      currentUser3BoxProfile,
      ethereum,
      isLoading3Box,
      updateComments,
      login,
      hasAuthed,
      isNestedComment,
      toggleReplyInput,
      showReply,
    } = this.props;

    const { showCommentCount } = this.state;

    let showLoadButton = false;
    if (dialogue.length > showCommentCount) showLoadButton = true;

    return (
      <div className={`dialogue ${isNestedComment ? 'nestedDialogue' : ''}`}>
        <div className="dialogue_grid">
          {dialogue.slice(0, showCommentCount).map(comment => {
            const profile = profiles[comment.author];
            const commentAddr = profile && profile.ethAddr.toLowerCase();
            const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
            const adminEthAddrNormalized = adminEthAddr.toLowerCase();

            const children_comments = comment.children ? filterComments(comment.children, "comment", "deleted") : [];
            const votes = comment.children ? filterComments(comment.children, "vote") : [];
            const reactions = comment.children ? filterComments(comment.children, "reaction") : [];
            return (
              <div key={comment.postId}>
                <Comment
                  comment={comment}
                  profile={profile || {}}
                  profiles={profiles}
                  isMyComment={commentAddr === currentUserAddrNormalized}
                  isMyAdmin={adminEthAddrNormalized === currentUserAddrNormalized}
                  isCommenterAdmin={adminEthAddrNormalized === commentAddr}
                  adminEthAddr={adminEthAddr}
                  thread={thread}
                  useHovers={useHovers}
                  box={box}
                  loginFunction={loginFunction}
                  openBox={openBox}
                  login={login}
                  currentUserAddr={currentUserAddr}
                  currentUser3BoxProfile={currentUser3BoxProfile}
                  ethereum={ethereum}
                  isLoading3Box={isLoading3Box}
                  updateComments={updateComments}
                  hasAuthed={hasAuthed}
                  children_comments={children_comments}
                  votes={votes}
                  reactions={reactions}
                  isNestedComment={isNestedComment}
                  showReply={showReply}
                  toggleReplyInput={toggleReplyInput}
                />

                {(!!children_comments.length) && (
                  <Dialogue
                    dialogue={children_comments}
                    currentUserAddr={currentUserAddr}
                    currentUser3BoxProfile={currentUser3BoxProfile}
                    adminEthAddr={adminEthAddr}
                    profiles={profiles}
                    showCommentCount={REPLY_THREAD_SHOW_COMMENT_COUNT}
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
                    showReply={showReply}
                    toggleReplyInput={toggleReplyInput}
                    isNestedComment
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="dialogue_button_container">
          {showLoadButton && (
            <button
              className="dialogue_button"
              onClick={this.handleLoadMore}
            >
              Load more
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default Dialogue;

Dialogue.propTypes = {
  dialogue: PropTypes.array,
  profiles: PropTypes.object,
  thread: PropTypes.object,
  box: PropTypes.object,
  currentUserAddr: PropTypes.string,
  showReply: PropTypes.string,
  useHovers: PropTypes.bool,
  hasAuthed: PropTypes.bool,
  loginFunction: PropTypes.func,

  openBox: PropTypes.func.isRequired,

  showCommentCount: PropTypes.number.isRequired,
  adminEthAddr: PropTypes.string.isRequired,

  currentUser3BoxProfile: PropTypes.object,
  ethereum: PropTypes.object,
  isLoading3Box: PropTypes.bool,
  isNestedComment: PropTypes.bool,
  updateComments: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  toggleReplyInput: PropTypes.func.isRequired,
};

Dialogue.defaultProps = {
  dialogue: [],
  profiles: {},
  thread: {},
  box: {},
  currentUserAddr: null,
  useHovers: false,
  isNestedComment: false,
};
