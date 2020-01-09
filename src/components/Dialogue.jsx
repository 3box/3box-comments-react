import React from 'react';
import PropTypes from 'prop-types';

import { sortChronologically } from '../utils';
import Comment from './Comment';
import './styles/Dialogue.scss';

const Dialogue = ({
  dialogue,
  profiles,
  handleLoadMore,
  showCommentCount,
  showLoadButton,
  thread,
  useHovers,
  currentUserAddr,
  adminEthAddr,
  box,
  loginFunction,
  openBox
}) => {

  const updatedDialogue = sortChronologically(dialogue);

  return (
    <div className="dialogue">
      <div className="dialogue_grid">
        {updatedDialogue.slice(0, showCommentCount).map(comment => {
          const profile = profiles[comment.author];
          const commentAddr = profile && profile.ethAddr.toLowerCase();
          const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
          const adminEthAddrNormalized = adminEthAddr.toLowerCase();

          return (
            <Comment
              comment={comment}
              profile={profile || {}}
              isMyComment={commentAddr === currentUserAddrNormalized}
              isMyAdmin={adminEthAddrNormalized === currentUserAddrNormalized}
              isCommenterAdmin={adminEthAddrNormalized === commentAddr}
              key={comment.postId}
              thread={thread}
              useHovers={useHovers}
              box={box}
              loginFunction={loginFunction}
              openBox={openBox}
            />
          )
        })}
      </div>

      <div className="dialogue_button_container">
        {showLoadButton && (
          <button
            className="dialogue_button"
            onClick={handleLoadMore}
          >
            Load more
        </button>
        )}
      </div>
    </div>
  );
}

export default Dialogue;

Dialogue.propTypes = {
  dialogue: PropTypes.array,
  profiles: PropTypes.object,
  thread: PropTypes.object,
  box: PropTypes.object,
  currentUserAddr: PropTypes.string,
  showLoadButton: PropTypes.bool,
  useHovers: PropTypes.bool,
  loginFunction: PropTypes.func,

  openBox: PropTypes.func.isRequired,
  handleLoadMore: PropTypes.func.isRequired,
  showCommentCount: PropTypes.number.isRequired,
  adminEthAddr: PropTypes.string.isRequired,
};

Dialogue.defaultProps = {
  dialogue: [],
  profiles: {},
  thread: {},
  box: {},
  currentUserAddr: null,
  showLoadButton: false,
  useHovers: false,
};
