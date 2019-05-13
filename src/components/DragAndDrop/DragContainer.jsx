import React, { Component } from "react";
import Muuri from "muuri";
import PropTypes from "prop-types";

class DragContainer extends Component {
  dragContainer = React.createRef();

  componentDidMount() {
    const { controlToggle, gridInstance } = this.props;
    let zeroIndex;

    const grid = new Muuri(this.dragContainer.current, {
      items: ".item",
      dragEnabled: true,
      dragContainer: document.body,
      dragSortInterval: 0,
      dragSort: () => {
        return this.props.dragInto;
      },
      dragSortPredicate: item => {
        const result = Muuri.ItemDrag.defaultSortPredicate(item, {
          actions: "swap",
          threshold: 50
        });
        return result && result.index === 0 ? false : result;
      },
      dragStartPredicate: (item, e) => {
        if (controlToggle) controlToggle(true);
        return true;
      }
    }).on("dragEnd", () => {
      if (controlToggle) {
        setTimeout(() => {
          controlToggle(false);
        }, 480);
      }
    });

    if (gridInstance) gridInstance(grid);
  }

  render() {
    const { idKey, labelKey, list } = this.props;

    return (
      <div className="drag-container">
        <section ref={this.dragContainer} className="drag-target">
          {list.map((item, index) => (
            <article
              className="item"
              data-id={item[idKey]}
              data-type="draggable"
              key={index}
              tabIndex="0"
            >
              <div className="item-content">
                <div className="draggable-item">{item[labelKey]}</div>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }
}

DragContainer.defaultProps = {
  dragInto: []
};

DragContainer.propTypes = {
  controlToggle: PropTypes.func,
  dragInto: PropTypes.array,
  gridInstance: PropTypes.func,
  idKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired
};

export default DragContainer;
