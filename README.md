[![Discord](https://img.shields.io/discord/484729862368526356.svg?style=for-the-badge)](https://discordapp.com/invite/Z3f3Cxy)
[![npm](https://img.shields.io/npm/v/3box-comments-react.svg?style=for-the-badge)](https://www.npmjs.com/package/3box-comments-react)
[![Twitter Follow](https://img.shields.io/twitter/follow/3boxdb.svg?style=for-the-badge&label=Twitter)](https://twitter.com/3boxdb)

# 3Box Comments Plugin

The `3box-comments-react` node package is a drop-in React component that gives Web3 developers a plug-in commenting system built on 3Box infrastructure.  The Comments component handles all 3Box logic for creating a messaging thread, quickly injecting rich, decentralized social interactions in your dApp with one line of code.

## Functionality
The Comments component is a standard implementation of [Threads](https://docs.3box.io/api/messaging) available in the [3Box-js library](https://github.com/3box/3box-js), with UI for comments and comment input, profile fetching logic, and pagination.  The component is set up to handle both Web3/3Box logged in & logged out authentication contexts.  Once authentication is handled, a user can post a comment, delete their comment, and receive comments from other users in real-time.  Reading a thread, however, requires no authentication.

## Getting Started

Installation:

```shell
npm i -S 3box-comments-react
```

Authentication context: <br/>
Depending on how your dApp handles Web3 & 3Box authentication and *when*, you will need to provide a different set of props to the Comments component.  The three general authorization contexts and their respective props are discussed below in contexts A-C.

Usage:

```jsx
import ThreeBoxComments from '3box-comments-react';

const MyComponent = ({ handleLogin, box, ethereum, myAddress, currentUser3BoxProfile, adminEthAddr }) => (
    <ThreeBoxComments 
        // required
        spaceName="mySpaceName"
        threadName="myThreadName"
        adminEthAddr={adminEthAddr}


        // Required props for context A) & B)
        box={box}
        currentUserAddr={myAddress}

        // Required prop for context B)
        loginFunction={handleLogin}

        // Required prop for context C)
        ethereum={ethereum}

        // optional
        members={false}
        showCommentCount={10}
        threadOpts={{}}
        useHovers={false}
        currentUser3BoxProfile={currentUser3BoxProfile}
        userProfileURL={address => `https://mywebsite.com/user/${address}`}
    />
);
```

## 3Box Comments authorization contexts
There are three general authorization contexts in which the Comments component can be utilized: <br/><br/>
A) The dApp already handles web3 and 3Box logins *before* Comments component is mounted.<br/>
    • In this case, the `box` instance, returned from `Box.openBox(ethAddr)` should be passed to the `box` prop. The user's current Ethereum address should be passed to the `currentUserAddr` prop to determine `deletePost` access on each comment

B) The dApp has logic that handles web3 and 3Box logins, but they haven't run before Comments component is mounted.  
    • Login logic already implemented in the dApp should be passed to the Comments component as the `loginFunction` prop, to be run when a user attempts to post a comment.  `currentUserAddr` prop is required as well for the same reason as in A.<br/>

C) The dApp has no web3 and 3Box login logic.  
    • All web3 and 3Box login logic will be handled within the Comments component, though it's required for the `ethereum` object from your dApp's preferred web3 provider be passed to the `ethereum` prop in the component.<br/>

### Best practice

For a better user experience within your dApp, you should expect to implement authorization contexts A, B, or B with A. <br/> 
By having the `box` object available in the global application state, to be used by all instances of the Comments component, the user avoids having to go through a login process for each Comments thread they want to interact with, as would be the case in C.

### Prop Types

| Property | Type          | Default  | Required Case          | Description |
| :-------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spaceName`    | String        |    |  Always   | Likely your dApp name and / or comment category.  A single `spaceName` with different `threadName`s is common practice when building a dApp with multiple Comment threads. |
| `threadName`    | String       |   | Always    | A name specific to this Comments thread. |
| `adminEthAddr`    | String (Ethereum Address)       |   | Always    | The Ethereum address you wish to give admin rights to for the Comments thread.  This user will be able to delete all comments and accept members in a members-only thread. **A thread with a new admin address, despite identical `spaceName` and `threadName`, will create an entirely new thread.**|
| `box`    | Object         |   | A (and likely B)    | The `box` instance returned from running `await Box.openBox(address, web3)` somewhere in your dApp.|
| `currentUserAddr`    | String (Ethereum Address)          |    | A & B | The current user's Ethereum address. Passing this will help determine whether a user has delete access on each comment.  This prop will also let the component fetch that user's 3Box profile on component mount and render that data (profile picture) in the Comment input UI. |
| `loginFunction`    | Function       |    | B    | A function from your dApp that handles web3 and 3Box login at the global dApp state. This callback will run when a user attempts to save a comment but a `box` instance doesn't yet exist. Running this function should result in a box instance (from `const box = Box.openBox(address, web3)`) being passed as the `box` prop to this component.  |
| `ethereum`    | Object        |  window.ethereum  | C    | The `ethereum` object from whichever web3 provider your dApp uses.  The `enable` method on this object will be used to get the current user's Ethereum address and that address will be used to `openBox` within the current Component context.|
| `members`    | Boolean       |  False   | Optional    | A boolean - `true` - to make the thread a members-only thread. Passing `false` will allow all users to post to the thread.  **Changing this setting after creating it will result in an entirely different thread** (see [Docs.3box.io](https://Docs.3box.io) for more info). |
| `showCommentCount`    | Integer       |  30   | Optional    | The number of comments rendered in the UI by default on component mount and the number of additional comments revealed after clicking `Load more` in component. |
| `spaceOpts`    | Object       | | Optional    | Optional parameters for threads (see [Docs.3box.io](https://Docs.3box.io) for more info)|
| `threadOpts`    | Object       | | Optional    | Optional parameters for threads (see [Docs.3box.io](https://Docs.3box.io) for more info)|
| `useHovers`    | Boolean       |  False  | Optional    | Pass true to enable a 3Box profile pop up when hovering over a commenter's name |
| `currentUser3BoxProfile`    | Object       |   | Optional    | If the current user has already had their 3Box data fetched at the global dApp state, pass the object returned from `Box.getProfile(profileAddress)` to avoid an extra request.  This data will be rendered in the Comment input interface.|
| `userProfileURL`    | Function       |  Defaults to returning user's 3Box profile URL  | Optional    | A function that returns a correctly formatted URL of a user's profile on the current platform.  The function will be passed an Ethereum address within the component, if needed.  A user will be redirected to the URL returned from this function when clicking on the name or Ethereum address associated with the comment in the thread.|

## License

MIT