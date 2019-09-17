import React from 'react';
import SVG from 'react-inlinesvg';

import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Context.scss';

const Context = ({ dialogueLength, isLoading }) => (
  <div className="context">
    <span className="context_text">
      {`${dialogueLength} comments`}
      {isLoading && <SVG className="context_loading" src={Loading} alt="Loading" />}
    </span>
  </div>
)

export default Context;