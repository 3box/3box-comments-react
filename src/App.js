import React, { Component } from 'react';
import Box from '3box';
import resolve from 'did-resolver';
import registerResolver from '3id-resolver';

import Input from './components/Input';
import Context from './components/Context';
import Dialogue from './components/Dialogue';
import Footer from './components/Footer';
import './App.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogue: [],
      uniqueUsers: [],
      dialogueLength: '',
      box: {},
      thread: {},
      profiles: {},
      currentUserProfile: {},
      showCommentCount: 30,
      showLoadButton: false,
      isLoading: false,
    }
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    const IPFS = await Box.getIPFS();
    registerResolver(IPFS);

    this.fetchMe();
    await this.fetchThread();
    await this.fetchCommenters();
    this.setState({ isLoading: false });
  }

  fetchThread = async () => {
    const { showCommentCount } = this.state;
    const { spaceName, threadName, ownerEthAddr, members, opts } = this.props;
    const dialogue = await Box.getThread(spaceName, threadName, ownerEthAddr, members, opts);
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
    const currentUserProfile = currentUser3BoxProfile.user || await Box.getProfile(currentUserAddr); // needs update
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
      user.ethAddr = ethAddrArray[i].publicKey[2].ethereumAddress;
      profiles[uniqueUsers[i]] = user;
    });
    this.setState({ profiles });
  }

  joinThread = async () => {
    const { spaceName, threadName, ownerEthAddr, currentUserAddr } = this.props;
    const box = await Box.openBox(currentUserAddr, window.ethereum); // needs update
    const space = await box.openSpace(spaceName);
    const opts = { firstModerator: ownerEthAddr };
    const thread = await space.joinThread(threadName, opts);
    thread.onUpdate(() => this.updateComments());
    this.setState({ thread });
  }

  updateComments = async () => {
    const { thread } = this.state;
    const dialogue = await thread.getPosts();
    this.setState({ dialogue: dialogue.reverse() });
  }

  handleLoadMore = async () => {
    const { showCommentCount, dialogue } = this.state;
    const newCount = showCommentCount + 30;
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
      isLoading
    } = this.state;

    const {
      currentUserAddr,
      spaceName,
      threadName,
      ownerEthAddr,
      isUseHovers,
      box,
      userProfileURL
    } = this.props;

    return (
      <div className="appcontainerreplace">
        <div className="userscontainer">
          <div className="App ThreeBoxComments_container">
            <Input
              currentUserAddr={currentUserAddr}
              currentUserProfile={currentUserProfile}
              spaceName={spaceName}
              threadName={threadName}
              thread={thread}
              ownerEthAddr={ownerEthAddr}
              box={box}
              joinThread={this.joinThread}
              updateComments={this.updateComments}
            />

            <Context
              dialogueLength={dialogueLength}
              isLoading={isLoading}
            />

            <Dialogue
              dialogue={dialogue}
              currentUserAddr={currentUserAddr}
              ownerEthAddr={ownerEthAddr}
              threadName={threadName}
              profiles={profiles}
              showCommentCount={showCommentCount}
              showLoadButton={showLoadButton}
              thread={thread}
              isUseHovers={isUseHovers}
              userProfileURL={userProfileURL}
              handleLoadMore={this.handleLoadMore}
              joinThread={this.joinThread}
            />

            <Footer />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

