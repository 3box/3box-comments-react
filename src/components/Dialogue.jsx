import React from "react";
import PropTypes from "prop-types";

import { sortChronologically } from "../utils";
import Comment from "./Comment";
import "./styles/Dialogue.scss";

const Dialogue = ({
  dialogue,
  profiles,
  handleLoadMore,
  showCommentCount,
  showLoadButton,
  joinThread,
  thread,
  useHovers,
  currentUserAddr,
  adminEthAddr,
  box,
  loginFunction,
  openBox,
  currentUser3BoxProfile,
  spaceName,
  ethereum,
  isLoading3Box,
  updateComments,
  type,
  isLoading
}) => {
  const updatedDialogue = sortChronologically(dialogue);

  return (
    <div className="dialogue">
      <div className="dialogue_grid">
        {updatedDialogue.slice(0, showCommentCount).map(comment => {
          const profile = profiles[comment.author];
          const commentAddr = profile && profile.ethAddr.toLowerCase();
          const currentUserAddrNormalized =
            currentUserAddr && currentUserAddr.toLowerCase();
          const adminEthAddrNormalized = adminEthAddr.toLowerCase();

          return (
            <Comment
              comment={comment}
              profile={profile || {}}
              profiles={profiles}
              isMyComment={commentAddr === currentUserAddrNormalized}
              isMyAdmin={adminEthAddrNormalized === currentUserAddrNormalized}
              isCommenterAdmin={adminEthAddrNormalized === commentAddr}
              key={comment.postId}
              thread={thread}
              joinThread={joinThread}
              useHovers={useHovers}
              box={box}
              loginFunction={loginFunction}
              openBox={openBox}
              currentUserAddr={currentUserAddr}
              currentUser3BoxProfile={currentUser3BoxProfile}
              spaceName={spaceName}
              ethereum={ethereum}
              isLoading3Box={isLoading3Box}
              updateComments={updateComments}
              adminEthAddr={adminEthAddr}
              type={type}
              isLoading={isLoading}
            />
          );
        })}
      </div>

      {showLoadButton && (
        <div className="dialogue_button_container">
          <button className="dialogue_button" onClick={handleLoadMore}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

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
  joinThread: PropTypes.func.isRequired,
  showCommentCount: PropTypes.number.isRequired,
  adminEthAddr: PropTypes.string.isRequired,

  ethereum: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  isLoading3Box: PropTypes.bool,

  updateComments: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired
};

Dialogue.defaultProps = {
  dialogue: [],
  profiles: {},
  thread: {},
  box: {},
  currentUserAddr: null,
  showLoadButton: false,
  useHovers: false,

  currentUser3BoxProfile: {},
  ethereum: null
};
