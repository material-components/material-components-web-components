/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '@material/mwc-list';
import './mwc-menu-surface';

import {MDCMenuAdapter} from '@material/menu/adapter';
import {DefaultFocusState as DefaultFocusStateEnum} from '@material/menu/constants';
import MDCMenuFoundation from '@material/menu/foundation';
import {BaseElement} from '@material/mwc-base/base-element';
import {observer} from '@material/mwc-base/observer';
import {List, MWCListIndex} from '@material/mwc-list';
import {ActionDetail} from '@material/mwc-list/mwc-list-foundation';
import {ListItemBase} from '@material/mwc-list/mwc-list-item-base';
import {html, property, query} from 'lit-element';

import {MenuSurface} from './mwc-menu-surface';
import {Corner, MenuCorner} from './mwc-menu-surface-base';

export {ActionDetail, createSetFromIndex, isEventMulti, isIndexSet, MWCListIndex, SelectedDetail} from '@material/mwc-list/mwc-list-foundation';
export {Corner, MenuCorner} from './mwc-menu-surface-base';

export type DefaultFocusState = keyof typeof DefaultFocusStateEnum;

/**
 * @fires selected {SelectedDetail}
 * @fires action {ActionDetail}
 * @fires items-updated
 * @fires opened
 * @fires closed
 */
export abstract class MenuBase extends BaseElement {
  protected mdcFoundation!: MDCMenuFoundation;

  protected readonly mdcFoundationClass = MDCMenuFoundation;

  protected listElement_: List|null = null;

  @query('.mdc-menu') mdcRoot!: MenuSurface;

  @query('slot') slotElement!: HTMLSlotElement|null;

  @property({type: Object}) anchor: HTMLElement|null = null;

  @property({type: Boolean, reflect: true}) open = false;

  @property({type: Boolean}) quick = false;

  @property({type: Boolean}) wrapFocus = false;

  @property({type: String}) innerRole: 'menu'|'listbox' = 'menu';

  @property({type: String}) corner: Corner = 'TOP_START';

  @property({type: Number}) x: number|null = null;

  @property({type: Number}) y: number|null = null;

  @property({type: Boolean}) absolute = false;

  @property({type: Boolean}) multi = false;

  @property({type: Boolean}) activatable = false;

  @property({type: Boolean}) fixed = false;

  @property({type: Boolean}) forceGroupSelection = false;

  @property({type: Boolean}) fullwidth = false;

  @property({type: String}) menuCorner: MenuCorner = 'START';

  @property({type: Boolean}) stayOpenOnBodyClick: boolean = false;

