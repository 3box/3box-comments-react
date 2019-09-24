import React, { Component } from 'react';
import Box from '3box';
import PropTypes from 'prop-types';
import resolve from 'did-resolver';
import registerResolver from '3id-resolver';

import { checkIsMobileDevice } from './utils';

import Input from './components/Input';
import Context from './components/Context';
import Dialogue from './components/Dialogue';
import Footer from './components/Footer';
import './index.scss';

class App extends Component {
  constructor(props) {
    super(props);
    const {
      showCommentCount,
      currentUserAddr,
      box,
      ethereum,
    } = this.props;

    this.state = {
      dialogueLength: null,
      showLoadButton: false,
      isLoading: false,
      dialogue: [],
      uniqueUsers: [],
      thread: {},
      profiles: {},
      currentUser3BoxProfile: {},
      box,
      currentUserAddr,
      showCommentCount: showCommentCount || 30,
      ethereum: ethereum || window.ethereum,
      isMobile: checkIsMobileDevice(),
    }
  }

  async componentDidMount() {
    const { currentUserAddr } = this.state;
    const { currentUser3BoxProfile } = this.props;
    this.setState({ isLoading: true });

    // get ipfs instance for did-resolver
    const IPFS = await Box.getIPFS();
    registerResolver(IPFS);

    // if we have eth and don't have 3box profile, fetch it
    if (currentUserAddr &&
      (!currentUser3BoxProfile || !Object.entries(currentUser3BoxProfile).length)) {
      this.fetchMe();
    }

    // fetch thread to render on mount
    await this.fetchThread();
    await this.fetchCommenters();
    this.setState({ isLoading: false });
  }

  componentDidUpdate(prevProps) {
    const { currentUserAddr, currentUser3BoxProfile, box } = this.props;

    // if current user's eth addr is updated in parent, fetch profile
    if (currentUserAddr !== prevProps.currentUserAddr) {
      const hasNoUserProfile = (!currentUser3BoxProfile || !Object.entries(currentUser3BoxProfile).length);
      this.setState({ currentUserAddr }, () => {
        hasNoUserProfile && this.fetchMe();
      });
    }

    // if current user's profile is updated in parent, update UI
    if (currentUser3BoxProfile !== prevProps.currentUser3BoxProfile) {
      this.setState({ currentUser3BoxProfile });
    }

    // if box is updated in parent, update component state
    const prevBoxEmpty = !prevProps.box || !Object.entries(prevProps.box).length;
    if (prevBoxEmpty && box && Object.entries(box).length > 0) {
      this.setState({ box });
    }
  }

  // get thread from public api only on component mount
  fetchThread = async () => {
    const { showCommentCount } = this.state;
    const {
      spaceName,
      threadName,
      adminEthAddr,
      members,
      threadOpts
    } = this.props;

    if (!spaceName || !threadName) console.log('You must pass both spaceName and threadName props');

    // check if admin has that space first, if not, thread is empty
    const spaces = await Box.listSpaces(adminEthAddr);
    if (!spaces.includes(spaceName)) return;

    const dialogue = await Box.getThread(spaceName, threadName, adminEthAddr, members, threadOpts || {});
    const uniqueUsers = [...new Set(dialogue.map(x => x.author))];

    let showLoadButton;
    if (dialogue.length >= showCommentCount) showLoadButton = true;

    this.setState({
      uniqueUsers,
      dialogue,
      dialogueLength: dialogue.length,
      showLoadButton,
    });
  }

  fetchMe = async () => {
    const { currentUserAddr } = this.props;
    const stateCurrentUserAddr = this.state.currentUserAddr;
    const myAddress = currentUserAddr || stateCurrentUserAddr;

    const currentUser3BoxProfile = await Box.getProfile(myAddress);

    this.setState({ currentUser3BoxProfile });
  }

  // get profiles of commenters from public api only on component mount
  fetchCommenters = async () => {
    const { uniqueUsers } = this.state;

    const profiles = {};
    const fetchProfile = async (did) => await Box.getProfile(did);
    const fetchAllProfiles = async () => await Promise.all(uniqueUsers.map(did => fetchProfile(did)));
    const profilesArray = await fetchAllProfiles();

    const getEthAddr = async (did) => await resolve(did);
    const getAllEthAddr = async () => await Promise.all(uniqueUsers.map(did => getEthAddr(did)));
    const ethAddrArray = await getAllEthAddr();

    profilesArray.forEach((user, i) => {
      const { userProfileURL } = this.props;
      const ethAddr = ethAddrArray[i].publicKey[2].ethereumAddress;
      user.ethAddr = ethAddr;
      user.profileURL = userProfileURL ? userProfileURL(ethAddr) : `https://3box.io/${ethAddr}`;
      profiles[uniqueUsers[i]] = user;
    });
    this.setState({ profiles });
  }

