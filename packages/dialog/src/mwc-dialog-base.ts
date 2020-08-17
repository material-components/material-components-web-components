/**
@license
Copyright 2019 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import 'blocking-elements';
import 'wicg-inert';

import {MDCDialogAdapter} from '@material/dialog/adapter';
import {cssClasses} from '@material/dialog/constants';
import MDCDialogFoundation from '@material/dialog/foundation';
import {applyPassive} from '@material/dom/events';
import {closest, matches} from '@material/dom/ponyfill';
import {addHasRemoveClass, BaseElement} from '@material/mwc-base/base-element';
import {observer} from '@material/mwc-base/observer';
import {DocumentWithBlockingElements} from 'blocking-elements';
import {html, property, query} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';

export {MDCDialogCloseEventDetail} from '@material/dialog/types';

const blockingElements =
    (document as DocumentWithBlockingElements).$blockingElements;

export class DialogBase extends BaseElement {
  @query('.mdc-dialog') protected mdcRoot!: HTMLDivElement;

  // _actionItemsSlot should have type HTMLSlotElement, but when TypeScript's
  // emitDecoratorMetadata is enabled, the HTMLSlotElement constructor will
  // be emitted into the runtime, which will cause an "HTMLSlotElement is
  // undefined" error in browsers that don't define it (e.g. IE11).
  @query('slot[name="primaryAction"]') protected primarySlot!: HTMLElement;

  // _actionItemsSlot should have type HTMLSlotElement, but when TypeScript's
  // emitDecoratorMetadata is enabled, the HTMLSlotElement constructor will
  // be emitted into the runtime, which will cause an "HTMLSlotElement is
  // undefined" error in browsers that don't define it (e.g. IE11).
  @query('slot[name="secondaryAction"]') protected secondarySlot!: HTMLElement;

  @query('#contentSlot') protected contentSlot!: HTMLElement;

  @query('.mdc-dialog__content') protected contentElement!: HTMLDivElement;

  @query('.mdc-container') protected conatinerElement!: HTMLDivElement;

  @property({type: Boolean}) hideActions = false;

  @property({type: Boolean})
  @observer(function(this: DialogBase) {
    this.forceLayout();
  })
  stacked = false;

  @property({type: String}) heading = '';

  @property({type: String})
  @observer(function(this: DialogBase, newAction: string) {
    this.mdcFoundation.setScrimClickAction(newAction);
  })
  scrimClickAction = 'cancel';

  @property({type: String})
  @observer(function(this: DialogBase, newAction: string) {
    this.mdcFoundation.setEscapeKeyAction(newAction);
  })
  escapeKeyAction = 'cancel';

  @property({type: Boolean, reflect: true})
  @observer(function(this: DialogBase, isOpen: boolean) {
    // Check isConnected because we could have been disconnected before first
    // update. If we're now closed, then we shouldn't start the MDC foundation
    // opening animation. If we're now closed, then we've already closed the
    // foundation in disconnectedCallback.
    if (this.mdcFoundation && this.isConnected) {
      if (isOpen) {
        this.setEventListeners();
        this.mdcFoundation.open();
      } else {
        this.removeEventListeners();
        this.mdcFoundation.close(this.currentAction || this.defaultAction);
        this.currentAction = undefined;
      }
    }
  })
  open = false;

  @property() defaultAction = 'close';
  @property() actionAttribute = 'dialogAction';
  @property() initialFocusAttribute = 'dialogInitialFocus';

  private closingDueToDisconnect?: boolean;

  protected get primaryButton(): HTMLElement|null {
    let assignedNodes = (this.primarySlot as HTMLSlotElement).assignedNodes();
    assignedNodes = assignedNodes.filter((node) => node instanceof HTMLElement);
    const button = assignedNodes[0] as HTMLElement | undefined;
    return button ? button : null;
  }

  protected currentAction: string|undefined;
  protected mdcFoundationClass = MDCDialogFoundation;
  protected mdcFoundation!: MDCDialogFoundation;
  protected boundLayout: (() => void)|null = null;
  protected boundHandleClick: ((ev: MouseEvent) => void)|null = null;
  protected boundHandleKeydown: ((ev: KeyboardEvent) => void)|null = null;
  protected boundHandleDocumentKeydown:
      ((ev: KeyboardEvent) => void)|null = null;

  protected emitNotification(name: string, action?: string) {
    const init: CustomEventInit = {detail: action ? {action} : {}};
    const ev = new CustomEvent(name, init);
    this.dispatchEvent(ev);
  }

  protected getInitialFocusEl(): HTMLElement|null {
    const initFocusSelector = `[${this.initialFocusAttribute}]`;

    // only search light DOM. This typically handles all the cases
    const lightDomQs = this.querySelector(initFocusSelector);

    if (lightDomQs) {
      return lightDomQs as HTMLElement;
    }

    // if not in light dom, search each flattened distributed node.
    const primarySlot = this.primarySlot as HTMLSlotElement;
    const primaryNodes = primarySlot.assignedNodes({flatten: true});
    const primaryFocusElement = this.searchNodeTreesForAttribute(
        primaryNodes, this.initialFocusAttribute);
    if (primaryFocusElement) {
      return primaryFocusElement;
    }

    const secondarySlot = this.secondarySlot as HTMLSlotElement;
    const secondaryNodes = secondarySlot.assignedNodes({flatten: true});
    const secondaryFocusElement = this.searchNodeTreesForAttribute(
        secondaryNodes, this.initialFocusAttribute);
    if (secondaryFocusElement) {
      return secondaryFocusElement;
    }


    const contentSlot = this.contentSlot as HTMLSlotElement;
    const contentNodes = contentSlot.assignedNodes({flatten: true});
    const initFocusElement = this.searchNodeTreesForAttribute(
        contentNodes, this.initialFocusAttribute);
    return initFocusElement;
  }

  private searchNodeTreesForAttribute(nodes: Node[], attribute: string):
      HTMLElement|null {
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      if (node.hasAttribute(attribute)) {
        return node;
      } else {
        const selection = node.querySelector(`[${attribute}]`);
        if (selection) {
          return selection as HTMLElement;
        }
      }
    }

    return null;
  }

  protected createAdapter(): MDCDialogAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      addBodyClass: () => document.body.style.overflow = 'hidden',
      removeBodyClass: () => document.body.style.overflow = '',
      areButtonsStacked: () => this.stacked,
      clickDefaultButton: () => {
        const primary = this.primaryButton;
        if (primary) {
          primary.click();
        }
      },
      eventTargetMatches: (target, selector) =>
          target ? matches(target as Element, selector) : false,
      getActionFromEvent: (e: Event) => {
        if (!e.target) {
          return '';
        }

        const element =
            closest(e.target as Element, `[${this.actionAttribute}]`);
        const action = element && element.getAttribute(this.actionAttribute);
        return action;
      },
      getInitialFocusEl: () => {
        return this.getInitialFocusEl();
      },
      isContentScrollable: () => {
        const el = this.contentElement;
        return el ? el.scrollHeight > el.offsetHeight : false;
      },
      notifyClosed: (action) => this.emitNotification('closed', action),
      notifyClosing: (action) => {
        if (!this.closingDueToDisconnect) {
          // Don't set our open state to closed just because we were
          // disconnected. That way if we get reconnected, we'll know to
          // re-open.
          this.open = false;
        }
        this.emitNotification('closing', action);
        if (action === 'cancel') {
          this.emitNotification(action, action);
        } else {
          this.emitNotification('close', action);
        }
      },
      notifyOpened: () => this.emitNotification('opened'),
      notifyOpening: () => {
        this.open = true;
        this.emitNotification('opening');
      },
      reverseButtons: () => { /* handled by render fn */ },
      releaseFocus: () => {
        blockingElements.remove(this);
      },
      trapFocus: (el) => {
        blockingElements.push(this);
        if (el) {
          el.focus();
        }
      },
    };
  }

  protected render() {
    const classes = {
      [cssClasses.STACKED]: this.stacked,
    };

    let heading = html``;

    if (this.heading) {
      heading = this.renderHeading();
    }

    const actionsClasses = {
      'mdc-dialog__actions': !this.hideActions,
    };

    return html`
    <div class="mdc-dialog ${classMap(classes)}"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="title"
        aria-describedby="content">
      <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface">
          ${heading}
          <div id="content" class="mdc-dialog__content">
            <slot id="contentSlot"></slot>
          </div>
          <footer
              id="actions"
              class="${classMap(actionsClasses)}">
            <span>
              <slot name="secondaryAction"></slot>
            </span>
            <span>
             <slot name="primaryAction"></slot>
            </span>
          </footer>
        </div>
      </div>
      <div class="mdc-dialog__scrim"></div>
    </div>`;
  }

  protected renderHeading() {
    return html`
      <h2 id="title" class="mdc-dialog__title">${this.heading}</h2>`;
  }

  firstUpdated() {
    super.firstUpdated();
    this.mdcFoundation.setAutoStackButtons(true);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.open && this.mdcFoundation && !this.mdcFoundation.isOpen()) {
      // We probably got disconnected while we were still open. Re-open,
      // matching the behavior of native <dialog>.
      this.setEventListeners();
      this.mdcFoundation.open();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.open && this.mdcFoundation) {
      // If this dialog is opened and then disconnected, we want to close
      // the foundation, so that 1) any pending timers are cancelled
      // (in particular for trapFocus), and 2) if we reconnect, we can open
      // the foundation again to retrigger animations and focus.
      this.removeEventListeners();
      this.closingDueToDisconnect = true;
      this.mdcFoundation.close(this.currentAction || this.defaultAction);
      this.closingDueToDisconnect = false;
      this.currentAction = undefined;

      // When we close normally, the releaseFocus callback handles removing
      // ourselves from the blocking elements stack. However, that callback
      // happens on a delay, and when we are closing due to a disconnect we
      // need to remove ourselves before the blocking element polyfill's
      // mutation observer notices and logs a warning, since it's not valid to
      // be in the blocking elements stack while disconnected.
      blockingElements.remove(this);
    }
  }

  forceLayout() {
    this.mdcFoundation.layout();
  }

  focus() {
    const initialFocusEl = this.getInitialFocusEl();
    initialFocusEl && initialFocusEl.focus();
  }

  blur() {
    if (!this.shadowRoot) {
      return;
    }

    const activeEl = this.shadowRoot.activeElement;
    if (activeEl) {
      if (activeEl instanceof HTMLElement) {
        activeEl.blur();
      }
    } else {
      const root = this.getRootNode();
      const activeEl = root instanceof Document ? root.activeElement : null;
      if (activeEl instanceof HTMLElement) {
        activeEl.blur();
      }
    }
  }

  protected setEventListeners() {
    this.boundHandleClick = this.mdcFoundation.handleClick.bind(
                                this.mdcFoundation) as EventListener;
    this.boundLayout = () => {
      if (this.open) {
        this.mdcFoundation.layout.bind(this.mdcFoundation);
      }
    };
    this.boundHandleKeydown = this.mdcFoundation.handleKeydown.bind(
                                  this.mdcFoundation) as EventListener;
    this.boundHandleDocumentKeydown =
        this.mdcFoundation.handleDocumentKeydown.bind(this.mdcFoundation) as
        EventListener;

    this.mdcRoot.addEventListener('click', this.boundHandleClick);
    window.addEventListener('resize', this.boundLayout, applyPassive());
    window.addEventListener(
        'orientationchange', this.boundLayout, applyPassive());
    this.mdcRoot.addEventListener(
        'keydown', this.boundHandleKeydown, applyPassive());
    document.addEventListener(
        'keydown', this.boundHandleDocumentKeydown, applyPassive());
  }

  protected removeEventListeners() {
    if (this.boundHandleClick) {
      this.mdcRoot.removeEventListener('click', this.boundHandleClick);
    }

    if (this.boundLayout) {
      window.removeEventListener('resize', this.boundLayout);
      window.removeEventListener('orientationchange', this.boundLayout);
    }

    if (this.boundHandleKeydown) {
      this.mdcRoot.removeEventListener('keydown', this.boundHandleKeydown);
    }

    if (this.boundHandleDocumentKeydown) {
      this.mdcRoot.removeEventListener(
          'keydown', this.boundHandleDocumentKeydown);
    }
  }

  close() {
    this.open = false;
  }

  show() {
    this.open = true;
  }
}
