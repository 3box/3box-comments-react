import React from "react";
import ProfileHover from "profile-hover";
import makeBlockie from "ethereum-blockies-base64";
import { timeSince, shortenEthAddr } from "../utils";
import "./styles/Comment.scss";
import SVG from "react-inlinesvg";
import UpVote from "../assets/upArrow.svg";
import DownVote from "../assets/downArrow.svg";

class VoteItem extends React.Component {
  render() {
    const { vote, profiles, useHovers, isCommenterAdmin } = this.props;
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
            <SVG
              className="up_vote_img"
              src={UpVote}
              alt="up vote"
              fill="rgb(255, 44, 44)"
              width="30"
              height="30"
            />
          ) : (
            <SVG
              className="down_vote_img"
              src={DownVote}
              alt="up vote"
              fill="rgb(255, 44, 44)"
              width="30"
              height="30"
            />
          )}
        </div>
      </div>
    );
  }
}

export default VoteItem;
