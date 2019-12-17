import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import { checkIsMobileDevice, encodeMessage } from '../utils';

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
      isMobile: checkIsMobileDevice(),
    }
    this.upvote = () => { this.vote(1);}
    this.downvote = () => { this.vote(-1); }
  }

  async componentDidMount() {
    this.setState({ disableVote: false });
  }

  handleLoggedInAs = () => {
    const { showLoggedInAs } = this.state;
    this.setState({ showLoggedInAs: !showLoggedInAs });
  }

  getMyVote = () => {
    const {
      currentUserAddr,
      votes,
      profiles
    } = this.props;

    const currentUserAddrNormalized = currentUserAddr && currentUserAddr.toLowerCase();
    const myVotes = votes.filter(v => {
      const profile = profiles[v.author];
      const voterAddr = profile && profile.ethAddr.toLowerCase();
      return voterAddr === currentUserAddrNormalized
    });
    return myVotes && myVotes.length > 0 ? myVotes[0] : null;
  }

  vote = async (direction) => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum,
      parentId
    } = this.props;

    const { disableVote, isMobile } = this.state;
    const noWeb3 = (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

    if (noWeb3) return;
    if (disableVote) return;

    if (!box || !Object.keys(box).length) loginFunction ? await loginFunction() : await openBox();

    if (!Object.keys(thread).length) await joinThread();


    try {
      const myVote = this.getMyVote();
      if (myVote) {
        if (myVote.message.data === direction) {
          // undo vote
          await this.props.thread.deletePost(myVote.postId);
        } else {
          // re-vote
          await this.props.thread.deletePost(myVote.postId);
          const message = encodeMessage("vote", direction, parentId);
          await this.props.thread.post(message);
        }
      } else {
        const message = encodeMessage("vote", direction, parentId);
        await this.props.thread.post(message);
      }
      await updateComments();
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your vote', error);
    }
  }

  render() {
    const { votes } = this.props;

    const count = votes.reduce((sum, v) => (sum + v.message.data), 0);

    let voted = 0;
    const myVote = this.getMyVote();
    if (myVote) {
      voted = myVote.message.data;
    }

    const countClass = count > 0 ? "positive" : (count < 0 ? "negative" : "");

    return (
      <div className="comment_vote">

        <button className="vote_btn" onClick={this.upvote}>
          <SVG
            src={ArrowUp}
            alt="Upvote"
            className={`vote_icon upvote ${voted === 1 ? "voted" : ""}`}
          />
        </button>
        <div className={`count ${countClass}`}>{count}</div>
        <button className="vote_btn" onClick={this.downvote}>
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
  updateComments: PropTypes.func.isRequired,
  openBox: PropTypes.func.isRequired,
  joinThread: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  votes: PropTypes.array,
  profiles: PropTypes.object,
};

Vote.defaultProps = {
  box: {},
  thread: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null,
  votes: [],
  profiles: {},
};
