import React, { Component } from 'react';
import Box from '3box';
import './App.scss';
import Input from './components/Input';
import Context from './components/Context';
import Dialogue from './components/Dialogue';
import Footer from './components/Footer';

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
      // userProfileURL: this.props.userProfileURL || `https://3box.io/${}`
    }
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    this.fetchMe();
    await this.fetchThread();
    // await this.fetchCommenters();
    this.setState({ isLoading: false });
  }

  fetchThread = async () => {
    const { showCommentCount } = this.state;
    const { spaceName, threadName, owner, members, opts } = this.props;
    const dialogue = await Box.getThread(spaceName, threadName, owner, members, opts);
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
    const { currentUserAddr } = this.props;
    const currentUserProfile = await Box.getProfile(currentUserAddr);
    this.setState({ currentUserProfile });
  }

  fetchCommenters = async () => {
    const { uniqueUsers } = this.state;
    const profiles = {};
    // const fetchProfile = async (user) => await Box.getProfile(user);
    // const fetchAllProfiles = async () => await Promise.all(uniqueUsers.map(user => fetchProfile(user)));
    // const profilesArray = fetchAllProfiles();
    // profilesArray.forEach(user => profiles[user.did] = user);
    const user = await Box.getProfile('0x2a0D29C819609Df18D8eAefb429AEC067269BBb6');
    
    this.setState({ profiles });
  }

  joinThread = async () => {
    console.log('joinThread');
    const { spaceName, threadName, owner } = this.props;
    const box = await Box.openBox('0x2a0D29C819609Df18D8eAefb429AEC067269BBb6', window.ethereum);
    const space = await box.openSpace(spaceName);
    const opts = { firstModerator: owner };
    const thread = await space.joinThread(threadName, opts);
    console.log('thread', thread);
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

    const { currentUserAddr, spaceName, threadName, owner, isUseHovers } = this.props;

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
              owner={owner}
              joinThread={this.joinThread}
            />

            <Context dialogueLength={dialogueLength} />

            <Dialogue
              dialogue={dialogue}
              currentUserAddr={currentUserAddr}
              threadName={threadName}
              profiles={profiles}
              showCommentCount={showCommentCount}
              showLoadButton={showLoadButton}
              isLoading={isLoading}
              currentUserProfile={currentUserProfile}
              thread={thread}
              isUseHovers={isUseHovers}
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

