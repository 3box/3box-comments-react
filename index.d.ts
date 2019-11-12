import * as React from "react";

declare class ThreeBoxComments extends React.Component<ThreeBoxCommentsProps, any> { }

interface ThreeBoxCommentsProps {
  box?: [any];
  loginFunction?: [any];
  ethereum?: [any];
  threadOpts?: [any];
  currentUser3BoxProfile?: [any];
  spaceOpts?: [any];
  members?: boolean;
  useHovers?: boolean;
  showCommentCount?: number;
  currentUserAddr?: string;
  userProfileURL?: (url: string) => string;

  spaceName: string;
  threadName: string;
  adminEthAddr: string;
}

export default ThreeBoxComments;