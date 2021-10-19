// import * as gtap from '../lib/ancui'
import * as gtap from "../www/dist/js/gtap";

// For Fake DOM
import browserEnv from 'browser-env';
browserEnv();

/**
 * Saves the current childNodes of the document.body
 *
 * @function captureDocumentBodyChildNodes
 *
 * @return {Array} the nodes that are currently in the document.body.
 */
export function captureDocumentBodyChildNodes() {
  const initialChildren = [];
  document.body.childNodes.forEach(node => {
    initialChildren.push(node);
  });

  return initialChildren;
}

/**
 * Sets the document.body with the specified nodes.
 *
 * @function resetDocumentBody
 *
 * @param {Array} initialChildrenNodes - the nodes that should be in the document.body
 */
export function resetDocumentBody(initialChildrenNodes) {
  document.body.childNodes.forEach(node => {
    document.body.removeChild(node);
  });

  if (initialChildrenNodes) {
    initialChildrenNodes.forEach(node => {
      document.body.appendChild(node);
    });
  }
}

/**
 * Pushes the specified callback into the array n amount of times as specified
 * by @times.
 *
 * @method pump
 *
 * @param {number} times - the number of times to push the callback into the
 *  Array.
 * @param {function} callback - the callback being pushed into the Array.
 *
 * @return {Object} - The array itself.
 */
Array.prototype.pump = function (times, callback) {
  for (let i = 0; i < times; i++) {
    this.push(callback)
  }
  return this;
}

/**
 * Pushes the result of specified callback into the array n amount of times as
 * specified by @times
 *
 * @method pumpFn
 *
 * @param {number} times - the number of times to push the callback into the
 *  Array.
 * @param {function} callback - the callback whose result will be pushed into
 *  the Array.
 *
 * @return {Object} - the array itself
 */
Array.prototype.pumpFn = function (times, callback) {
  for (let i = 0; i < times; i++) {
    this.push(callback())
  }
  return this;
}

/**
 * Represents an Mocked HTML attribute used for testing.
 *
 * @class MockAttribute
 */
export class MockAttribute {
  constructor () {
    this._name = null;
    this._value = null;
  }

  get name() {
    return this._name;
  }

  set name(name) {
    this._name = name;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
  }
}

/**
 * Represents an Mocked HTML node used for testing.
 *
 * @class MockHTMLNode
 */
export class MockHTMLNode {
  constructor () {
    this._attributes = {};
    this._children = [];
  }

  getAttribute(name) {
    if (this._attributes[name] == null) {
      return null;
    }
    return this._attributes[name].value;
  }

  setAttributeNode(mockAttribute) {
    this._attributes[mockAttribute.name] = mockAttribute
  }

  get childNodes() {
    return this._children;
  }

  appendChild(childNode) {
    this._children.push(childNode);
  }
}

export function createMockedVisual(shape, data, mockParent = undefined) {
  let parentElement = mockParent == undefined ? new MockHTMLNode() : mockParent;

  const visuals = [
    gtap.$wrappedShape(shape, data, [])
  ];

  const context = gtap.container("mocked-visual", parentElement)

  gtap.renderVisuals(context, visuals);

  return visuals[0]
}

/**
 *
 * Utility to create an empty shape for testing
 *
 * @param {Function} callback - function that allows me to add the attributes I want to mock
 *
 *  const shape = emptyShape(node => {
 *     node._name = "MOCK_NODE_WITHOUT_ALIGNBOTTOM";
 *     node.$y = gtap._$.__attr(node, "y");
 *     node.$height = gtap._$.__attr(node, "h");
 *     node.$y = gtap.$tapAttribute(node, node.$y, "y")
 *   });
 *   const visual = utils.createMockedVisual(shape, data);
 *
 *
 * @return {Function} Shape creator
 */
export function emptyShape(callback) {
  const shape = (container) => {
    const node = gtap.addEmptyShape(container);

    if (callback) callback(node);

    return node
  }

  return shape;
}


export function hijack(obj, hijackMember, imposterMember, callback) {
  const cachedMember = obj[hijackMember];

  obj[hijackMember] = imposterMember;

  callback();

  obj[hijackMember] = cachedMember;
}