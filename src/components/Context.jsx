import React from 'react';

import Loading from '../assets/3BoxCommentsSpinner.svg';
import './styles/Context.scss';

const Context = ({ dialogueLength, isLoading }) => (
  <div className="context">
    <span className="context_text">
      {`${dialogueLength} comments`}
      {isLoading && <img className="context_loading" src={Loading} alt="Loading" />}
    </span>
  </div>
)

export default Context;