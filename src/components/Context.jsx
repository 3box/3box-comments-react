import React from 'react';

import './styles/Context.scss';

const Context = ({ dialogueLength }) => (
  <div className="context">
    <p className="context_text">{`${dialogueLength} comments`}</p>
  </div>
)

export default Context;