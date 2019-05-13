import React, { Component } from "react";
import emojis from "./emojis";

import DeleteContainer from "./components/DragAndDrop/DeleteContainer";
import DragContainer from "./components/DragAndDrop/DragContainer";
import DropContainer from "./components/DragAndDrop/DropContainer";
import Tray from "./components/Tray";

import { getList } from "./utils/dndUtils";

class App extends Component {
  state = {
    bottomGrid: null,
    deleteGrid: null,
    emojis,
    positions: [
      { id: 1, title: "This is position 1" },
      { id: 2, title: "This is position 2" },
      { id: 3, title: "This is position 3" },
      { id: 4, title: "This is position 4" },
      { id: 5, title: "This is position 5" }
    ],
    toggle: false,
    topGrid: null
  };

  getResults = () => {
    const { bottomGrid } = this.state;

    bottomGrid.synchronize();

    const containerList = getList(bottomGrid._element);
    const arr = [];
    let position;

    for (let i = 0; i < containerList.length; i++) {
      if (containerList[i].hasAttribute("data-type")) {
        if (containerList[i].getAttribute("data-type") === "position") {
          position = Number(containerList[i].getAttribute("data-id"));
          arr.push({ id: position, items: [] });
          continue;
        }

        if (containerList[i].getAttribute("data-type") === "draggable") {
          for (let j = 0; j < this.state.emojis.length; j++) {
            const itemID = containerList[i].getAttribute("data-id");
            if (this.state.emojis[j].id === Number(itemID)) {
              arr[position - 1].items.push(this.state.emojis[j]);
              continue;
            }
          }
        }
      }
    }

    console.clear();
    arr.map(item => {
      console.log(
        `%c Position ${item.id}`,
        "color: #5d38ec; font-weight: 800; font-size: 20px; margin-top: 40px"
      );
      if (item.items.length) {
        console.table(item.items);
      } else {
        console.log(
          `%c Nothing added to this position 😥`,
          "font-weight: 600; font-size: 16px"
        );
      }
    });
  };

  clearAll = () => {
    const { bottomGrid } = this.state;

    bottomGrid.synchronize();

    const containerList = getList(bottomGrid._element);

    const result = containerList.filter(item => {
      return item.getAttribute("data-type") === "draggable";
    });

    bottomGrid.remove(result, { removeElements: true });
  };

  render() {
    const { bottomGrid, deleteGrid, positions, toggle, topGrid } = this.state;

    return (
      <div>
        <DragContainer
          dragInto={[bottomGrid]}
          controlToggle={value => this.setState({ toggle: value })}
          list={emojis}
          idKey="id"
          labelKey="emoji"
          gridInstance={value => this.setState({ topGrid: value })}
        />

        <div>
          <button className="result-btn" onClick={this.getResults}>
            Get Results
          </button>
        </div>
        <p className="demo">Demo</p>

        <Tray
          controlDelete={this.clearAll}
          controlToggle={() => this.setState({ toggle: !toggle })}
          toggle={toggle}
        >
          <DropContainer
            deleteContainer={deleteGrid}
            dragInto={[topGrid, deleteGrid]}
            gridInstance={value => this.setState({ bottomGrid: value })}
            idKey="id"
            positions={positions}
            titleKey="title"
            toggle={toggle}
          />

          <DeleteContainer
            gridInstance={value => this.setState({ deleteGrid: value })}
            parentID="tray-body"
          />
        </Tray>
      </div>
    );
  }
}

export default App;
