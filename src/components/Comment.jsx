import React, { Component } from 'react';
import ProfileHover from 'profile-hover';
import Linkify from 'react-linkify';

import { timeSince } from '../utils';
import Delete from '../assets/Delete.png';
import './styles/Comment.scss';

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  deleteComment = async (commentId) => {
    const { thread, joinThread } = this.props;
    if (!Object.keys(thread).length) await joinThread();

    try {
      const res = await this.props.thread.deletePost(commentId);
      if (res) console.log(res);
    } catch (error) {
      console.error('There was an error deleting your comment', error);
    }
  }

  render() {
    const { comment, user, isMyComment, isUseHovers } = this.props;
    return (
      <div className={`comment isMyComment`}>
        {/* <div className={`comment ${isMyComment ? 'isMyComment' : ''}`}> */}
        {/* {user.image ? <img src={user.image} alt="profile" /> : <div className="comment_picture" />} */}
        <a href={`https://3box.io/${user}`}>
          <div className="comment_picture" />
        </a>

        <div className="comment_content">
          <div className="comment_content_context">
            <div className="comment_content_context_main">
              <a
                href={`https://3box.io/${user}`}
                className="comment_content_context_main_user"
              >
                <div className="comment_content_context_main_user_info">
                  {/* <ProfileHover
                    address={user.address}
                    orientation="top"
                    noTheme
                  > */}
                  <div className="comment_content_context_main_user_info_username">
                    Kenzo Nakamura
                    {/* {user.name} */}
                  </div>
                  {/* </ProfileHover> */}
                  <div className="comment_content_context_main_user_info_address">
                    0x123124...1231523
                    {/* {user.address} */}
                  </div>
                </div>
              </a>

              <div className="comment_content_context_main_user_delete">
                <button onClick={() => this.deleteComment(comment.postId)} className="comment_content_context_main_user_delete_button">
                  <img src={Delete} alt="Delete" className="comment_content_context_main_user_delete_button_icon" />
                </button>
              </div>
            </div>

            <div className="comment_content_context_time">
              {`${timeSince(comment.timestamp * 1000)} ago`}
            </div>
          </div>
          <div className="comment_content_text">
            <Linkify>
              {comment.message}
            </Linkify>
          </div>
        </div>
      </div>
    );
  }
}

export default Comment;