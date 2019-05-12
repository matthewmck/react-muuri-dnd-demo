import React, { Component } from 'react';
import Muuri from 'muuri';
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";
import { cloneItem } from '../../utils/dndUtils';
import PropTypes from 'prop-types';

import accessibilityPlugin from './accessibilityPlugin';

class DropContainer extends Component {

  dropContainer = React.createRef();

  componentDidMount() {
    const { gridInstance } = this.props;
    const copyObj = {};
    let orignalState, zeroIndex;
    
    const grid = new Muuri(this.dropContainer.current, {
      items: '.item',
      dragEnabled: true,
      dragContainer: document.body,
      dragSortInterval: 0,
      dragSort: () => {
        return [ ...this.props.dragInto, grid ]
      },
      dragStartPredicate: item => {
        const dataType = item._element.getAttribute('data-type');
        if (dataType === 'position' || dataType === 'placeholder') {
          return false;
        }
    
        return true;
      },
      dragSortPredicate: item => {
        const drag = Muuri.ItemDrag.defaultSortPredicate(item);
        if (drag) zeroIndex = drag.index === 0 ? true : false;
    
        return Muuri.ItemDrag.defaultSortPredicate(item, {
          actions: 'swap',
          threshold: 50
        });
      }
    }).on('dragStart', () => {
      orignalState = grid.getItems();
    }).on('receive', data => {
      if(
        (this.props.deleteContainer === undefined) || 
        (this.props.deleteContainer._id !== data.fromGrid._id)
      ) {
        copyObj[data.item._id] = item => {
          if (item === data.item) {
            const clone = cloneItem(data.item.getElement());      
            data.fromGrid.add(clone, { index: data.fromIndex });
            data.fromGrid.show(clone);
          }
        };
        grid.once('dragReleaseStart', copyObj[data.item._id]);
      }
    }).on('send', data => {
      if (copyObj[data.item._id]) {
        grid.off('dragReleaseStart', copyObj[data.item._id]);
      }
    }).on('dragEnd', item => {
      if (zeroIndex && item.getGrid()._id === grid._id) {
        grid.sort(orignalState);
      }
    }).on('dragReleaseEnd', () => {
      grid.synchronize();
    });

    accessibilityPlugin(grid, this.dropContainer.current);
    if (gridInstance) gridInstance(grid);
  }

  componentWillUnmount() {
    accessibilityPlugin(undefined, undefined, true);
  }

  render() {
    const {
      idKey,
      positions,
      titleKey,
      toggle
    } = this.props;

    return (
      <div className="drop-container">
        <section ref={this.dropContainer} className="drop-target">
          {positions && positions.map((item, index) => (
            <article
              className="item"
              data-id={item[idKey]}
              data-type="position"
              key={index}
            >
              <div className="item-content">
              <Tooltip
                title={item[titleKey]}
                position="top"
                tabIndex={toggle ? "0" : "-1"}
                sticky={true}
                theme="light"
                arrow="true"
              >
                <div className="position">{item[idKey]}</div>
              </Tooltip>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }
}

DropContainer.defaultProps = {
  toggle: true
};

DropContainer.propTypes = {
  deleteContainer: PropTypes.object,
  dragInto: PropTypes.array,
  gridInstance: PropTypes.func,
  idKey: PropTypes.string.isRequired,
  positions: PropTypes.array.isRequired,
  titleKey: PropTypes.string.isRequired,
  toggle: PropTypes.bool
};

export default DropContainer;