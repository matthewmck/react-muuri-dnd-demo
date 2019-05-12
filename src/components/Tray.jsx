import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

const Tray = props => {
  const { controlDelete, controlToggle, toggle } = props;
  return (
    <section className="tray">
      <div className="tray-tab">
        <button
          className="toggle-btn"
          onClick={controlToggle}
        >
          <FontAwesomeIcon
            className="toggle-icon"
            icon={toggle ? faChevronDown : faChevronUp}
            size="1x"
          />
          {toggle ? 'Hide' : 'Show'}
        </button>
      </div>
      <article id="tray-body" className={`tray-body ${toggle && 'tray-body-show'}`}>
        <React.Fragment>
          <div className="clear-btn-container">
            <button className="tray-clear-btn" onClick={controlDelete}>
              Clear All
            </button>
          </div>
          {props.children}
        </React.Fragment>
      </article>
    </section>
  );
}

Tray.propTypes = {
  controlDelete: PropTypes.func.isRequired,
  controlToggle: PropTypes.func.isRequired,
  toggle: PropTypes.bool.isRequired
};

export default Tray;