import React from 'react';

import './styles/Comment.scss';

const Comment = ({ comment, user }) => (
  <div className="comment">
    {/* {user.image ? <img src={user.image} alt="profile" /> : <div className="comment_picture" />} */}
    <div className="comment_picture" />

    <div className="comment_content">
      <div className="comment_content_context">
        {/* <a href={`https://3box.io/${}`}> */}
        <div className="comment_content_context_info">

          <div className="comment_content_context_info_username">
            Kenzo Nakamura
            {/* {user.name} */}
          </div>
          <div className="comment_content_context_info_address">
            0x123124...1231523
            {/* {user.address} */}
          </div>
        </div>
        {/* </a> */}
        <div className="comment_content_context_time">
          {comment.timestamp}
        </div>
      </div>
      <div className="comment_content_text">
        {comment.message}
      </div>
    </div>
  </div>
)

export default Comment;