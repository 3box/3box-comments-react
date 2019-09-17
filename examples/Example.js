import React from 'react';
import Box from '3box';

import Comments from '../src/index';
import './index.scss';

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      box: {},
      myProfile: {},
      myAddress: '',
      isReady: false,
    }
  }

  componentDidMount() {
    // this.handleLogin();
  }

  handleLogin = async () => {
    const addresses = await window.ethereum.enable();
    const myAddress = addresses[0];

    const box = await Box.openBox(myAddress, window.ethereum, {});
    const myProfile = await Box.getProfile(myAddress);

    // await new Promise((resolve, reject) => box.onSyncDone(resolve));
    this.setState({ box, myProfile, myAddress, isReady: true });
  }

  render() {
    const { box, myAddress, myProfile, isReady } = this.state;
    return (
      <div className="App">
        <div className="appcontainerreplace">
          <div className="userscontainer">
            <Comments
              // required
              box={box}
              spaceName='3boxtestcomments'
              threadName='comments'
              ownerEthAddr="0x2a0D29C819609Df18D8eAefb429AEC067269BBb6"
              // currentUserAddr={myAddress}
              loginFunction={this.handleLogin}

              // optional
              members={false}
              showCommentCount={10}
              ethereum={window.ethereum}
              // threadOpts={{}}
              useHovers={false}
              // currentUser3BoxProfile={myProfile}
              userProfileURL={address => `https://userprofiles.co/user/${address}`}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Example;
