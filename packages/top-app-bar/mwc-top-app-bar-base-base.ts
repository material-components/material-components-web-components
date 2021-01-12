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
import {addHasRemoveClass, BaseElement} from '@material/mwc-base/base-element';
import {supportsPassiveEventListener} from '@material/mwc-base/utils';
import {MDCTopAppBarAdapter} from '@material/top-app-bar/adapter';
import {strings} from '@material/top-app-bar/constants';
import MDCTopAppBarBaseFoundation from '@material/top-app-bar/foundation';
import {html, property, query} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';

export const passiveEventOptionsIfSupported =
    supportsPassiveEventListener ? {passive: true} : undefined;

interface ClassInfo {
  [key: string]: boolean;
}

export abstract class TopAppBarBaseBase extends BaseElement {
  protected abstract mdcFoundation: MDCTopAppBarBaseFoundation;

  protected abstract mdcFoundationClass = MDCTopAppBarBaseFoundation;

  @query('.mdc-top-app-bar') protected mdcRoot!: HTMLElement;

  // _actionItemsSlot should have type HTMLSlotElement, but when TypeScript's
  // emitDecoratorMetadata is enabled, the HTMLSlotElement constructor will
  // be emitted into the runtime, which will cause an "HTMLSlotElement is
  // undefined" error in browsers that don't define it (e.g. IE11).
  @query('slot[name="actionItems"]') private _actionItemsSlot!: HTMLElement;

  private _scrollTarget!: HTMLElement|Window;

  @property({type: Boolean}) centerTitle = false;

  @property({type: Object})
  get scrollTarget() {
    return this._scrollTarget || window;
  }

  set scrollTarget(value) {
    this.unregisterScrollListener();
    const old = this.scrollTarget;
    this._scrollTarget = value;
    this.updateRootPosition();
    this.requestUpdate('scrollTarget', old);
    this.registerScrollListener();
  }

  private updateRootPosition() {
    if (this.mdcRoot) {
      const windowScroller = this.scrollTarget === window;
      // we add support for top-app-bar's tied to an element scroller.
      this.mdcRoot.style.position = windowScroller ? '' : 'absolute';
    }
  }

  /**
   * classMap map for classes on the bar
   */
  protected abstract barClasses(): ClassInfo;

  /**
   * classMap map for classes on the content slot
   */
  protected abstract contentClasses(): ClassInfo;

  protected render() {
    // clang-format off
    let title = html`<span class="mdc-top-app-bar__title"><slot name="title"></slot></span>`;
    if (this.centerTitle) {
      title = html`<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-center">${title}</section>`;
    }
    // clang-format on
    return html`
      <header class="mdc-top-app-bar ${classMap(this.barClasses())}">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start" id="navigation">
          <slot name="navigationIcon"
            @click=${this.handleNavigationClick}></slot>
          ${this.centerTitle ? null : title}
        </section>
        ${this.centerTitle ? title : null}
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" id="actions" role="toolbar">
          <slot name="actionItems"></slot>
        </section>
      </div>
    </header>
    <div class="${classMap(this.contentClasses())}">
      <slot></slot>
    </div>
    `;
  }

  protected createAdapter(): MDCTopAppBarAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      setStyle: (property: string, value: string) =>
          this.mdcRoot.style.setProperty(property, value),
      getTopAppBarHeight: () => this.mdcRoot.clientHeight,
      notifyNavigationIconClicked: () => {
        this.dispatchEvent(new Event(
            strings.NAVIGATION_EVENT, {bubbles: true, cancelable: true}));
      },
      getViewportScrollY: () => this.scrollTarget instanceof Window ?
          this.scrollTarget.pageYOffset :
          this.scrollTarget.scrollTop,
      getTotalActionItems: () => (this._actionItemsSlot as HTMLSlotElement)
                                     .assignedNodes({flatten: true})
                                     .length,
    };
  }

  protected handleTargetScroll = () => {
    this.mdcFoundation.handleTargetScroll();
  };

  protected handleNavigationClick = () => {
    this.mdcFoundation.handleNavigationClick();
  };

  protected registerListeners() {
    this.registerScrollListener();
  }

  protected unregisterListeners() {
    this.unregisterScrollListener();
  }

  protected registerScrollListener() {
    this.scrollTarget.addEventListener(
        'scroll', this.handleTargetScroll, passiveEventOptionsIfSupported);
  }

  protected unregisterScrollListener() {
    this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
  }

  protected firstUpdated() {
    super.firstUpdated();
    this.updateRootPosition();
    this.registerListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unregisterListeners();
  }
}
