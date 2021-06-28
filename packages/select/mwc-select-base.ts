/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '@material/mwc-notched-outline';
import '@material/mwc-menu';
import '@material/mwc-icon';

import {KEY, normalizeKey} from '@material/dom/keyboard';
import {MDCFloatingLabelFoundation} from '@material/floating-label/foundation';
import {MDCLineRippleFoundation} from '@material/line-ripple/foundation';
import * as typeahead from '@material/list/typeahead';
import {MDCListTextAndIndex} from '@material/list/types';
import {addHasRemoveClass, FormElement} from '@material/mwc-base/form-element';
import {observer} from '@material/mwc-base/observer';
import {isNodeElement} from '@material/mwc-base/utils';
import {floatingLabel, FloatingLabel} from '@material/mwc-floating-label';
import {lineRipple, LineRipple} from '@material/mwc-line-ripple';
import {ListItemBase} from '@material/mwc-list/mwc-list-item-base';
import {Menu} from '@material/mwc-menu';
import {NotchedOutline} from '@material/mwc-notched-outline';
import {MDCSelectAdapter} from '@material/select/adapter';
import MDCSelectFoundation from '@material/select/foundation';
import {eventOptions, html, property, query, state} from 'lit-element';
import {nothing} from 'lit-html';
import {classMap} from 'lit-html/directives/class-map';
import {ifDefined} from 'lit-html/directives/if-defined';

// must be done to get past lit-analyzer checks
declare global {
  interface Element {
    floatingLabelFoundation?: MDCFloatingLabelFoundation;
    lineRippleFoundation?: MDCLineRippleFoundation;
  }
}

type CustomValidityState = {
  -readonly[P in keyof ValidityState]: ValidityState[P]
};

const createValidityObj =
    (customValidity: Partial<ValidityState> = {}): ValidityState => {
      /*
       * We need to make ValidityState an object because it is readonly and
       * we cannot use the spread operator. Also, we don't export
       * `CustomValidityState` because it is a leaky implementation and the user
       * already has access to `ValidityState` in lib.dom.ts. Also an interface
       * {a: Type} can be casted to {readonly a: Type} so passing any object
       * should be fine.
       */
      const objectifiedCustomValidity: Partial<CustomValidityState> = {};

      // eslint-disable-next-line guard-for-in
      for (const propName in customValidity) {
        /*
         * Casting is needed because ValidityState's props are all readonly and
         * thus cannot be set on `onjectifiedCustomValidity`. In the end, the
         * interface is the same as ValidityState (but not readonly), but the
         * function signature casts the output to ValidityState (thus readonly).
         */
        objectifiedCustomValidity[propName as keyof CustomValidityState] =
            customValidity[propName as keyof ValidityState];
      }

      return {
        badInput: false,
        customError: false,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valid: true,
        valueMissing: false,
        ...objectifiedCustomValidity
      };
    };

/**
 * @fires selected {SelectedDetail}
 * @fires action {ActionDetail}
 * @fires opened
 * @fires closed
 * @fires change
 * @fires invalid
 */
export abstract class SelectBase extends FormElement {
  protected mdcFoundation!: MDCSelectFoundation;

  protected readonly mdcFoundationClass = MDCSelectFoundation;

  @query('.mdc-select') protected mdcRoot!: HTMLElement;

  @query('.formElement') protected formElement!: HTMLInputElement;

  @query('slot') protected slotElement!: HTMLSlotElement|null;

  @query('select') protected nativeSelectElement!: HTMLSelectElement|null;

  @query('input') protected nativeInputElement!: HTMLInputElement|null;

  @query('.mdc-line-ripple') protected lineRippleElement!: LineRipple|null;

  @query('.mdc-floating-label') protected labelElement!: FloatingLabel|null;

  @query('mwc-notched-outline') protected outlineElement!: NotchedOutline|null;

  @query('.mdc-menu') protected menuElement!: Menu|null;

  @query('.mdc-select__anchor') protected anchorElement!: HTMLDivElement|null;

