import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import ArrowUp from '../assets/ArrowUp.svg';
import ArrowDown from '../assets/ArrowDown.svg';
import './styles/Vote.scss';

class Vote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      time: '',
      disableVote: true,
      postLoading: false,
    }
  }

  async componentDidMount() {
    this.setState({ disableVote: false });
  }

  render() {
    const { count, voted, upvote, downvote } = this.props;

    const countClass = count > 0 ? "positive" : (count < 0 ? "negative" : "");

    return (
      <div className="comment_vote">
        <div className={`count ${countClass}`}>{count}</div>

        <button className="vote_btn vote_btn-middle" onClick={upvote}>
          <SVG
            src={ArrowUp}
            alt="Upvote"
            className={`vote_icon upvote ${voted === 1 ? "voted" : ""}`}
          />
        </button>

        <button className="vote_btn" onClick={downvote}>
          <SVG
            src={ArrowDown}
            alt="Downvote"
            className={`vote_icon downvote ${voted === -1 ? "voted" : ""}`}
          />
        </button>
      </div>
    );
  }
}

export default Vote;

Vote.propTypes = {
  box: PropTypes.object,
  thread: PropTypes.object,
  ethereum: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  currentUserAddr: PropTypes.string,
  loginFunction: PropTypes.func,
  isLoading3Box: PropTypes.bool,
  voted: PropTypes.number,
  updateComments: PropTypes.func.isRequired,
  upvote: PropTypes.func.isRequired,
  downvote: PropTypes.func.isRequired,
  openBox: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  profiles: PropTypes.object,
  count: PropTypes.number.isRequired,
};

Vote.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
  profiles: {},
  voted: 0,
};
