import React from 'react';
import SVG from 'react-inlinesvg';
import PropTypes from 'prop-types';

import Loading from '../assets/3BoxCommentsSpinner.svg';
import '../css/Context.css';

const Context = ({ dialogueLength, isLoading }) => (
  <div className="context">
    <span className="context_text">
      {isLoading && <SVG className="context_loading" src={Loading} alt="Loading" />}
      {`${isLoading ? '' : dialogueLength || 'No'} comments`}
    </span>
  </div>
)

export default Context;

Context.propTypes = {
  dialogueLength: PropTypes.number,
  isLoading: PropTypes.bool,
};

Context.defaultProps = {
  dialogueLength: null,
  isLoading: false,
};