  @property({type: Boolean, attribute: 'disabled', reflect: true})
  @observer(function(this: SelectBase, value: boolean) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setDisabled(value);
    }
  })
  disabled = false;

  @property({type: Boolean})
  @observer(function(this: SelectBase, _newVal: boolean, oldVal: boolean) {
    if (oldVal !== undefined && this.outlined !== oldVal) {
      this.layout(false);
    }
  })
  outlined = false;

  @property({type: String})
  @observer(function(this: SelectBase, _newVal: string, oldVal: string) {
    if (oldVal !== undefined && this.label !== oldVal) {
      this.layout(false);
    }
  })
  label = '';

  @state() protected outlineOpen = false;

  @state() protected outlineWidth = 0;

  @property({type: String})
  @observer(function(this: SelectBase, value: string) {
    if (this.mdcFoundation) {
      const initialization = this.selected === null && !!value;
      const valueSetByUser = this.selected && this.selected.value !== value;

      if (initialization || valueSetByUser) {
        this.selectByValue(value);
      }
      this.reportValidity();
    }
  })
  value = '';

  @property() name = '';

  @state() protected selectedText = '';

  @property({type: String}) icon = '';

  @state() protected menuOpen = false;

  @property({type: String}) helper = '';

  @property({type: Boolean}) validateOnInitialRender = false;

  @property({type: String}) validationMessage = '';

  @property({type: Boolean}) required = false;

  @property({type: Boolean}) naturalMenuWidth = false;

  @state() protected isUiValid = true;

  @property({type: Boolean}) fixedMenuPosition = false;

  // Transiently holds current typeahead prefix from user.
  protected typeaheadState = typeahead.initState();
  protected sortedIndexByFirstChar = new Map<string, MDCListTextAndIndex[]>();

  protected menuElement_: Menu|null = null;

  get items(): ListItemBase[] {
    // memoize menuElement to prevent unnecessary querySelector calls.
    if (!this.menuElement_) {
      this.menuElement_ = this.menuElement;
    }

    if (this.menuElement_) {
      return this.menuElement_.items;
    }

    return [];
  }

  get selected(): ListItemBase|null {
    const menuElement = this.menuElement;
    if (menuElement) {
      return menuElement.selected as ListItemBase | null;
    }

    return null;
  }

  get index(): number {
    const menuElement = this.menuElement;
    if (menuElement) {
      return menuElement.index as number;
    }

    return -1;
  }

  protected listeners: ({
    target: Element;
    name: string;
    cb: EventListenerOrEventListenerObject;
  })[] = [];
  protected onBodyClickBound: (evt: MouseEvent) => void = () => undefined;
  protected _menuUpdateComplete: null|Promise<unknown> = null;
  protected get shouldRenderHelperText(): boolean {
    return !!this.helper || !!this.validationMessage;
  }

  protected valueSetDirectly = false;

  validityTransform:
      ((value: string,
        nativeValidity: ValidityState) => Partial<ValidityState>)|null = null;

  protected _validity: ValidityState = createValidityObj();

  get validity(): ValidityState {
    this._checkValidity(this.value);

    return this._validity;
  }

  render() {
    const classes = {
      'mdc-select--disabled': this.disabled,
      'mdc-select--no-label': !this.label,
      'mdc-select--filled': !this.outlined,
      'mdc-select--outlined': this.outlined,
      'mdc-select--with-leading-icon': !!this.icon,
      'mdc-select--required': this.required,
      'mdc-select--invalid': !this.isUiValid,
    };

    const menuClasses = {
      'mdc-select__menu--invalid': !this.isUiValid,
    };

    const labelledby = !!this.label ? 'label' : undefined;
    const describedby = this.shouldRenderHelperText ? 'helper-text' : undefined;

    return html`
      <div
          class="mdc-select ${classMap(classes)}">
        <input
            class="formElement"
            name="${this.name}"
            .value="${this.value}"
            hidden
            ?disabled="${this.disabled}"
            ?required=${this.required}>
        <!-- @ts-ignore -->
        <div class="mdc-select__anchor"
            aria-autocomplete="none"
            role="combobox"
            aria-expanded=${this.menuOpen}
            aria-invalid=${!this.isUiValid}
            aria-haspopup="listbox"
            aria-labelledby=${ifDefined(labelledby)}
            aria-required=${this.required}
            aria-describedby=${ifDefined(describedby)}
            @click=${this.onClick}
            @focus=${this.onFocus}
            @blur=${this.onBlur}
            @keydown=${this.onKeydown}>
          ${this.renderRipple()}
          ${this.outlined ? this.renderOutline() : this.renderLabel()}
          ${this.renderLeadingIcon()}
          <span class="mdc-select__selected-text-container">
            <span class="mdc-select__selected-text">${this.selectedText}</span>
          </span>
          <span class="mdc-select__dropdown-icon">
            <svg
                class="mdc-select__dropdown-icon-graphic"
                viewBox="7 10 10 5"
                focusable="false">
              <polygon
                  class="mdc-select__dropdown-icon-inactive"
                  stroke="none"
                  fill-rule="evenodd"
                  points="7 10 12 15 17 10">
              </polygon>
              <polygon
                  class="mdc-select__dropdown-icon-active"
                  stroke="none"
                  fill-rule="evenodd"
                  points="7 15 12 10 17 15">
              </polygon>
            </svg>
          </span>
          ${this.renderLineRipple()}
        </div>
        <mwc-menu
            innerRole="listbox"
            wrapFocus
            class="mdc-select__menu mdc-menu mdc-menu-surface ${
        classMap(menuClasses)}"
            activatable
            .fullwidth=${
        this.fixedMenuPosition ? false : !this.naturalMenuWidth}
            .open=${this.menuOpen}
            .anchor=${this.anchorElement}
            .fixed=${this.fixedMenuPosition}
            @selected=${this.onSelected}
            @opened=${this.onOpened}
            @closed=${this.onClosed}
            @items-updated=${this.onItemsUpdated}
            @keydown=${this.handleTypeahead}>
          <slot></slot>
        </mwc-menu>
      </div>
      ${this.renderHelperText()}`;
  }

  protected renderRipple() {
    if (this.outlined) {
      return nothing;
    }

    return html`
      <span class="mdc-select__ripple"></span>
    `;
  }

  protected renderOutline() {
    if (!this.outlined) {
      return nothing;
    }

    return html`
      <mwc-notched-outline
          .width=${this.outlineWidth}
          .open=${this.outlineOpen}
          class="mdc-notched-outline">
        ${this.renderLabel()}
      </mwc-notched-outline>`;
  }

  protected renderLabel() {
    if (!this.label) {
      return nothing;
    }

    return html`
      <span
          .floatingLabelFoundation=${
        floatingLabel(this.label) as unknown as MDCFloatingLabelFoundation}
          id="label">${this.label}</span>
    `;
  }

  protected renderLeadingIcon() {
    if (!this.icon) {
      return nothing;
    }

    return html`<mwc-icon class="mdc-select__icon"><div>${
        this.icon}</div></mwc-icon>`;
  }

  protected renderLineRipple() {
    if (this.outlined) {
      return nothing;
    }

    return html`
      <span .lineRippleFoundation=${
        lineRipple() as unknown as MDCLineRippleFoundation}></span>
    `;
  }

  protected renderHelperText() {
    if (!this.shouldRenderHelperText) {
      return nothing;
    }

    const showValidationMessage = this.validationMessage && !this.isUiValid;
    const classes = {
      'mdc-select-helper-text--validation-msg': showValidationMessage,
    };

    return html`
        <p
          class="mdc-select-helper-text ${classMap(classes)}"
          id="helper-text">${
        showValidationMessage ? this.validationMessage : this.helper}</p>`;
  }

  protected createAdapter(): MDCSelectAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      activateBottomLine: () => {
        if (this.lineRippleElement) {
          this.lineRippleElement.lineRippleFoundation.activate();
        }
      },
      deactivateBottomLine: () => {
        if (this.lineRippleElement) {
          this.lineRippleElement.lineRippleFoundation.deactivate();
        }
      },
      hasLabel: () => {
        return !!this.label;
      },
      floatLabel: (shouldFloat) => {
        if (this.labelElement) {
          this.labelElement.floatingLabelFoundation.float(shouldFloat);
        }
      },
      getLabelWidth: () => {
        if (this.labelElement) {
          return this.labelElement.floatingLabelFoundation.getWidth();
        }

        return 0;
      },
      setLabelRequired: (isRequired) => {
        if (this.labelElement) {
          this.labelElement.floatingLabelFoundation.setRequired(isRequired);
        }
      },
      hasOutline: () => this.outlined,
      notchOutline: (labelWidth) => {
        const outlineElement = this.outlineElement;
        if (outlineElement && !this.outlineOpen) {
          this.outlineWidth = labelWidth;
          this.outlineOpen = true;
        }
      },
      closeOutline: () => {
        if (this.outlineElement) {
          this.outlineOpen = false;
        }
      },
      setRippleCenter: (normalizedX) => {
        if (this.lineRippleElement) {
          const foundation = this.lineRippleElement.lineRippleFoundation;
          foundation.setRippleCenter(normalizedX);
        }
      },
      notifyChange: async (value) => {
        if (!this.valueSetDirectly && value === this.value) {
          return;
        }

        this.valueSetDirectly = false;
        this.value = value;
        await this.updateComplete;
        const ev = new Event('change', {bubbles: true});
        this.dispatchEvent(ev);
      },
      setSelectedText: (value) => this.selectedText = value,
      isSelectAnchorFocused: () => {
        const selectAnchorElement = this.anchorElement;

        if (!selectAnchorElement) {
          return false;
        }

        const rootNode =
            selectAnchorElement.getRootNode() as ShadowRoot | Document;

        return rootNode.activeElement === selectAnchorElement;
      },
      getSelectAnchorAttr: (attr) => {
        const selectAnchorElement = this.anchorElement;

        if (!selectAnchorElement) {
          return null;
        }

        return selectAnchorElement.getAttribute(attr);
      },
      setSelectAnchorAttr: (attr, value) => {
        const selectAnchorElement = this.anchorElement;

        if (!selectAnchorElement) {
          return;
        }

        selectAnchorElement.setAttribute(attr, value);
      },
      removeSelectAnchorAttr: (attr) => {
        const selectAnchorElement = this.anchorElement;

        if (!selectAnchorElement) {
          return;
        }

        selectAnchorElement.removeAttribute(attr);
      },
      openMenu: () => {
        this.menuOpen = true;
      },
      closeMenu: () => {
        this.menuOpen = false;
      },
      addMenuClass: () => undefined,
      removeMenuClass: () => undefined,
      getAnchorElement: () => this.anchorElement,
      setMenuAnchorElement: () => {
        /* Handled by anchor directive */
      },
      setMenuAnchorCorner: () => {
        const menuElement = this.menuElement;
        if (menuElement) {
          menuElement.corner = 'BOTTOM_START';
        }
      },
      setMenuWrapFocus: (wrapFocus) => {
        const menuElement = this.menuElement;
        if (menuElement) {
          menuElement.wrapFocus = wrapFocus;
        }
      },
      focusMenuItemAtIndex: (index) => {
        const menuElement = this.menuElement;
        if (!menuElement) {
          return;
        }

        const element = menuElement.items[index];

        if (!element) {
          return;
        }

        (element as HTMLElement).focus();
      },
      getMenuItemCount: () => {
        const menuElement = this.menuElement;

        if (menuElement) {
          return menuElement.items.length;
        }

        return 0;
      },
      getMenuItemValues: () => {
        const menuElement = this.menuElement;

        if (!menuElement) {
          return [];
        }

        const items = menuElement.items;

        return items.map((item) => item.value);
      },
      getMenuItemTextAtIndex: (index) => {
        const menuElement = this.menuElement;
        if (!menuElement) {
          return '';
        }

        const element = menuElement.items[index];

        if (!element) {
          return '';
        }

        return element.text;
      },
      getSelectedIndex: () => this.index,
      setSelectedIndex: () => undefined,
      isTypeaheadInProgress: () =>
          typeahead.isTypingInProgress(this.typeaheadState),
      typeaheadMatchItem: (nextChar, startingIndex) => {
        if (!this.menuElement) {
          return -1;
        }

        const opts: typeahead.TypeaheadMatchItemOpts = {
          focusItemAtIndex: (index) => {
            this.menuElement!.focusItemAtIndex(index);
          },
          focusedItemIndex: startingIndex ?
              startingIndex :
              this.menuElement.getFocusedItemIndex(),
          nextChar,
          sortedIndexByFirstChar: this.sortedIndexByFirstChar,
          skipFocus: false,
          isItemAtIndexDisabled: (index) => this.items[index].disabled,
        };

        const index = typeahead.matchItem(opts, this.typeaheadState);

        if (index !== -1) {
          this.select(index);
        }

        return index;
      },
    };
  }

  checkValidity(): boolean {
    const isValid = this._checkValidity(this.value);

    if (!isValid) {
      const invalidEvent =
          new Event('invalid', {bubbles: false, cancelable: true});
      this.dispatchEvent(invalidEvent);
    }

    return isValid;
  }

  reportValidity(): boolean {
    const isValid = this.checkValidity();

    this.isUiValid = isValid;

    return isValid;
  }

  protected _checkValidity(value: string) {
    const nativeValidity = this.formElement.validity;

    let validity = createValidityObj(nativeValidity);

    if (this.validityTransform) {
      const customValidity = this.validityTransform(value, validity);
      validity = {...validity, ...customValidity};
    }

    this._validity = validity;

    return this._validity.valid;
  }

  setCustomValidity(message: string) {
    this.validationMessage = message;
    this.formElement.setCustomValidity(message);
  }

  // tslint:disable:ban-ts-ignore
  protected async getUpdateComplete() {
    await this._menuUpdateComplete;
    // @ts-ignore
    const result = await super.getUpdateComplete();
    return result;
  }
  // tslint:enable:ban-ts-ignore

  protected async firstUpdated() {
    const menuElement = this.menuElement;

    if (menuElement) {
      this._menuUpdateComplete = menuElement.updateComplete;
      await this._menuUpdateComplete;
    }

    super.firstUpdated();

    this.mdcFoundation.isValid = () => true;
    this.mdcFoundation.setValid = () => undefined;
    this.mdcFoundation.setDisabled(this.disabled);

    if (this.validateOnInitialRender) {
      this.reportValidity();
    }

    // Select an option based on init value
    if (!this.selected) {
      if (!this.items.length && this.slotElement &&
          this.slotElement.assignedNodes({flatten: true}).length) {
        // Shady DOM initial render fix
        await new Promise((res) => requestAnimationFrame(res));
        await this.layout();
      }

      const hasEmptyFirstOption =
          this.items.length && this.items[0].value === '';
      if (!this.value && hasEmptyFirstOption) {
        this.select(0);
        return;
      }

      this.selectByValue(this.value);
    }

    this.sortedIndexByFirstChar = typeahead.initSortedIndex(
        this.items.length, (index) => this.items[index].text);
  }

  protected onItemsUpdated() {
    this.sortedIndexByFirstChar = typeahead.initSortedIndex(
        this.items.length, (index) => this.items[index].text);
  }

  select(index: number) {
    const menuElement = this.menuElement;

    if (menuElement) {
      menuElement.select(index);
    }
  }

  protected selectByValue(value: string) {
    let indexToSelect = -1;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.value === value) {
        indexToSelect = i;
        break;
      }
    }
    this.valueSetDirectly = true;
    this.select(indexToSelect);
    this.mdcFoundation.handleChange();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    for (const listener of this.listeners) {
      listener.target.removeEventListener(listener.name, listener.cb);
    }
  }

  focus() {
    const focusEvt = new CustomEvent('focus');
    const selectAnchorElement = this.anchorElement;

    if (selectAnchorElement) {
      selectAnchorElement.dispatchEvent(focusEvt);
      selectAnchorElement.focus();
    }
  }

  blur() {
    const focusEvt = new CustomEvent('blur');
    const selectAnchorElement = this.anchorElement;

    if (selectAnchorElement) {
      selectAnchorElement.dispatchEvent(focusEvt);
      selectAnchorElement.blur();
    }
  }

  protected onFocus() {
    if (this.mdcFoundation) {
      this.mdcFoundation.handleFocus();
    }
  }

  protected onBlur() {
    if (this.mdcFoundation) {
      this.mdcFoundation.handleBlur();
    }

    const menuElement = this.menuElement;

    if (menuElement && !menuElement.open) {
      this.reportValidity();
    }
  }

  protected onClick(evt: MouseEvent|TouchEvent) {
    if (this.mdcFoundation) {
      this.focus();
      const targetClientRect = (evt.target as Element).getBoundingClientRect();
      let xCoord = 0;

      if ('touches' in evt) {
        xCoord = evt.touches[0].clientX;
      } else {
        xCoord = evt.clientX;
      }

      const normalizedX = xCoord - targetClientRect.left;
      this.mdcFoundation.handleClick(normalizedX);
    }
  }

  protected onKeydown(evt: KeyboardEvent) {
    const arrowUp = normalizeKey(evt) === KEY.ARROW_UP;
    const arrowDown = normalizeKey(evt) === KEY.ARROW_DOWN;

    if (arrowDown || arrowUp) {
      const shouldSelectNextItem = arrowUp && this.index > 0;
      const shouldSelectPrevItem =
          arrowDown && this.index < this.items.length - 1;

      if (shouldSelectNextItem) {
        this.select(this.index - 1);
      } else if (shouldSelectPrevItem) {
        this.select(this.index + 1);
      }
      evt.preventDefault();

      this.mdcFoundation.openMenu();
      return;
    }

    this.mdcFoundation.handleKeydown(evt);
  }

  // must capture to run before list foundation captures event
  @eventOptions({capture: true})
  protected handleTypeahead(event: KeyboardEvent) {
    if (!this.menuElement) {
      return;
    }

    const focusedItemIndex = this.menuElement.getFocusedItemIndex();
    const target = isNodeElement(event.target as Node) ?
        event.target as HTMLElement :
        null;
    const isTargetListItem =
        target ? target.hasAttribute('mwc-list-item') : false;

    const opts: typeahead.HandleKeydownOpts = {
      event,
      focusItemAtIndex: (index) => {
        this.menuElement!.focusItemAtIndex(index);
      },
      focusedItemIndex,
      isTargetListItem,
      sortedIndexByFirstChar: this.sortedIndexByFirstChar,
      isItemAtIndexDisabled: (index) => this.items[index].disabled,
    };

    typeahead.handleKeydown(opts, this.typeaheadState);
  }

  protected async onSelected(event: CustomEvent<{index: number}>) {
    if (!this.mdcFoundation) {
      await this.updateComplete;
    }

    this.mdcFoundation.handleMenuItemAction(event.detail.index);
    const item = this.items[event.detail.index];
    if (item) {
      this.value = item.value;
    }
  }

  protected onOpened() {
    if (this.mdcFoundation) {
      this.menuOpen = true;
      this.mdcFoundation.handleMenuOpened();
    }
  }

  protected onClosed() {
    if (this.mdcFoundation) {
      this.menuOpen = false;
      this.mdcFoundation.handleMenuClosed();
    }
  }

  protected formDataCallback(formData: FormData) {
    if (this.selected !== null) {
      super.formDataCallback(formData);
    }
  }

  async layout(updateItems = true) {
    if (this.mdcFoundation) {
      this.mdcFoundation.layout();
    }

    await this.updateComplete;

    const menuElement = this.menuElement;

    if (menuElement) {
      menuElement.layout(updateItems);
    }

    const labelElement = this.labelElement;

    if (!labelElement) {
      this.outlineOpen = false;
      return;
    }

    const shouldFloat = !!this.label && !!this.value;
    labelElement.floatingLabelFoundation.float(shouldFloat);

    if (!this.outlined) {
      return;
    }

    this.outlineOpen = shouldFloat;
    await this.updateComplete;

    /* When the textfield automatically notches due to a value and label
     * being defined, the textfield may be set to `display: none` by the user.
     * this means that the notch is of size 0px. We provide this function so
     * that the user may manually resize the notch to the floated label's
     * width.
     */
    const labelWidth = labelElement.floatingLabelFoundation.getWidth();
    if (this.outlineOpen) {
      this.outlineWidth = labelWidth;
    }
  }

  async layoutOptions() {
    if (!this.mdcFoundation) {
      return;
    }

    this.mdcFoundation.layoutOptions();
  }
}
