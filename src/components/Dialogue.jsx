import React from 'react';

import Comment from './Comment';
import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Dialogue.scss';

const Dialogue = ({
  dialogue,
  profiles,
  handleLoadMore,
  showCommentCount,
  showLoadButton,
  isLoading,
  currentUserProfile,
  joinThread,
  thread,
  isUseHovers
}) => (
    <div className="dialogue">
      {isLoading && <img className="dialogue_loading" src={Loading} alt="Loading" />}
      <div className="dialogue_grid">
        {dialogue.slice(0, showCommentCount).map(comment => (
          <Comment
            comment={comment}
            user={profiles[comment.author]}
            isMyComment={comment.author === currentUserProfile}
            key={comment.postId}
            thread={thread}
            joinThread={joinThread}
            isUseHovers={isUseHovers}
          />
        ))}
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