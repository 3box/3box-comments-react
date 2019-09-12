import React from 'react';

import Comment from './Comment';
import './styles/Dialogue.scss';

const Dialogue = ({
  dialogue,
  profiles,
  handleLoadMore,
  showCommentCount,
  showLoadButton,
  joinThread,
  thread,
  isUseHovers,
  currentUserAddr,
  ownerEthAddr,
  userProfileURL
}) => (
    <div className="dialogue">
      <div className="dialogue_grid">
        {dialogue.slice(0, showCommentCount).map(comment => {
          const profile = profiles[comment.author];
          const ethAddr = profile && profile.ethAddr.toLowerCase();
          const currentUserAddrNormalized = currentUserAddr.toLowerCase();
          const ownerEthAddrNormalized = ownerEthAddr.toLowerCase();

          return (
            <Comment
              comment={comment}
              user={profile || {}}
              isMyComment={ethAddr === currentUserAddrNormalized}
              isOwner={ownerEthAddrNormalized === currentUserAddrNormalized}
              isAdmin={ownerEthAddrNormalized === ethAddr}
              key={comment.postId}
              thread={thread}
              joinThread={joinThread}
              userProfileURL={userProfileURL}
              isUseHovers={isUseHovers}
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
  )

export default Dialogue;