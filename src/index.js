import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
<App 
  spaceName='3boxtestcomments'
  threadName='comments' 
  owner="0x2a0D29C819609Df18D8eAefb429AEC067269BBb6" 
  members={false}
  opts={{}}
  currentUserAddr={"0x2a0D29C819609Df18D8eAefb429AEC067269BBb6"}
/>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
