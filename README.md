[![Discord](https://img.shields.io/discord/484729862368526356.svg?style=for-the-badge)](https://discordapp.com/invite/Z3f3Cxy)
[![npm](https://img.shields.io/npm/v/profile-hover.svg?style=for-the-badge)](https://www.npmjs.com/package/3box-comments-react)
[![Twitter Follow](https://img.shields.io/twitter/follow/3boxdb.svg?style=for-the-badge&label=Twitter)](https://twitter.com/3boxdb)

# 3Box Comments Plugin

`3box-comments-react` is a drop-in React component that gives Web3 developers a commenting system built on 3Box with one line of code.

## Getting Started

### React Component
Installation:

```shell
npm i -S 3box-comments-react
```

Usage:

```jsx
import ThreeBoxComments from '3box-comments-react';

const MyComponent = ({ 
    handleLogin, box, ethereum, myAddress, currentUser3BoxProfile, adminEthAddr 
    }) => (
    <ThreeBoxComments 
        // required
        spaceName="mySpaceName"
        threadName="myThreadName"
        adminEthAddr={adminEthAddr}

        // Use-case A) user already logged in to web3 & 3box in dApp
        box={box}

        // Use-case B) user not logged in but dapp has global state logic to handle login
        loginFunction={handleLogin}

        // Use-case C) user not logged in and there is no global state logic to handle login
        ethereum={ethereum}

        // optional
        currentUserAddr={myAddress}
        members={false}
        showCommentCount={10}
        threadOpts={{}}
        useHovers={false}
        currentUser3BoxProfile={currentUser3BoxProfile}
        userProfileURL={address => `https://mywebsite.com/user/${address}`}
    />
);
```

## 3Box Comments options depending on use-case
There are three general use-cases in which the Comments component can be utilized: <br/>
A) The dApp that implements the Comments component has already handled web3 and 3Box logins before Comments is mounted.<br/>
B) The dApp handles web3 and 3Box login logic but the user has not yet signed in to either upon Comments mounting.<br/>
C) The dApp has no web3 and 3Box login logic.<br/>

After handling web3 and 3Box logins in cases A - C, the Comments component will `openSpace`, `joinThread`, `post` a user's comment, and `getPosts` from other users in the thread in real-time thereafter.

### Best practice

For a better user experience within your dApp, you should expect to implement use-cases A, B, or B with A. <br/> 
By having the `box` object available in the global application state, to be used by all instances of the Comments component, the user avoids having to go through a login process for each Comments thread they want to interact with, as would be the case in C.

### Prop Types

| Property | Type          | Default  | Required Case          | Description |
| :-------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spaceName`    | String        |    |  Always   | Likely your dApp name and / or comment category.  A single `spaceName` with different `threadName` is common practice when building a dApp with multiple Comment threads. |
| `threadName`    | String       |   | Always    | A name specific to this Comments thread. |
| `adminEthAddr`    | String (Ethereum Address)       |   | Always    | The Ethereum address you wish to give admin rights to for the Comments thread.  This user will be able to delete all comments and accept members in a members-only thread. A thread with a new admin address, regardless of identical `spaceName` and `threadName`, will result in an entirely new thread.|
| `box`    | Object         |   | A (and likely B)    | The `box` instance returned from running `await Box.openBox(address, web3)`.|
| `loginFunction`    | Function       |    | B    | A function from your dApp that handles web3 and 3Box login at the global dApp state to this prop. This callback will run when a user attempts to save a comment but a `box` instance doesn't yet exist. Running this function should result in a new box instance (from const box = Box.openBox(address, web3)) being passed as the `box` prop to this component.  |
| `ethereum`    | Object        |    | C    | The `ethereum` object from whichever web3 provider your dApp uses.  The `enable` method on this object will be used to get the current user's Ethereum address and that address will be used to `openBox` within the current Component context.|
| `currentUserAddr`    | String (Ethereum Address)          |    | Optional    | The current user's Ethereum address. Passing this will let the component fetch that user's 3Box profile on component mount and render that data in the Comment input UI. |
| `members`    | Boolean       |  False   | Optional    | A boolean, `true`, to make the thread a members-only thread. Passing `false` will allow all users to post to the thread.  Changing this setting after creating will result in an entirely separate thread (see Docs.3box.io for more info). |
| `showCommentCount`    | Integer       |  30   | Optional    | The number of comments rendered by default on component mount and number of additional comments revealed after clicking `Load more` in component. |
| `spaceOpts`    | Object       | | Optional    | Optional parameters for threads (see Docs.3box.io for more info)|
| `threadOpts`    | Object       | | Optional    | Optional parameters for threads (see Docs.3box.io for more info)|
| `useHovers`    | Boolean       |  False  | Optional    | Pass true to enable a 3Box profile pop up when hovering over a commenter's name |
| `currentUser3BoxProfile`    | Object       |   | Optional    | If the current user has already had their 3Box data fetched at the global dApp state, pass the object returned from `Box.getProfile(profileAddress)` to avoid an extra request.  This data will be rendered in the Comment input interface.|
| `userProfileURL`    | Function       |  Defaults to returning user's 3Box profile URL  | Optional    | A function that returns the URL of a user's profile on the current platform.  The function will be passed an Ethereum address within the component, if needed.  A user will be redirected to the URL returned from this function when clicking on the name or Ethereum addressed associated with the comment in the thread.|

## Usage

Start example - `npm run start`

Run tests - `npm run test`

Bundle with - `npm run build`

Require locally `npm install -S ../react-npm-component-boilerplate` Note the relative path

## License

MIT