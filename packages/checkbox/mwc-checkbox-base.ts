/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '@material/mwc-ripple/mwc-ripple';

import {ariaProperty} from '@material/mwc-base/aria-property';
import {FormElement} from '@material/mwc-base/form-element';
import {Ripple} from '@material/mwc-ripple/mwc-ripple';
import {RippleHandlers} from '@material/mwc-ripple/ripple-handlers';
import {eventOptions, html, property, PropertyValues, query, queryAsync, state, TemplateResult} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {ifDefined} from 'lit-html/directives/if-defined';

/** @soyCompatible */
export class CheckboxBase extends FormElement {
  @query('.mdc-checkbox') protected mdcRoot!: HTMLElement;

  @query('input') protected formElement!: HTMLInputElement;

  @property({type: Boolean, reflect: true}) checked = false;

  @property({type: Boolean}) indeterminate = false;

  @property({type: Boolean, reflect: true}) disabled = false;

  @property({type: String, reflect: true}) name = '';

  @property({type: String}) value = 'on';

  /** @soyPrefixAttribute */
  @ariaProperty
  @property({type: String, attribute: 'aria-label'})
  ariaLabel?: string;

  /** @soyPrefixAttribute */
  @ariaProperty
  @property({type: String, attribute: 'aria-labelledby'})
  ariaLabelledBy?: string;

  /** @soyPrefixAttribute */
  @ariaProperty
  @property({type: String, attribute: 'aria-describedby'})
  ariaDescribedBy?: string;

  /**
   * Touch target extends beyond visual boundary of a component by default.
   * Set to `true` to remove touch target added to the component.
   * @see https://material.io/design/usability/accessibility.html
   */
  @property({type: Boolean}) reducedTouchTarget = false;

  @state() protected animationClass = '';

  @state() protected shouldRenderRipple = false;

  @state() protected focused = false;

  @state() protected useStateLayerCustomProperties = false;

  @queryAsync('mwc-ripple') ripple!: Promise<Ripple|null>;

  // MDC Foundation is unused
  protected mdcFoundationClass = undefined;

  protected mdcFoundation = undefined;

  protected createAdapter() {
    return {};
  }

  protected update(changedProperties: PropertyValues) {
    const oldIndeterminate = changedProperties.get('indeterminate');
    const oldChecked = changedProperties.get('checked');
    const oldDisabled = changedProperties.get('disabled');
    if (oldIndeterminate !== undefined || oldChecked !== undefined ||
        oldDisabled !== undefined) {
      const oldState = this.calculateAnimationStateName(
          !!oldChecked, !!oldIndeterminate, !!oldDisabled);
      const newState = this.calculateAnimationStateName(
          this.checked, this.indeterminate, this.disabled);
      this.animationClass = `${oldState}-${newState}`;
    }
    super.update(changedProperties);
  }

  protected calculateAnimationStateName(
      checked: boolean, indeterminate: boolean, disabled: boolean): string {
    if (disabled) {
      return 'disabled';
    } else if (indeterminate) {
      return 'indeterminate';
    } else if (checked) {
      return 'checked';
    } else {
      return 'unchecked';
    }
  }

  protected rippleElement: Ripple|null = null;

  protected rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this.shouldRenderRipple = true;
    this.ripple.then((v) => this.rippleElement = v);
    return this.ripple;
  });

  // TODO(dfreedm): Make this use selected as a param after Polymer/internal#739
  /** @soyTemplate */
  protected renderRipple(): TemplateResult|string {
    return this.shouldRenderRipple ? html`<mwc-ripple
        .disabled="${this.disabled}"
        .internalUseStateLayerCustomProperties="${
                                         this.useStateLayerCustomProperties}"
        unbounded></mwc-ripple>` :
                                     '';
  }

  /**
   * @soyTemplate
   * @soyAttributes checkboxAttributes: input
   * @soyClasses checkboxClasses: .mdc-checkbox
   */
  protected render(): TemplateResult {
    const selected = this.indeterminate || this.checked;
    /* eslint-disable eqeqeq */
    // tslint:disable:triple-equals
    /** @classMap */
    const classes = {
      'mdc-checkbox--disabled': this.disabled,
      'mdc-checkbox--selected': selected,
      'mdc-checkbox--touch': !this.reducedTouchTarget,
      'mdc-ripple-upgraded--background-focused': this.focused,
      // transition animiation classes
      'mdc-checkbox--anim-checked-indeterminate':
          this.animationClass == 'checked-indeterminate',
      'mdc-checkbox--anim-checked-unchecked':
          this.animationClass == 'checked-unchecked',
      'mdc-checkbox--anim-indeterminate-checked':
          this.animationClass == 'indeterminate-checked',
      'mdc-checkbox--anim-indeterminate-unchecked':
          this.animationClass == 'indeterminate-unchecked',
      'mdc-checkbox--anim-unchecked-checked':
          this.animationClass == 'unchecked-checked',
      'mdc-checkbox--anim-unchecked-indeterminate':
          this.animationClass == 'unchecked-indeterminate',
    };
    // tslint:enable:triple-equals
    /* eslint-enable eqeqeq */
    const ariaChecked = this.indeterminate ? 'mixed' : undefined;
    return html`
      <div class="mdc-checkbox mdc-checkbox--upgraded ${classMap(classes)}">
        <input type="checkbox"
              class="mdc-checkbox__native-control"
              name="${ifDefined(this.name)}"
              aria-checked="${ifDefined(ariaChecked)}"
              aria-label="${ifDefined(this.ariaLabel)}"
              aria-labelledby="${ifDefined(this.ariaLabelledBy)}"
              aria-describedby="${ifDefined(this.ariaDescribedBy)}"
              data-indeterminate="${this.indeterminate ? 'true' : 'false'}"
              ?disabled="${this.disabled}"
              .indeterminate="${this.indeterminate}"
              .checked="${this.checked}"
              .value="${this.value}"
              @change="${this.handleChange}"
              @focus="${this.handleFocus}"
              @blur="${this.handleBlur}"
              @mousedown="${this.handleRippleMouseDown}"
              @mouseenter="${this.handleRippleMouseEnter}"
              @mouseleave="${this.handleRippleMouseLeave}"
              @touchstart="${this.handleRippleTouchStart}"
              @touchend="${this.handleRippleDeactivate}"
              @touchcancel="${this.handleRippleDeactivate}">
        <div class="mdc-checkbox__background"
          @animationend="${this.resetAnimationClass}">
          <svg class="mdc-checkbox__checkmark"
              viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path"
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
        ${this.renderRipple()}
      </div>`;
  }

  protected formDataCallback(formData: FormData) {
    if (this.checked) {
      super.formDataCallback(formData);
    }
  }

  protected handleFocus() {
    this.focused = true;
    this.handleRippleFocus();
  }

  protected handleBlur() {
    this.focused = false;
    this.handleRippleBlur();
  }

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

  protected handleChange() {
    this.checked = this.formElement.checked;
    this.indeterminate = this.formElement.indeterminate;
  }

  protected resetAnimationClass() {
    this.animationClass = '';
  }

  get isRippleActive() {
    return this.rippleElement?.isActive || false;
  }
}
