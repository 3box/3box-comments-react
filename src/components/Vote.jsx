import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import ArrowUp from '../assets/ArrowUp.svg';
import ArrowDown from '../assets/ArrowDown.svg';
import '../css/Vote.css';

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
    const {
      count,
      voted,
      upvote,
      downvote,
    } = this.props;

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
  voted: PropTypes.number,
  upvote: PropTypes.func.isRequired,
  downvote: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
};

Vote.defaultProps = {
  voted: 0,
};
