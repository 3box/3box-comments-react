import React, { Component } from 'react';
import makeBlockie from 'ethereum-blockies-base64';

import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Input.scss';
import { shortenEthAddr } from '../utils';

class Input extends Component {
  constructor(props) {
    super(props);
    const { currentUserAddr } = this.props;
    this.state = {
      user: '',
      comment: '',
      time: '',
      disableComment: true,
      postLoading: false,
      profilePicture: makeBlockie(currentUserAddr),
    }
    this.inputRef = React.createRef();
  }

  async componentDidMount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.addEventListener("keydown", this.searchEnter, false);
    this.setState({ disableComment: false });

    document.addEventListener('input', (event) => {
      if (event.target.tagName.toLowerCase() !== 'textarea') return;
      this.autoExpand(event.target);
    }, false);
  }

  autoExpand = (field) => {
    // Reset field height
    field.style.height = 'inherit';

    // Get the computed styles for the element
    var computed = window.getComputedStyle(field);

    // Calculate the height
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
      + field.scrollHeight
      - 20
      + parseInt(computed.getPropertyValue('padding-bottom'), 10)
      + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

    field.style.height = height + 'px';
  };

  componentWillUnmount() {
    const el = document.getElementsByClassName('input_form')[0];
    el.removeEventListener("keydown", this.searchEnter, false);
  }

  handleCommentText = (event) => {
    this.setState({ comment: event.target.value });
  }

  searchEnter = (event) => {
    const { comment } = this.state;
    if (event.keyCode === 13 && comment) this.saveComment();
  }

  handleLoggedInAs = () => {
    const { showLoggedInAs } = this.state
    this.setState({ showLoggedInAs: !showLoggedInAs });
  }

  saveComment = async () => {
    const { joinThread, thread } = this.props;
    const { comment, disableComment } = this.state;
    if (disableComment) return;
    this.inputRef.current.blur();
    this.inputRef.current.style.height = '74px';
    this.setState({ postLoading: true, comment: '' });
    if (!Object.keys(thread).length) await joinThread();

    try {
      await this.props.thread.post(comment);
      this.setState({ postLoading: false });
    } catch (error) {
      console.error('There was an error saving your comment', error);
    }
  }

  render() {
    const { profilePicture, comment, postLoading, showLoggedInAs } = this.state;
    const { currentUserProfile, currentUserAddr } = this.props;
    const updatedProfilePicture = currentUserProfile.image && `https://ipfs.infura.io/ipfs/${currentUserProfile.image[0].contentUrl['/']}`;

    return (
      <div className="input">
        <img
          src={updatedProfilePicture || profilePicture}
          alt="Profile"
          className="input_user"
        />

        {postLoading && (
          <img
            src={Loading}
            alt="Loading"
            className="input_postLoading"
          />
        )}

        <p className={`input_commentAs ${showLoggedInAs ? 'showLoggedInAs' : ''}`}>
          {`Commenting as ${currentUserProfile.name || shortenEthAddr(currentUserAddr)}`}
        </p>

        <textarea
          type="text"
          value={comment}
          placeholder="Write a comment..."
          className={`input_form ${postLoading ? 'hidePlaceholder' : ''}`}
          onChange={this.handleCommentText}
          onFocus={this.handleLoggedInAs}
          onBlur={this.handleLoggedInAs}
          ref={this.inputRef}
        />
      </div>
    );
  }
}

export default Input;