/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '@material/mwc-ripple/mwc-ripple';

import {ariaProperty} from '@material/mwc-base/aria-property';
import {addHasRemoveClass, FormElement} from '@material/mwc-base/form-element';
import {observer} from '@material/mwc-base/observer';
import {Ripple} from '@material/mwc-ripple/mwc-ripple';
import {RippleHandlers} from '@material/mwc-ripple/ripple-handlers';
import {MDCSwitchAdapter} from '@material/switch/deprecated/adapter';
import MDCSwitchFoundation from '@material/switch/deprecated/foundation';
import {eventOptions, html, property, query, queryAsync, state} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

export class SwitchBase extends FormElement {
  @property({type: Boolean})
  @observer(function(this: SwitchBase, value: boolean) {
    this.mdcFoundation.setChecked(value);
  })
  checked = false;

  @property({type: Boolean})
  @observer(function(this: SwitchBase, value: boolean) {
    this.mdcFoundation.setDisabled(value);
  })
  disabled = false;

  /** @soyPrefixAttribute */
  @ariaProperty @property({attribute: 'aria-label'}) ariaLabel?: string;

  /** @soyPrefixAttribute */
  @ariaProperty
  @property({attribute: 'aria-labelledby'})
  ariaLabelledBy?: string;

  @query('.mdc-switch') protected mdcRoot!: HTMLElement;

  @query('input') protected formElement!: HTMLInputElement;

  @queryAsync('mwc-ripple') ripple!: Promise<Ripple|null>;

  @state() protected shouldRenderRipple = false;

  protected mdcFoundation!: MDCSwitchFoundation;

  protected changeHandler(e: Event) {
    this.mdcFoundation.handleChange(e);
    // catch "click" event and sync properties
    this.checked = this.formElement.checked;
  }

  protected readonly mdcFoundationClass = MDCSwitchFoundation;

  protected createAdapter(): MDCSwitchAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      setNativeControlChecked: (checked: boolean) => {
        this.formElement.checked = checked;
      },
      setNativeControlDisabled: (disabled: boolean) => {
        this.formElement.disabled = disabled;
      },
      setNativeControlAttr: (attr, value) => {
        this.formElement.setAttribute(attr, value);
      },
    };
  }

  protected rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this.shouldRenderRipple = true;
    return this.ripple;
  });

  protected renderRipple() {
    return this.shouldRenderRipple ? html`
        <mwc-ripple
          .accent="${this.checked}"
          .disabled="${this.disabled}"
          unbounded>
        </mwc-ripple>` :
                                     '';
  }

  focus() {
    const formElement = this.formElement;
    if (formElement) {
      this.rippleHandlers.startFocus();
      formElement.focus();
    }
  }

  blur() {
    const formElement = this.formElement;
    if (formElement) {
      this.rippleHandlers.endFocus();
      formElement.blur();
    }
  }

  protected render() {
    return html`
      <div class="mdc-switch">
        <div class="mdc-switch__track"></div>
        <div class="mdc-switch__thumb-underlay">
          ${this.renderRipple()}
          <div class="mdc-switch__thumb">
            <input
              type="checkbox"
              id="basic-switch"
              class="mdc-switch__native-control"
              role="switch"
              aria-label="${ifDefined(this.ariaLabel)}"
              aria-labelledby="${ifDefined(this.ariaLabelledBy)}"
              @change="${this.changeHandler}"
              @focus="${this.handleRippleFocus}"
              @blur="${this.handleRippleBlur}"
              @mousedown="${this.handleRippleMouseDown}"
              @mouseenter="${this.handleRippleMouseEnter}"
              @mouseleave="${this.handleRippleMouseLeave}"
              @touchstart="${this.handleRippleTouchStart}"
              @touchend="${this.handleRippleDeactivate}"
              @touchcancel="${this.handleRippleDeactivate}">
          </div>
        </div>
      </div>`;
  }

  @eventOptions({passive: true})
  protected handleRippleMouseDown(event: Event) {
    const onUp = () => {
      window.removeEventListener('mouseup', onUp);

      this.handleRippleDeactivate();
    };

    window.addEventListener('mouseup', onUp);
    this.rippleHandlers.startPress(event);
  }

  @eventOptions({passive: true})
  protected handleRippleTouchStart(event: Event) {
    this.rippleHandlers.startPress(event);
  }

  protected handleRippleDeactivate() {
    this.rippleHandlers.endPress();
  }

  protected handleRippleMouseEnter() {
    this.rippleHandlers.startHover();
  }

  protected handleRippleMouseLeave() {
    this.rippleHandlers.endHover();
  }

  protected handleRippleFocus() {
    this.rippleHandlers.startFocus();
  }

  protected handleRippleBlur() {
    this.rippleHandlers.endFocus();
  }
}
