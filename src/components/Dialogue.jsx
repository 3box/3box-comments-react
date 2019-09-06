import React from 'react';

import Comment from './Comment';
import './styles/Dialogue.scss';

const Dialogue = ({ dialogue, profiles, handleLoadMore, showCommentCount, showLoadButton }) => (
  <div className="dialogue">
    <div className="dialogue_grid">
      {dialogue.slice(0, showCommentCount).map(comment => (
        <Comment
          comment={comment}
          user={profiles[comment.author]}
          key={comment.postId}
        />
      ))}
    </div>

    {showLoadButton && (
      <div className="dialogue_button_container">
        <button
          className="dialogue_button"
          onClick={handleLoadMore}
        >
          Load more
      </button>
      </div>
    )}
  </div>
)

export default Dialogue;