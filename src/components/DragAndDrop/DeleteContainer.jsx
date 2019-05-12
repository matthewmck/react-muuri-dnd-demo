import React, { Component } from 'react';
import Muuri from 'muuri';
import PropTypes from 'prop-types';

class DeleteContainer extends Component {

  deleteDropTarget = React.createRef();

  componentDidMount() {
    const { gridInstance } = this.props;

    const grid = new Muuri(this.deleteDropTarget.current, {
      dragEnabled: true,
      dragContainer: document.body
    }).on('send', () => {
      this.addRemoveDropEffects('remove');
    }).on('receive', () => {
      this.addRemoveDropEffects('add');
    }).on('dragReleaseEnd', item => {
      grid.hide(item, {
        onFInish: items => {
          grid.remove(item, { removeElements: true });
        }
      });
      
      this.addRemoveDropEffects('remove');
    })

    if (gridInstance) gridInstance(grid);
  }

  addRemoveDropEffects = type => {
    const { parentID } = this.props;

    if (parentID) {
      document.getElementById(parentID).classList[type]('delete-bg');
    }

    this.deleteDropTarget.current.classList[type]('delete-drop-hover');
  }

  render() {
    return(
      <section className="delete-drop-container">
        <div ref={this.deleteDropTarget} className="delete-drop-target"></div>
      </section>
    );
  };
}

DeleteContainer.propTypes = {
  gridInstance: PropTypes.func,
  parentID: PropTypes.string
};

export default DeleteContainer;
