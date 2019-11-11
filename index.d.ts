import * as React from "react";

declare class ThreeBoxComments extends React.Component<ThreeBoxCommentsProps, any> { }

interface ThreeBoxCommentsProps {
  spaceOpts?: [any];
  ethereum?: [any];
  threadOpts?: [any];
  currentUser3BoxProfile?: [any];
  loginFunction?: [any];
  showCommentCount?: number;
  currentUserAddr?: string;
  members?: boolean;
  useHovers?: boolean;
  userProfileURL?: (url: string) => string;

  spaceName: string;
  threadName: string;
  adminEthAddr: string;
}

export default ThreeBoxComments;