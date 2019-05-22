import React, { Component } from "react";
import Muuri from "muuri";
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";
import { cloneItem } from "../../utils/dndUtils";
import PropTypes from "prop-types";
import EditModal from "../EditModal";

import accessibilityPlugin from "./accessibilityPlugin";

class DropContainer extends Component {
  state = { text: undefined, modalIsOpen: false, item: null };

  dropContainer = React.createRef();

  componentDidMount() {
    const { gridInstance } = this.props;
    const copyObj = {};
    let orignalState, zeroIndex;

    const grid = new Muuri(this.dropContainer.current, {
      items: ".item",
      dragEnabled: true,
      dragContainer: document.body,
      dragSortInterval: 0,
      dragSort: () => {
        return [...this.props.dragInto, grid];
      },
      dragStartPredicate: item => {
        const dataType = item._element.getAttribute("data-type");

        if (dataType === "position" || dataType === "placeholder") {
          return false;
        }

        return true;
      },
      dragSortPredicate: item => {
        const drag = Muuri.ItemDrag.defaultSortPredicate(item);
        if (drag) zeroIndex = drag.index === 0 ? true : false;

        return Muuri.ItemDrag.defaultSortPredicate(item, {
          actions: "swap",
          threshold: 50
        });
      }
    })
      .on("dragStart", () => {
        orignalState = grid.getItems();
      })
      .on("receive", data => {
        if (
          this.props.deleteContainer === undefined ||
          this.props.deleteContainer._id !== data.fromGrid._id
        ) {
          copyObj[data.item._id] = item => {
            if (item === data.item) {
              const clone = cloneItem(data.item.getElement());
              data.fromGrid.add(clone, { index: data.fromIndex });
              data.fromGrid.show(clone);
            }
          };
          grid.once("dragReleaseStart", copyObj[data.item._id]);
        }
      })
      .on("send", data => {
        if (copyObj[data.item._id]) {
          grid.off("dragReleaseStart", copyObj[data.item._id]);
        }
      })
      .on("dragEnd", (item, e) => {
        if (e.distance < 10) {
          this.setState({
            text: item._element.innerText,
            itemID: item,
            modalIsOpen: true
          });
        }

        if (zeroIndex && item.getGrid()._id === grid._id) {
          grid.sort(orignalState);
        }
      })
      .on("dragReleaseEnd", () => {
        grid.synchronize();
      });

    accessibilityPlugin(grid, this.dropContainer.current);
    if (gridInstance) gridInstance(grid);
  }

  componentWillUnmount() {
    accessibilityPlugin(undefined, undefined, true);
  }

  controlUpdate = () => {
    const item = this.state.itemID.getElement().children[0].children[0];
    item.innerText = this.state.text;

    // this is the method for seperating out spaces
    // let ex = "this   arm's 😎😜 🙃";
    // var one = ex.split(/(\s+)/u).filter( e => e.trim().length > 0);
  };

  render() {
    const { idKey, positions, titleKey, toggle } = this.props;

    return (
      <div className="drop-container">
        <section ref={this.dropContainer} className="drop-target">
          {positions &&
            positions.map((item, index) => (
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
        {this.modalIsOpen && (
          <EditModal
            text={this.state.text}
            updateText={value => this.setState({ text: value })}
            controlUpdate={this.controlUpdate}
            closeModal={() =>
              this.setState({
                text: undefined,
                modalIsOpen: false
              })
            }
            openModal={this.state.modalIsOpen}
          />
        )}
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
