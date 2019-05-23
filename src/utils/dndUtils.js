export const activeElementInfo = (container, direction) => {
  const result = {};
  const el = document.activeElement;
  const list = getList(container);

  // is focused element a position
  if (el.hasAttribute("data-tooltipped")) {
    result.item = el.parentElement.parentElement;
    result.index = list.indexOf(result.item);
    result.type = "position";
    result.lastItem = isLastItem(container, result.index);

    // cancel if attempting to add to left of index 0
    if (direction === "left" && result.index <= 0) {
      return {};
    }

    return result;

    // is focused element a draggable
  } else if (el.hasAttribute("data-type")) {
    const type = el.getAttribute("data-type");
    const parent = el.parentElement;

    if (
      (type !== "draggable" || type !== "placeholder") &&
      parent !== container
    ) {
      return {};
    }

    result.index = list.indexOf(el);
    result.item = el;
    result.type = type;
    result.lastItem = isLastItem(container, result.index);

    return result;
  }

  return {};
}

export const cloneItem = item => {
  const clone = item.cloneNode(true);
  clone.setAttribute('style', 'display: none;');
  clone.setAttribute('class', 'item');
  clone.children[0].setAttribute('style', '');
  return clone
}

export const createPlaceholder = () => {
  const placeholder = document.createElement("div");
  placeholder.classList.add("item");
  placeholder.style.zIndex = "0";
  placeholder.setAttribute("data-type", "placeholder");
  placeholder.setAttribute("tabindex", "0");

  const item = document.createElement("div");
  item.classList.add("item-content");
  item.classList.add("placeholder");

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("svg-inline--fa");
  svg.classList.add("fa-plus-square");
  svg.classList.add("fa-w-14");
  svg.classList.add("fa-2x");
  svg.classList.add("placeholder-icon");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("data-prefix", "fas");
  svg.setAttribute("data-icon", "plus-square");
  svg.setAttribute("role", "img");
  svg.setAttribute("viewBox", "0 0 448 512");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "currentColor");
  path.setAttribute(
    "d",
    "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-32 252c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92H92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"
  );

  svg.appendChild(path);
  item.appendChild(svg);
  placeholder.appendChild(item);

  return placeholder;
}

export const getList = container => {
  return Array.prototype.slice.call(
    container.children
  );
}

export const grabNextItem = (container, item, direction) => {
  const nodes = getList(container);
  const index = nodes.indexOf(item);

  switch (direction) {
    case "left":
      return nodes[index - 1];
    case "right":
      return nodes[index + 1];
    default:
      return null;
  }
}

export const grabPlaceholder = container => {
  const nodes = getList(container);

  const arr = nodes.filter(item => {
    if (item.hasAttribute("data-type")) {
      return item.getAttribute("data-type") === "placeholder";
    }
    return false;
  });

  return arr;
}

export const grabPlaceholderIndex = (container, item) => {
  const dropList = getList(container);
  let placeholderIndex;

  dropList.map((item, index) => {
    if (item.hasAttribute("data-type")) {
      if (item.getAttribute("data-type") === "placeholder") {
        placeholderIndex = index;
      }
    }
  });

  return placeholderIndex;
}

export const isEmptyObj = obj => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export const isLastItem = (container, itemIndex) => {
  const nodes = getList(container);

  if (nodes.length - 1 === itemIndex) {
    return true;
  }

  return false;
}

export const grabItemIndex = (list, itemID) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i]._id === itemID) {
      return i;
    }
  }

  return -1;
}

export const grabPositionBoundaries = (list, itemID) => {

  let startIndex;
  let endIndex;

  for (let i = 0; i < list.length; i++) {
    if (list[i]._id === itemID) {
      startIndex = i;
      break;
    }
  }

  for (let i = startIndex + 1; i < list.length; i++) {
    const type = list[i]._element.getAttribute("data-type");
    
    if (type === 'position') {
      endIndex = i;
      break;
    }
  }

  return { startIndex, endIndex };
}

export const addNewDraggable = item => {
  const container = document.createElement("article");
  container.classList.add("item");
  container.setAttribute("data-type", "draggable");
  container.setAttribute("tabindex", "0");

  const itemContent = document.createElement("div");
  itemContent.classList.add("item-content");

  const draggableItem = document.createElement("div");
  draggableItem.classList.add("draggable-item");

  draggableItem.innerText = item;
  itemContent.appendChild(draggableItem);
  container.appendChild(itemContent);

  return container;
}