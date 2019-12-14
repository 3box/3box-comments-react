import React from "react";
import ProfileHover from "profile-hover";
import makeBlockie from "ethereum-blockies-base64";
import { timeSince, shortenEthAddr } from "../utils";
import "./styles/Comment.scss";

const VoteItem = ({ vote, profiles, useHovers }) => {
  const profile = profiles[vote.author];
  const profilePicture =
    profile.ethAddr &&
    (profile.image
      ? `https://ipfs.infura.io/ipfs/${profile.image[0].contentUrl["/"]}`
      : makeBlockie(profile.ethAddr));
  return (
    <div className="reaction_item">
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

      <div className="reaction_content">
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
            </a>
          </div>

          <div className="comment_content_context_time">
            {`${timeSince(vote.timestamp * 1000)} ago`}
          </div>
        </div>
      </div>
      <div className="reaction_emoji">
        {JSON.parse(vote.message).voteType === "up" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="rgb(255, 44, 44)"
          >
            <path
              className="heroicon-ui"
              d="M13 5.41V21a1 1 0 0 1-2 0V5.41l-5.3 5.3a1 1 0 1 1-1.4-1.42l7-7a1 1 0 0 1 1.4 0l7 7a1 1 0 1 1-1.4 1.42L13 5.4z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="rgb(255, 44, 44)"
          >
            <path
              className="heroicon-ui"
              d="M11 18.59V3a1 1 0 0 1 2 0v15.59l5.3-5.3a1 1 0 0 1 1.4 1.42l-7 7a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1 1.4-1.42l5.3 5.3z"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default VoteItem;
