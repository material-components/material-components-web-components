/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Make TypeScript not remove the imports.
import '@material/mwc-tab';
import '@material/mwc-tab-scroller';

import {BaseElement} from '@material/mwc-base/base-element';
import {observer} from '@material/mwc-base/observer';
import {Tab} from '@material/mwc-tab';
import {TabBase} from '@material/mwc-tab/mwc-tab-base';
import {TabScroller} from '@material/mwc-tab-scroller';
import {MDCTabBarAdapter} from '@material/tab-bar/adapter';
import MDCTabBarFoundation from '@material/tab-bar/foundation';
import {MDCTabInteractionEvent} from '@material/tab/types';
import {html, property, query} from 'lit-element';

export class TabBarBase extends BaseElement {
  protected mdcFoundation!: MDCTabBarFoundation;

  protected readonly mdcFoundationClass = MDCTabBarFoundation;

  @query('.mdc-tab-bar') protected mdcRoot!: HTMLElement;

  @query('mwc-tab-scroller') protected scrollerElement!: TabScroller;

  // tabsSlot should have type HTMLSlotElement, but when TypeScript's
  // emitDecoratorMetadata is enabled, the HTMLSlotElement constructor will
  // be emitted into the runtime, which will cause an "HTMLSlotElement is
  // undefined" error in browsers that don't define it (e.g. IE11).
  @query('slot') protected tabsSlot!: HTMLElement;

  @observer(async function(this: TabBarBase) {
    await this.updateComplete;
    // only provoke the foundation if we are out of sync with it, i.e.
    // ignore an foundation generated set.
    // use `activeIndex` directly to avoid staleness if it was set before the
    // first render.
    if (this.activeIndex !== this._previousActiveIndex) {
      this.mdcFoundation.activateTab(this.activeIndex);
    }
  })
  @property({type: Number})
  activeIndex = 0;

  protected _previousActiveIndex = -1;

  protected _handleTabInteraction(e: MDCTabInteractionEvent) {
    this.mdcFoundation.handleTabInteraction(e);
  }

  protected _handleKeydown(e: KeyboardEvent) {
    this.mdcFoundation.handleKeyDown(e);
  }

  // TODO(sorvell): can scroller be optional for perf?
  protected render() {
    return html`
      <div class="mdc-tab-bar" role="tablist"
          @MDCTab:interacted="${this._handleTabInteraction}"
          @keydown="${this._handleKeydown}">
        <mwc-tab-scroller><slot></slot></mwc-tab-scroller>
      </div>
      `;
  }

  // TODO(sorvell): probably want to memoize this and use a `slotChange` event
  protected _getTabs() {
    return (this.tabsSlot as HTMLSlotElement)
               .assignedNodes({flatten: true})
               .filter((e: Node) => e instanceof TabBase) as Tab[];
  }

  protected _getTab(index: number) {
    return this._getTabs()[index];
  }

  protected createAdapter(): MDCTabBarAdapter {
    return {
      scrollTo: (scrollX: number) =>
          this.scrollerElement.scrollToPosition(scrollX),
      incrementScroll: (scrollXIncrement: number) =>
          this.scrollerElement.incrementScrollPosition(scrollXIncrement),
      getScrollPosition: () => this.scrollerElement.getScrollPosition(),
      getScrollContentWidth: () => this.scrollerElement.getScrollContentWidth(),
      getOffsetWidth: () => this.mdcRoot.offsetWidth,
      isRTL: () => window.getComputedStyle(this.mdcRoot)
                       .getPropertyValue('direction') === 'rtl',
      setActiveTab: (index: number) => this.mdcFoundation.activateTab(index),
      activateTabAtIndex: (index: number, clientRect: ClientRect) => {
        const tab = this._getTab(index);
        if (tab !== undefined) {
          tab.activate(clientRect);
        }
        this._previousActiveIndex = index;
      },
      deactivateTabAtIndex: (index: number) => {
        const tab = this._getTab(index);
        if (tab !== undefined) {
          tab.deactivate();
        }
      },
      focusTabAtIndex: (index: number) => {
        const tab = this._getTab(index);
        if (tab !== undefined) {
          tab.focus();
        }
      },
      // TODO(sorvell): tab may not be able to synchronously answer
      // `computeIndicatorClientRect` if an update is pending or it has not yet
      // updated. If this is necessary, LitElement may need a `forceUpdate`
      // method.
      getTabIndicatorClientRectAtIndex: (index: number) => {
        const tab = this._getTab(index);
        return tab !== undefined ? tab.computeIndicatorClientRect() :
                                   new DOMRect();
      },
      getTabDimensionsAtIndex: (index: number) => {
        const tab = this._getTab(index);
        return tab !== undefined ?
            tab.computeDimensions() :
            {rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0};
      },
      getPreviousActiveTabIndex: () => {
        return this._previousActiveIndex;
      },
      getFocusedTabIndex: () => {
        const tabElements = this._getTabs();
        const activeElement =
            (this.getRootNode() as ShadowRoot).activeElement as Tab;
        return tabElements.indexOf(activeElement);
      },
      getIndexOfTabById: (id: string) => {
        const tabElements = this._getTabs();
        for (let i = 0; i < tabElements.length; i++) {
          if (tabElements[i].id === id) {
            return i;
          }
        }
        return -1;
      },
      getTabListLength: () => this._getTabs().length,
      notifyTabActivated: (index: number) => {
        // Synchronize the tabs `activeIndex` to the foundation.
        // This is needed when a tab is changed via a click, for example.
        this.activeIndex = index;
        this.dispatchEvent(new CustomEvent(
            MDCTabBarFoundation.strings.TAB_ACTIVATED_EVENT,
            {detail: {index}, bubbles: true, cancelable: true}));
      },
    };
  }

  protected firstUpdated() {
    // NOTE: Delay creating foundation until scroller is fully updated.
    // This is necessary because the foundation/adapter synchronously addresses
    // the scroller element.
  }

  protected async getUpdateComplete() {
    const result = await super.getUpdateComplete();
    await this.scrollerElement.updateComplete;
    if (this.mdcFoundation === undefined) {
      this.createFoundation();
    }
    return result;
  }

  scrollIndexIntoView(index: number) {
    this.mdcFoundation.scrollIntoView(index);
  }
}
