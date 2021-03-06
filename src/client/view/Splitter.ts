import {Controller} from '../types';
import {Model} from '../types';

/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview
 * splitter to resize the UI
 *
 */

import { addEvent } from 'drag-drop-stage-component/src/ts/utils/Events';

/**
 * @param element   container to render the UI
 * @param model  model class which holds
 * the model instances - views use it for read
 * operation only
 * @param controller  structure which holds
 * the controller instances
 */
export class Splitter {

  /**
   * width of the splitter, as defined in the CSS
   */
  static WIDTH = 5;
  onRedraw: (() => any)|undefined;
  onTheLeft: HTMLElement[] = [];
  onTheRight: HTMLElement[] = [];

  /**
   * true when the mouse is down
   */
  isDown: boolean = false;

  // store the window viewport for later use
  viewport: any;

  /**
   * handle mouse event
   */
  toBeCleared: Array<() => void> = [];

  constructor(public element: HTMLElement, public model: Model, public controller: Controller, opt_onRedraw?: (() => any)) {
    this.onRedraw = opt_onRedraw;

    // mouse down event
    this.element.addEventListener('mousedown', (e) => this.onMouseDown(e), false);

    // handle window resize event
    window.addEventListener('resize', () => this.redraw(), false);
  }

  /**
   * add a component to split
   */
  addLeft(element: HTMLElement) {
    this.onTheLeft.push(element);
    this.redraw();
  }

  /**
   * add a component to split
   */
  addRight(element: HTMLElement) {
    this.onTheRight.push(element);
    this.redraw();
  }

  /**
   * remove a component to split
   */
  remove(element: HTMLElement) {
    this.onTheRight.splice(this.onTheRight.indexOf(element), 1);
    element.style.left = '';
    element.style.right = '';
    this.redraw();
  }

  /**
   * redraw the components
   */
  redraw() {
    const pos = this.element.getBoundingClientRect();
    const parentSize = this.element.parentElement.getBoundingClientRect();

    // apply the position to the elements
    this.onTheLeft.forEach((element) => {
      element.style.right = parentSize.width - pos.left + 'px';
    });
    this.onTheRight.forEach((element) => {
      element.style.left = Splitter.WIDTH + pos.left + 'px';
    });
    if (this.onRedraw) {
      this.onRedraw();
    }
  }
  onMouseDown(evt: Event) {
    this.isDown = true;
    this.controller.stageController.hideScrolls(true);

    // listen mouse events
    this.toBeCleared.push(
      this.controller.stageController.subscribeMouseEvent('mousemove', (e: MouseEvent) => this.onMouseMove(e)),
      this.controller.stageController.subscribeMouseEvent('mouseup', (e: MouseEvent) => this.onMouseUp(e)),
    );
  }

  /**
   * handle mouse event
   */
  onMouseUp(e: Event) {
    this.isDown = false;
    this.controller.stageController.hideScrolls(false);
    this.toBeCleared.forEach((clear) => clear());
    this.toBeCleared = [];
  }

  /**
   * handle mouse event
   */
  onMouseMove(e: MouseEvent) {
    let right = parseInt(this.element.style.right);
    if (this.element.style.right === '') {
      const parentSize = this.element.parentElement.getBoundingClientRect();
      const pos = (e.target as HTMLElement).getBoundingClientRect();
      right = parentSize.right - pos.right;
    }
    this.element.style.right = (right - e.movementX) + 'px';
    this.redraw();
    this.controller.stageController.resizeWindow();
  }
}