  @property({type: String})
  @observer(function(this: MenuBase, value: DefaultFocusState) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setDefaultFocusState(DefaultFocusStateEnum[value]);
    }
  })
  defaultFocus: DefaultFocusState = 'LIST_ROOT';

  protected _listUpdateComplete: null|Promise<unknown> = null;

  protected get listElement() {
    if (!this.listElement_) {
      this.listElement_ = this.renderRoot.querySelector('mwc-list');
      return this.listElement_;
    }

    return this.listElement_;
  }

  get items(): ListItemBase[] {
    const listElement = this.listElement;

    if (listElement) {
      return listElement.items;
    }

    return [];
  }

  get index(): MWCListIndex {
    const listElement = this.listElement;

    if (listElement) {
      return listElement.index;
    }

    return -1;
  }

  get selected(): ListItemBase|ListItemBase[]|null {
    const listElement = this.listElement;

    if (listElement) {
      return listElement.selected;
    }

    return null;
  }

  render() {
    const itemRoles = this.innerRole === 'menu' ? 'menuitem' : 'option';

    return html`
      <mwc-menu-surface
          ?hidden=${!this.open}
          .anchor=${this.anchor}
          .open=${this.open}
          .quick=${this.quick}
          .corner=${this.corner}
          .x=${this.x}
          .y=${this.y}
          .absolute=${this.absolute}
          .fixed=${this.fixed}
          .fullwidth=${this.fullwidth}
          .menuCorner=${this.menuCorner}
          ?stayOpenOnBodyClick=${this.stayOpenOnBodyClick}
          class="mdc-menu mdc-menu-surface"
          @closed=${this.onClosed}
          @opened=${this.onOpened}
          @keydown=${this.onKeydown}>
        <mwc-list
          rootTabbable
          .innerRole=${this.innerRole}
          .multi=${this.multi}
          class="mdc-deprecated-list"
          .itemRoles=${itemRoles}
          .wrapFocus=${this.wrapFocus}
          .activatable=${this.activatable}
          @action=${this.onAction}>
        <slot></slot>
      </mwc-list>
    </mwc-menu-surface>`;
  }

  protected createAdapter(): MDCMenuAdapter {
    return {
      addClassToElementAtIndex: (index, className) => {
        const listElement = this.listElement;
        if (!listElement) {
          return;
        }

        const element = listElement.items[index];

        if (!element) {
          return;
        }

        if (className === 'mdc-menu-item--selected') {
          if (this.forceGroupSelection && !element.selected) {
            listElement.toggle(index, true);
          }
        } else {
          element.classList.add(className);
        }
      },
      removeClassFromElementAtIndex: (index, className) => {
        const listElement = this.listElement;
        if (!listElement) {
          return;
        }

        const element = listElement.items[index];

        if (!element) {
          return;
        }

        if (className === 'mdc-menu-item--selected') {
          if (element.selected) {
            listElement.toggle(index, false);
          }
        } else {
          element.classList.remove(className);
        }
      },
      addAttributeToElementAtIndex: (index, attr, value) => {
        const listElement = this.listElement;
        if (!listElement) {
          return;
        }

        const element = listElement.items[index];

        if (!element) {
          return;
        }

        element.setAttribute(attr, value);
      },
      removeAttributeFromElementAtIndex: (index, attr) => {
        const listElement = this.listElement;
        if (!listElement) {
          return;
        }

        const element = listElement.items[index];

        if (!element) {
          return;
        }

        element.removeAttribute(attr);
      },
      elementContainsClass: (element, className) =>
          element.classList.contains(className),
      closeSurface: () => {
        if (!this.multi) {
          this.open = false;
        }
      },
      getElementIndex: (element) => {
        const listElement = this.listElement;
        if (listElement) {
          return listElement.items.indexOf(element as ListItemBase);
        }

        return -1;
      },
      notifySelected: () => { /** handled by list */ },
      getMenuItemCount: () => {
        const listElement = this.listElement;
        if (!listElement) {
          return 0;
        }

        return listElement.items.length;
      },
      focusItemAtIndex: (index) => {
        const listElement = this.listElement;
        if (!listElement) {
          return;
        }
        const element = listElement.items[index];

        if (element) {
          (element as HTMLElement).focus();
        }
      },
      focusListRoot: () => {
        if (this.listElement) {
          this.listElement.focus();
        }
      },
      getSelectedSiblingOfItemAtIndex: (index) => {
        const listElement = this.listElement;

        if (!listElement) {
          return -1;
        }

        const elementAtIndex = listElement.items[index];

        if (!elementAtIndex || !elementAtIndex.group) {
          return -1;
        }

        for (let i = 0; i < listElement.items.length; i++) {
          if (i === index) {
            continue;
          }

          const current = listElement.items[i];
          if (current.selected && current.group === elementAtIndex.group) {
            return i;
          }
        }

        return -1;
      },
      isSelectableItemAtIndex: (index) => {
        const listElement = this.listElement;

        if (!listElement) {
          return false;
        }

        const elementAtIndex = listElement.items[index];

        if (!elementAtIndex) {
          return false;
        }

        return elementAtIndex.hasAttribute('group');
      },
    };
  }

  protected onKeydown(evt: KeyboardEvent) {
    if (this.mdcFoundation) {
      this.mdcFoundation.handleKeydown(evt);
    }
  }

  protected onAction(evt: CustomEvent<ActionDetail>) {
    const listElement = this.listElement;
    if (this.mdcFoundation && listElement) {
      const index = evt.detail.index;

      const el = listElement.items[index];

      if (el) {
        this.mdcFoundation.handleItemAction(el);
      }
    }
  }

  protected onOpened() {
    this.open = true;

    if (this.mdcFoundation) {
      this.mdcFoundation.handleMenuSurfaceOpened();
    }
  }

  protected onClosed() {
    this.open = false;
  }

  // tslint:disable:ban-ts-ignore
  protected async getUpdateComplete() {
    await this._listUpdateComplete;
    // @ts-ignore
    const result = await super.getUpdateComplete();
    return result;
  }
  // tslint:enable:ban-ts-ignore

  protected async firstUpdated() {
    super.firstUpdated();
    const listElement = this.listElement;

    if (listElement) {
      this._listUpdateComplete = listElement.updateComplete;
      await this._listUpdateComplete;
    }
  }

  select(index: MWCListIndex) {
    const listElement = this.listElement;

    if (listElement) {
      listElement.select(index);
    }
  }

  close() {
    this.open = false;
  }

  show() {
    this.open = true;
  }

  getFocusedItemIndex() {
    const listElement = this.listElement;

    if (listElement) {
      return listElement.getFocusedItemIndex();
    }

    return -1;
  }

  focusItemAtIndex(index: number) {
    const listElement = this.listElement;

    if (listElement) {
      listElement.focusItemAtIndex(index);
    }
  }

  layout(updateItems = true) {
    const listElement = this.listElement;

    if (listElement) {
      listElement.layout(updateItems);
    }
  }
}
