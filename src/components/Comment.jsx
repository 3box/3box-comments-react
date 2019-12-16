import React, { Component } from "react";
import ProfileHover from "profile-hover";
import PropTypes from "prop-types";
import Linkify from "react-linkify";
import makeBlockie from "ethereum-blockies-base64";
import SVG from "react-inlinesvg";

import { timeSince, shortenEthAddr } from "../utils";
import Delete from "../assets/Delete.svg";
import Loading from "../assets/3BoxCommentsSpinner.svg";
import "./styles/Comment.scss";
import Input from "./Input";
import Dialogue from "./Dialogue";
import Context from "./Context";
import EmojiIcon from "./Emoji/EmojiIcon";
import PopupWindow from "./Emoji/PopupWindow";
import EmojiPicker from "./Emoji/EmojiPicker";
import Modal from "react-responsive-modal";
import ReactionItem from "./ReactionItem";
import VoteItem from "./VoteItem";

class Comment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingDelete: false,
      showLoadButton: false,
      showCommentCount: 30,
      firstTimeLoaded1: false,
      firstTimeLoaded2: false,
      isUpdating: false,
      hasMyVote: false,
      voteType: undefined,
      myVote: undefined,
      hasMyReaction: false,
      myReaction: undefined,
      emojiPickerIsOpen: false,
      emojiFilter: "",
      openReactionModal: false,
      openVoteModal: false,
      emojiSelected: undefined
    };
  }

  deleteComment = async (commentId, e) => {
    e.preventDefault();
    const { thread, joinThread, box, loginFunction, openBox } = this.props;

    if (!box || !Object.keys(box).length) {
      this.setState({ loadingDelete: true });
      loginFunction ? await loginFunction() : await openBox();
    }

    // if user hasn't joined thread yet
    if (!Object.keys(thread).length) await joinThread();

    try {
      this.setState({ loadingDelete: false });
      await thread.deletePost(commentId);
    } catch (error) {
      console.error("There was an error deleting your comment", error);
    }
  };

  upvoteComment = async () => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum,
      comment
    } = this.props;
    // let myVoteNewMessage = JSON.parse(this.state.myVote.message);
    // myVoteNewMessage.voteType = "up";
    // let myVote = this.state.myVote;
    // myVote.message = myVoteNewMessage;
    if (this.state.firstTimeLoaded2) {
      this.setState({ firstTimeLoaded2: false, isUpdating: true }, async () => {
        const noWeb3 =
          (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

        if (noWeb3) return;

        if (!box || !Object.keys(box).length)
          loginFunction ? await loginFunction() : await openBox();

        if (!Object.keys(thread).length) await joinThread();
        try {
          const vote = JSON.stringify({
            voteType: "up",
            type: "vote",
            postId: comment.postId
          });
          if (this.state.hasMyVote)
            await this.props.thread.deletePost(this.state.myVote.postId);
          await this.props.thread.post(vote);
          await updateComments();
          this.setState({ isUpdating: false });
        } catch (error) {
          console.error("There was an error saving your vote", error);
        }
      });
    }
  };

  downvoteComment = async () => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum,
      comment
    } = this.props;

    if (this.state.firstTimeLoaded2) {
      this.setState({ firstTimeLoaded2: false, isUpdating: true }, async () => {
        const noWeb3 =
          (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

        if (noWeb3) return;

        if (!box || !Object.keys(box).length)
          loginFunction ? await loginFunction() : await openBox();

        if (!Object.keys(thread).length) await joinThread();

        try {
          const vote = JSON.stringify({
            voteType: "down",
            type: "vote",
            postId: comment.postId
          });
          if (this.state.hasMyVote)
            await this.props.thread.deletePost(this.state.myVote.postId);
          await this.props.thread.post(vote);
          await updateComments();
          this.setState({ isUpdating: false });
        } catch (error) {
          console.error("There was an error saving your vote", error);
        }
      });
    }
  };

  handleLoadMore = async () => {
    const { showCommentCount } = this.state;
    const newCount = showCommentCount + showCommentCount;
    let showLoadButton = true;
    if (newCount >= this.props.comment.replies.length) showLoadButton = false;
    this.setState({ showCommentCount: newCount, showLoadButton });
  };

  toggleEmojiPicker = e => {
    e.preventDefault();
    if (!this.state.emojiPickerIsOpen) {
      this.setState({ emojiPickerIsOpen: true });
    }
  };

  _handleEmojiPicked = async emoji => {
    const {
      joinThread,
      thread,
      updateComments,
      openBox,
      box,
      loginFunction,
      ethereum,
      comment
    } = this.props;
    if (this.state.firstTimeLoaded2) {
      this.setState({ firstTimeLoaded2: false, isUpdating: true }, async () => {
        const noWeb3 =
          (!ethereum || !Object.entries(ethereum).length) && !loginFunction;

        if (noWeb3) return;

        if (!box || !Object.keys(box).length)
          loginFunction ? await loginFunction() : await openBox();

        if (!Object.keys(thread).length) await joinThread();

        try {
          const reaction = JSON.stringify({
            reaction: emoji,
            type: "reaction",
            postId: comment.postId
          });
          if (this.state.hasMyReaction)
            await this.props.thread.deletePost(this.state.myReaction.postId);
          await this.props.thread.post(reaction);
          await updateComments();
          this.setState({
            emojiPickerIsOpen: false,
            isUpdating: false,
            emojiSelected: emoji
          });
        } catch (error) {
          console.error("There was an error saving your vote", error);
        }
      });
    }
  };

  closeEmojiPicker = e => {
    if (this.emojiPickerButton.contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({ emojiPickerIsOpen: false });
  };

  handleEmojiFilterChange = event => {
    const emojiFilter = event.target.value;
    this.setState({ emojiFilter });
  };

  _renderEmojiPopup = () => (
    <PopupWindow
      isOpen={this.state.emojiPickerIsOpen}
      onClickedOutside={this.closeEmojiPicker}
      onInputChange={this.handleEmojiFilterChange}
    >
      <EmojiPicker
        onEmojiPicked={this._handleEmojiPicked}
        filter={this.state.emojiFilter}
      />
    </PopupWindow>
  );

  componentDidUpdate(prev) {
    const { comment, profiles, currentUserAddr } = this.props;
    const {
      showCommentCount,
      firstTimeLoaded1,
      firstTimeLoaded2,
      isUpdating
    } = this.state;

    if (comment.replies !== undefined && !firstTimeLoaded1) {
      let showLoadButton = false;

      if (comment.replies.length > showCommentCount) showLoadButton = true;
      this.setState({
        showLoadButton,
        firstTimeLoaded1: true
      });
    }
    if (
      comment.votes !== undefined &&
      !firstTimeLoaded2 &&
      !isUpdating &&
      currentUserAddr
    ) {
      const votes = comment.votes;
      const reactions = comment.reactions;

      const hasMyVotes = votes.filter(vote => {
        const profile = profiles[vote.author];
        const voteAddr = profile && profile.ethAddr.toLowerCase();
        const currentUserAddrNormalized =
          currentUserAddr && currentUserAddr.toLowerCase();

        return voteAddr === currentUserAddrNormalized;
      });

      const hasMyReactions = reactions.filter(reaction => {
        const profile = profiles[reaction.author];
        const voteAddr = profile && profile.ethAddr.toLowerCase();
        const currentUserAddrNormalized =
          currentUserAddr && currentUserAddr.toLowerCase();

        return voteAddr === currentUserAddrNormalized;
      });

      this.setState({
        firstTimeLoaded2: true,
        hasMyVote: hasMyVotes.length > 0,
        myVote: hasMyVotes.length > 0 ? hasMyVotes[0] : undefined,
        voteType:
          hasMyVotes.length > 0
            ? JSON.parse(hasMyVotes[0].message).voteType
            : undefined,
        hasMyReaction: hasMyReactions.length > 0,
        myReaction: hasMyReactions.length > 0 ? hasMyReactions[0] : undefined,
        emojiSelected:
          hasMyReactions.length > 0
            ? JSON.parse(hasMyReactions[0].message).reaction
            : undefined
      });
    }
  }

  componentDidMount() {
    this.emojiPickerButton = document.querySelector("#sc-emoji-picker-button");
  }

  onOpenReactionModal = () => {
    this.setState({ openReactionModal: true });
  };

  onCloseReactionModal = () => {
    this.setState({ openReactionModal: false });
  };

  onOpenVoteModal = () => {
    this.setState({ openVoteModal: true });
  };

  onCloseVoteModal = () => {
    this.setState({ openVoteModal: false });
  };

  render() {
    const { loadingDelete } = this.state;
    const {
      comment,
      profile,
      isMyComment,
      useHovers,
      isMyAdmin,
      isCommenterAdmin,
      thread,
      currentUser3BoxProfile,
      currentUserAddr,
      spaceName,
      threadName,
      adminEthAddr,
      box,
      ethereum,
      loginFunction,
      openBox,
      isLoading3Box,
      joinThread,
      updateComments,
      profiles,
      type,
      isLoading
    } = this.props;

    const {
      showCommentCount,
      showLoadButton,
      hasMyVote,
      voteType,
      emojiPickerIsOpen,
      openReactionModal,
      openVoteModal,
      hasMyReaction,
      emojiSelected
    } = this.state;

    const profilePicture =
      profile.ethAddr &&
      (profile.image
        ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl["/"]}`
        : makeBlockie(profile.ethAddr));
    const canDelete = isMyComment || isMyAdmin;
    const hasThread = !!Object.keys(thread).length;
    const commentMessage = JSON.parse(comment.message);

    return (
      <div className={`comment ${canDelete ? "isMyComment" : ""}`}>
        <Modal
          open={openReactionModal}
          onClose={this.onCloseReactionModal}
          center
        >
          <div style={{ minWidth: 400 }}>
            <h2>Reactions</h2>
            <div>
              {comment.reactions.length > 0 ? (
                comment.reactions.map((reaction, i) => (
                  <ReactionItem
                    key={i}
                    profiles={profiles}
                    reaction={reaction}
                    useHovers={useHovers}
                    isCommenterAdmin={isCommenterAdmin}
                  />
                ))
              ) : (
                <h4>No Reaction present</h4>
              )}
            </div>
          </div>
        </Modal>
        <Modal open={openVoteModal} onClose={this.onCloseVoteModal} center>
          <div style={{ minWidth: 400 }}>
            <h2>Votes</h2>
            <div>
              {comment.votes.length > 0 ? (
                comment.votes.map((vote, i) => (
                  <VoteItem
                    key={i}
                    profiles={profiles}
                    vote={vote}
                    useHovers={useHovers}
                    isCommenterAdmin={isCommenterAdmin}
                  />
                ))
              ) : (
                <h4>No Votes present</h4>
              )}
            </div>
          </div>
        </Modal>
        <div className="up_down_vote">
          <div
            className={
              hasMyVote
                ? voteType === "up"
                  ? "my_up_vote"
                  : "up_vote"
                : "up_vote"
            }
            onClick={this.upvoteComment}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              className="up_vote_img"
            >
              <path
                className="heroicon-ui"
                d="M13 5.41V21a1 1 0 0 1-2 0V5.41l-5.3 5.3a1 1 0 1 1-1.4-1.42l7-7a1 1 0 0 1 1.4 0l7 7a1 1 0 1 1-1.4 1.42L13 5.4z"
              />
            </svg>
          </div>
          <div className="vote_number" onClick={this.onOpenVoteModal}>
            {comment.num_of_votes}
          </div>
          <div
            className={
              hasMyVote
                ? voteType === "down"
                  ? "my_down_vote"
                  : "down_vote"
                : "down_vote"
            }
            onClick={this.downvoteComment}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              className="down_vote_img"
            >
              <path
                className="heroicon-ui"
                d="M11 18.59V3a1 1 0 0 1 2 0v15.59l5.3-5.3a1 1 0 0 1 1.4 1.42l-7 7a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 1.4-1.42l5.3 5.3z"
              />
            </svg>
          </div>
        </div>
        <a
          href={
            profile.profileURL
              ? `${profile.profileURL}`
              : `https://3box.io/${profile.ethAddr}`
          }
          target={profile.profileURL ? "_self" : "_blank"}
          rel={profile.profileURL ? "dofollow" : "noopener noreferrer"}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="profile"
              className="comment_picture comment_picture-bgWhite"
            />
          ) : (
            <div className="comment_picture" />
          )}
        </a>

        <div className="comment_content">
          <div className="comment_content_context">
            <div className="comment_content_context_main">
              <a
                href={
                  profile.profileURL
                    ? profile.profileURL
                    : `https://3box.io/${profile.ethAddr}`
                }
                className="comment_content_context_main_user"
                target={profile.profileURL ? "_self" : "_blank"}
                rel={profile.profileURL ? "dofollow" : "noopener noreferrer"}
              >
                <div className="comment_content_context_main_user_info">
                  {useHovers ? (
                    <ProfileHover
                      address={profile && profile.ethAddr}
                      orientation="right"
                      noTheme
                    >
                      <div className="comment_content_context_main_user_info_username">
                        {profile.name || shortenEthAddr(profile.ethAddr)}
                      </div>
                    </ProfileHover>
                  ) : (
                    <div className="comment_content_context_main_user_info_username">
                      {profile.name || shortenEthAddr(profile.ethAddr)}
                    </div>
                  )}

                  {profile.name && (
                    <div
                      className="comment_content_context_main_user_info_address"
                      title={profile.ethAddr}
                    >
                      {profile.ethAddr &&
                        `${shortenEthAddr(profile.ethAddr)} ${
                          isCommenterAdmin ? "ADMIN" : ""
                        }`}
                    </div>
                  )}
                </div>

                {loadingDelete && (
                  <SVG
                    className="comment_loading"
                    src={Loading}
                    alt="Loading"
                  />
                )}

                {/* hasThread */}
                {!loadingDelete && profile.ethAddr && (
                  <div className="comment_content_context_main_user_delete">
                    <button
                      onClick={e => this.deleteComment(comment.postId, e)}
                      className="comment_content_context_main_user_delete_button"
                    >
                      <SVG
                        src={Delete}
                        alt="Delete"
                        className="comment_content_context_main_user_delete_button_icon"
                      />
                    </button>
                  </div>
                )}
              </a>
            </div>

            <div className="comment_content_context_time">
              {`${timeSince(comment.timestamp * 1000)} ago`}
            </div>
          </div>
          <div className="comment_content_text">
            <Linkify>{commentMessage.comment}</Linkify>
          </div>
          <div className="comment_emoji">
            <EmojiIcon
              onClick={this.toggleEmojiPicker}
              isActive={emojiPickerIsOpen}
              tooltip={this._renderEmojiPopup()}
              type="response"
              emoji={emojiSelected}
            />
            <div
              className={
                hasMyReaction
                  ? "comment_my_emoji_number"
                  : "comment_emoji_number"
              }
              onClick={this.onOpenReactionModal}
            >
              {comment.reactions.length}
            </div>
          </div>
          {type !== "replyToReply" ? (
            <div className="comment_reply">
              <Input
                currentUserAddr={currentUserAddr}
                currentUser3BoxProfile={currentUser3BoxProfile}
                spaceName={spaceName}
                threadName={threadName}
                thread={thread}
                ethereum={ethereum}
                adminEthAddr={adminEthAddr}
                box={box}
                loginFunction={loginFunction}
                isLoading3Box={isLoading3Box}
                joinThread={joinThread}
                updateComments={updateComments}
                openBox={openBox}
                type={type === "comment" ? "reply" : "replyToReply"}
                postId={comment.postId}
              />
            </div>
          ) : null}
          {type !== "replyToReply" ? (
            <div className="comment_context">
              <Context
                dialogueLength={comment.replies.length}
                isLoading={isLoading}
              />
            </div>
          ) : null}
          {comment.replies !== undefined ? (
            <div className="comment_reply">
              <Dialogue
                dialogue={comment.replies}
                currentUserAddr={currentUserAddr}
                adminEthAddr={adminEthAddr}
                threadName={threadName}
                profiles={profiles}
                showCommentCount={showCommentCount}
                showLoadButton={showLoadButton}
                loginFunction={loginFunction}
                thread={thread}
                box={box}
                useHovers={useHovers}
                handleLoadMore={this.handleLoadMore}
                joinThread={joinThread}
                openBox={openBox}
                currentUser3BoxProfile={currentUser3BoxProfile}
                spaceName={spaceName}
                ethereum={ethereum}
                isLoading3Box={isLoading3Box}
                updateComments={updateComments}
                type={type === "comment" ? "reply" : "replyToReply"}
                isLoading={isLoading}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default Comment;

Comment.propTypes = {
  thread: PropTypes.object,
  isMyAdmin: PropTypes.bool.isRequired,
  isCommenterAdmin: PropTypes.bool.isRequired,
  useHovers: PropTypes.bool.isRequired,
  isMyComment: PropTypes.bool.isRequired,
  joinThread: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
  profiles: PropTypes.object,
  currentUserAddr: PropTypes.string.isRequired,
  box: PropTypes.object,
  loginFunction: PropTypes.func,
  openBox: PropTypes.func.isRequired,

  ethereum: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  isLoading3Box: PropTypes.bool,

  updateComments: PropTypes.func.isRequired,

  adminEthAddr: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

Comment.defaultProps = {
  thread: {},

  profiles: {},
  box: {},
  currentUser3BoxProfile: {},
  currentUserAddr: null,
  ethereum: null
};
