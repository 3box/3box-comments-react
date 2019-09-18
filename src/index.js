import React, { Component } from 'react';
import Box from '3box';
import PropTypes from 'prop-types';
import resolve from 'did-resolver';
import registerResolver from '3id-resolver';

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
      dialogue: [],
      uniqueUsers: [],
      dialogueLength: '',
      box,
      thread: {},
      profiles: {},
      currentUserProfile: {},
      showCommentCount: showCommentCount || 30,
      showLoadButton: false,
      isLoading: false,
      userProfileURL: false,
      currentUserAddr,
      ethereum,
    }
  }

  async componentDidMount() {
    const { currentUserAddr } = this.state;
    this.setState({ isLoading: true });

    const IPFS = await Box.getIPFS();
    registerResolver(IPFS);

    if (currentUserAddr) this.fetchMe();
    await this.fetchThread();
    await this.fetchCommenters();
    this.setState({ isLoading: false });
  }

  componentDidUpdate(prevProps) {
    const { currentUserAddr } = this.props;
    if (currentUserAddr !== prevProps.currentUserAddr) this.fetchMe();
  }

  openBox = async () => {
    const { ethereum } = this.props;
    const addresses = await ethereum.enable();
    const currentUserAddr = addresses[0];

    const box = await Box.openBox(currentUserAddr, ethereum, {});
    
    box.onSyncDone(this.setState({ box }));
    this.setState({ box, currentUserAddr });
  }

  fetchThread = async () => {
    const { showCommentCount } = this.state;
    const {
      spaceName, 
      threadName,
      adminEthAddr, 
      members, 
      threadOpts
    } = this.props;
    const dialogue = await Box.getThread(spaceName, threadName, adminEthAddr, members, threadOpts);
    const uniqueUsers = [...new Set(dialogue.map(x => x.author))];

    let showLoadButton;
    if (dialogue.length >= showCommentCount) showLoadButton = true;

    this.setState({
      uniqueUsers,
      dialogue: dialogue.reverse(),
      dialogueLength: dialogue.length,
      showLoadButton,
    });
  }

  fetchMe = async () => {
    const { currentUserAddr, currentUser3BoxProfile } = this.props;
    const currentUserProfile = currentUser3BoxProfile || await Box.getProfile(currentUserAddr);
    this.setState({ currentUserProfile });
  }

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
      user.profileURL = userProfileURL(ethAddr);
      profiles[uniqueUsers[i]] = user;
    });
    this.setState({ profiles });
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

    const space = await box.openSpace(spaceName, spaceOpts);
    const opts = { firstModerator: adminEthAddr };
    const thread = await space.joinThread(threadName, opts);
    thread.onUpdate(() => this.updateComments());
    this.setState({ thread });
  }

  updateComments = async () => {
    const { thread } = this.state;
    const dialogue = await thread.getPosts();
    this.setState({ dialogue: dialogue.reverse(), dialogueLength: dialogue.length });
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
      currentUserProfile,
      thread,
      showCommentCount,
      showLoadButton,
      isLoading,
      box,
    } = this.state;

    const {
      currentUserAddr,
      spaceName,
      threadName,
      adminEthAddr,
      useHovers,
      loginFunction
    } = this.props;

    return (
      <div className="threebox-comments-react">
        <Input
          currentUserAddr={currentUserAddr}
          currentUserProfile={currentUserProfile}
          spaceName={spaceName}
          threadName={threadName}
          thread={thread}
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
  userProfileURL: PropTypes.string,
  members: PropTypes.bool, 
  box: PropTypes.object,
  spaceOpts: PropTypes.object,
  ethereum: PropTypes.object,
  threadOpts: PropTypes.object,
  currentUser3BoxProfile: PropTypes.object,
  loginFunction: PropTypes.func,
  spaceName: PropTypes.string.isRequired,
  threadName: PropTypes.object.isRequired,
  adminEthAddr: PropTypes.object.isRequired,
  useHovers: PropTypes.bool.isRequired,
};

App.defaultProps = {
  showCommentCount: 30,
  currentUserAddr: '',
  userProfileURL: '',
  members: false, 
  box: null,
  ethereum: null,
  currentUser3BoxProfile: null,
  threadOpts: null,
  spaceOpts: null,
  loginFunction: null,
};