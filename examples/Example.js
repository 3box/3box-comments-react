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
    this.handleLogin();
  }

  handleLogin = async () => {
    const addresses = await window.ethereum.enable();
    const myAddress = addresses[0];

    const box = await Box.openBox(myAddress, window.ethereum, {});
    const myProfile = await Box.getProfile(myAddress);

    box.onSyncDone(() => this.setState({ box }));
    this.setState({ box, myProfile, myAddress, isReady: true });
  }

  render() {
    const {
      box,
      myAddress,
      isReady,
    } = this.state;

    return (
      <div className="App">
        <div className="page">
          <div className="page_dapp">
            <h2 className="page_description">
              3Box Comments Demo
            </h2>
            <div className="page_content">
              <p>
                Your super cool dApp
              </p>
            </div>
          </div>

          <div className="userscontainer">
            {isReady && (
              <Comments
                // required props
                spaceName='3boxtestcomments'
                threadName='explicitNestLevel6'
                adminEthAddr="0x2a0D29C819609Df18D8eAefb429AEC067269BBb6"
                ethereum={window.ethereum}

                loginFunction={this.handleLogin}
                box={box}
                currentUserAddr={myAddress}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Example;
