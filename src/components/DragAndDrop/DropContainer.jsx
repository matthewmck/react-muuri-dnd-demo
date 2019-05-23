import React, { Component } from "react";
import Muuri from "muuri";
import "react-tippy/dist/tippy.css";
import { Tooltip } from "react-tippy";
import { 
  cloneItem, 
  grabItemIndex, 
  addNewDraggable,
  grabPositionBoundaries
 } from "../../utils/dndUtils";
import PropTypes from "prop-types";
import EditModal from "../EditModal";
import { strToArray } from "../../utils/arrayUtils";
import accessibilityPlugin from "./accessibilityPlugin";

class DropContainer extends Component {
  state = { 
    text: undefined, 
    modalIsOpen: false, 
    item: null,
    title: "",
    desc: "",
    positionIndex: null,
    btnText: ""
  };

  dropContainer = React.createRef();
  grid;

  componentDidMount() {
    const { gridInstance } = this.props;
    const copyObj = {};
    let orignalState, zeroIndex;

    this.grid = new Muuri(this.dropContainer.current, {
      items: ".item",
      dragEnabled: true,
      dragContainer: document.body,
      dragSortInterval: 0,
      dragSort: () => {
        return [...this.props.dragInto, this.grid];
      },
      dragStartPredicate: (item, e) => {
        const dataType = item._element.getAttribute("data-type");

        if (dataType === "position" || dataType === "placeholder") {
          if (e.isFinal && dataType === "position") {
            this.handlePositionItems(item);
          }
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
        orignalState = this.grid.getItems();
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
          this.grid.once("dragReleaseStart", copyObj[data.item._id]);
        }
      })
      .on("send", data => {
        if (copyObj[data.item._id]) {
          this.grid.off("dragReleaseStart", copyObj[data.item._id]);
        }
      })
      .on("dragEnd", (item, e) => {
        if (e.distance < 10) {
          this.setState({
            text: item._element.innerText,
            title: "Edit word:",
            item: item,
            modalIsOpen: true,
            btnText: 'Update'
          });
        }

        if (zeroIndex && item.getGrid()._id === this.grid._id) {
          this.grid.sort(orignalState);
        }
      })
      .on("dragReleaseEnd", () => {
        this.grid.synchronize();
      });

    accessibilityPlugin(this.grid, this.dropContainer.current);
    if (gridInstance) gridInstance(this.grid);
  }

  componentWillUnmount() {
    accessibilityPlugin(undefined, undefined, true);
  }

  controlUpdate = () => {
    this.grid.synchronize();
    const index = this.state.positionIndex !== null
      ? this.state.positionIndex + 1
      : grabItemIndex(this.grid._items, this.state.item._id);
    this.grid.remove(this.state.item, {removeElements: true});

    const arr = strToArray(this.state.text);
    for (let i = 0; i < arr.length; i++) {
      console.log(arr[i])
      this.grid.add(addNewDraggable(arr[i]), { index: index + i });
    }
  };

  handlePositionItems = item => {
    this.grid.synchronize();

    const boundaries = grabPositionBoundaries(this.grid._items, item._id);
    const { startIndex, endIndex } = boundaries;
    let itemsArr = [];
    let strArr = [];

    for (let i = startIndex; i < endIndex; i++) {
      const type = this.grid._items[i]._element.getAttribute("data-type");

      if (type === 'draggable') {
        itemsArr = [...itemsArr, this.grid._items[i]];
        strArr = [...strArr, this.grid._items[i]._element.innerText];
      }
    }

    this.setState({
      text: strArr.join(' '),
      positionIndex: startIndex,
      item: itemsArr,
      title: `Position ${item._element.children[0].children[0].innerText}`,
      desc: item._element.children[0].children[0].getAttribute("data-original-title"),
      modalIsOpen: true,
      btnText: strArr.length === 0 ? 'Add' : 'Update'
    });
  }

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
        {this.state.modalIsOpen && (
          <EditModal
            text={this.state.text}
            updateText={value => this.setState({ text: value })}
            controlUpdate={this.controlUpdate}
            title={this.state.title}
            btnText={this.state.btnText}
            desc={this.state.desc}
            closeModal={() =>
              this.setState({
                text: undefined,
                title: "",
                desc: "",
                modalIsOpen: false,
                item: null,
                positionIndex: null,
                btnText: ""
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