  openBox = async () => {
    const { ethereum } = this.state;
    if (!ethereum) console.error('You must provide an ethereum object to the comments component.');

    const addresses = await ethereum.enable();
    const currentUserAddr = addresses[0];
    this.setState({ currentUserAddr }, async () => await this.fetchMe());

    const box = await Box.openBox(currentUserAddr, ethereum, {});

    box.onSyncDone(() => this.setState({ box }));
    this.setState({ box });
  }

  joinThread = async () => {
    const {
      spaceName,
      threadName,
      adminEthAddr,
      spaceOpts
    } = this.props;
    const stateBox = (this.state.box && Object.keys(this.state.box).length) && this.state.box;
    const propBox = (this.props.box && Object.keys(this.props.box).length) && this.props.box;
    const box = stateBox || propBox;

    const space = await box.openSpace(spaceName, spaceOpts || {});
    const opts = { firstModerator: adminEthAddr };
    const thread = await space.joinThread(threadName, opts);

    // fetch current user's space did to match herself against comment auth
    await this.fetch3ID();

    const dialogue = await thread.getPosts();
    thread.onUpdate(() => this.updateComments());
    this.setState({ thread, dialogue });
  }

  fetch3ID = async () => {
    const { currentUserAddr, spaceName, userProfileURL } = this.props;
    const { profiles } = this.state;
    const stateCurrentUserAddr = this.state.currentUserAddr;
    const myAddress = currentUserAddr || stateCurrentUserAddr;

    const config = await Box.getConfig(myAddress);
    const threeID = config.spaces && config.spaces[spaceName] && config.spaces[spaceName].DID;

    // if profile already exists in uniqueUsers object, return
    if (profiles[threeID]) return;

    const currentUser3BoxProfile = await Box.getProfile(myAddress);
    currentUser3BoxProfile.ethAddr = myAddress;
    currentUser3BoxProfile.profileURL = userProfileURL ? userProfileURL(myAddress) : `https://3box.io/${myAddress}`;
    profiles[threeID] = currentUser3BoxProfile;

    this.setState({ currentUser3BoxProfile, profiles });
  }

  updateComments = async () => {
    const { thread } = this.state;
    const dialogue = await thread.getPosts();
    this.setState({ dialogue, dialogueLength: dialogue.length });
  }

  handleLoadMore = async () => {
    const { showCommentCount, dialogue } = this.state;
    const newCount = showCommentCount + showCommentCount;
    let showLoadButton = true;
    if (newCount >= dialogue.length) showLoadButton = false;
    this.setState({ showCommentCount: newCount, showLoadButton });
  }

  render() {
    const {
      dialogue,
      dialogueLength,
      profiles,
      currentUser3BoxProfile,
      thread,
      showCommentCount,
      showLoadButton,
      isLoading,
      box,
      currentUserAddr,
      isMobile,
      ethereum
    } = this.state;

    const {
      spaceName,
      threadName,
      adminEthAddr,
      useHovers,
      loginFunction
    } = this.props;

    return (
      <div
        className={`
        threebox-comments-react 
        ${isMobile ? 'comment-mobile' : 'comment-desktop'}
        `}
      >
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
          joinThread={this.joinThread}
          updateComments={this.updateComments}
          openBox={this.openBox}
        />

        <Context
          dialogueLength={dialogueLength}
          isLoading={isLoading}
        />

        <Dialogue
          dialogue={dialogue}
          currentUserAddr={currentUserAddr}
          adminEthAddr={adminEthAddr}
          threadName={threadName}
          profiles={profiles}
          showCommentCount={showCommentCount}
          showLoadButton={showLoadButton}
          thread={thread}
          useHovers={useHovers}
          handleLoadMore={this.handleLoadMore}
          joinThread={this.joinThread}
        />

        <Footer />
      </div>
    );
  }
}

export default App;

App.propTypes = {
  showCommentCount: PropTypes.number,
  currentUserAddr: PropTypes.string,
  userProfileURL: PropTypes.func,
  members: PropTypes.bool,
  box: PropTypes.object,
  spaceOpts: PropTypes.object,
  ethereum: PropTypes.object,
  threadOpts: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  useHovers: PropTypes.bool,
  loginFunction: PropTypes.func,
  spaceName: PropTypes.string.isRequired,
  threadName: PropTypes.string.isRequired,
  adminEthAddr: PropTypes.string.isRequired,
};

App.defaultProps = {
  showCommentCount: 30,
  currentUserAddr: '',
  members: false,
  useHovers: false,
  userProfileURL: null,
  box: null,
  ethereum: null,
  currentUser3BoxProfile: null,
  threadOpts: null,
  spaceOpts: null,
  loginFunction: null,
};