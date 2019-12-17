import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Comment from './Comment';
import './styles/Dialogue.scss';

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
        joinThread,
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
        onMouseOver,
        onMouseLeave,
    } = this.props;

    const { showCommentCount } = this.state;

    let showLoadButton = false;
    if (dialogue.length > showCommentCount) showLoadButton = true;

    return (
      <div className="dialogue" onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}>
        <div className="dialogue_grid">
          {dialogue.slice(0, showCommentCount).map(comment => {
            const profile = profiles[comment.author];
            const commentAddr = profile && profile.ethAddr.toLowerCase();
            const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
            const adminEthAddrNormalized = adminEthAddr.toLowerCase();

            return (
              <Comment
                comment={comment}
                profile={profile || {}}
                profiles={profiles}
                isMyComment={commentAddr === currentUserAddrNormalized}
                isMyAdmin={adminEthAddrNormalized === currentUserAddrNormalized}
                isCommenterAdmin={adminEthAddrNormalized === commentAddr}
                adminEthAddr={adminEthAddr}
                key={comment.postId}
                thread={thread}
                joinThread={joinThread}
                useHovers={useHovers}
                box={box}
                loginFunction={loginFunction}
                openBox={openBox}
                currentUserAddr={currentUserAddr}
                currentUser3BoxProfile={currentUser3BoxProfile}
                ethereum={ethereum}
                isLoading3Box={isLoading3Box}
                updateComments={updateComments}
              />
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
  useHovers: PropTypes.bool,
  loginFunction: PropTypes.func,

  openBox: PropTypes.func.isRequired,
  joinThread: PropTypes.func.isRequired,
  showCommentCount: PropTypes.number.isRequired,
  adminEthAddr: PropTypes.string.isRequired,

  currentUser3BoxProfile: PropTypes.object,
  ethereum: PropTypes.object,
  isLoading3Box: PropTypes.bool,
  updateComments: PropTypes.func.isRequired,

  onMouseOver: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

Dialogue.defaultProps = {
  dialogue: [],
  profiles: {},
  thread: {},
  box: {},
  currentUserAddr: null,
  useHovers: false,
};
