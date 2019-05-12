import {
  activeElementInfo,
  cloneItem,
  createPlaceholder,
  getMaxListeners,
  grabNextItem,
  grabPlaceholder,
  grabPlaceholderIndex,
  isEmptyObj,
  isLastItem
} from '../../utils/dndUtils';

export default function(grid, container, unmount = false) {

  const plugin = {
    routeListener: e => {
      switch (e.which || e.keyCode) {
        case 39:
          return plugin.keyboardNav(e, 'right');
        case 37:
          return plugin.keyboardNav(e, 'left');
        case 13: 
          return plugin.addItem(e);
        case 8:
          return plugin.deleteItem(e);
        default:
          return null;
      }
    },
    keyboardNav: (e, direction) => {
      // grab index and element info of current focused element
      const info = activeElementInfo(container, direction);
      if (isEmptyObj(info)) return null;

      if (info.type === "placeholder") {
        // cancel if placeholder is already last item and request is to move right
        if (info.lastItem && direction === "right") return null;
  
        //grab item to focus to
        const newItem = grabNextItem(container, info.item, direction);
        const newItemType = newItem.getAttribute("data-type");
  
        // delete oldplaceholder
        const oldPlaceholder = grabPlaceholder(container);
        grid.remove(oldPlaceholder, { removeElements: true });

        // synchronize
        grid.synchronize();

        // set focus to new item
        if (newItemType === "position") {
          newItem.children[0].children[0].focus();
        } else {
          newItem.focus();
        }

        // If active element is draggable or a position
      } else {
        // Remove any old placeholders that may still exist
        const oldPlaceholder = grabPlaceholder(container);
        grid.remove(oldPlaceholder, { removeElements: true });

        // rerun activeELementInfo to get updated index
        const newInfo = activeElementInfo(container, direction);

        // add new placeholder
        switch (direction) {
          case "left":
            grid.add(createPlaceholder(), {
              index: newInfo.index,
              layout: "instant"
            });
            break;
          case "right":
            grid.add(createPlaceholder(), {
              index: newInfo.index + 1,
              layout: "instant"
            });
            break;
          default:
            return null;
        }

        // Synchronize the item elements to match the order of the items in the DOM
        grid.synchronize();

        // grab next item
        const newItem = grabNextItem(container, newInfo.item, direction);

        // set focus to that item
        newItem.focus();
      }
    },
    addItem: e => {
      //check if active element is a placeholder
      const item = document.activeElement;
      if (item.hasAttribute("data-type")) {
        //if active element is a placeholder put focus on top drop container
        if (item.getAttribute("data-type") === "placeholder") {
          const dragTarget = document.getElementsByClassName('drag-target');
          if (dragTarget.length === 0) return null;
          dragTarget[0].children[0].focus();
        }

        if (item.getAttribute("data-type") === "draggable") {
          // grab class list from parent
          const itemClassList = Array.prototype.slice.call(
            item.parentElement.classList
          );

          if (itemClassList.includes('drag-target')) {
            // grab index of placeholder
            const placeholderIndex = grabPlaceholderIndex(container, item);
            if (placeholderIndex === undefined) return null;

            // add item to placeholder index
            const clone = cloneItem(item);
            grid.add(clone, { index: placeholderIndex });
            grid.show(clone);

            // sync
            grid.synchronize();

            // remove placeholder
            const oldPlaceholder = grabPlaceholder(container);
            grid.remove(oldPlaceholder, { removeElements: true });

            // put focus on item
            clone.focus();
          }
        }
      }
    },
    deleteItem: e => {
      const item = document.activeElement;

      if (item.hasAttribute('data-type')) {
        if (item.getAttribute('data-type') !== 'draggable') return null;

        const parentContainer = item.parentElement;
        if (parentContainer !== container) return null

        grid.remove(item, { removeElements: true });
      }
    }
  }

  document.addEventListener("keydown", plugin.routeListener);
  if (unmount) document.removeEventListener("keydown", plugin.routeListener);
};