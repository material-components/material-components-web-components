/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {addHasRemoveClass, BaseElement, CustomEventListener, EventType, SpecificEventListener} from './base-element';
import {RippleInterface} from './utils';

export {
  addHasRemoveClass,
  BaseElement,
  CustomEventListener,
  EventType,
  RippleInterface,
  SpecificEventListener
};

declare global {
  interface FormDataEvent extends Event {
    formData: FormData;
  }

  interface HTMLElementEventMap {
    formdata: FormDataEvent;
  }
}

/** @soyCompatible */
export abstract class FormElement extends BaseElement {
  static shadowRootOptions:
      ShadowRootInit = {mode: 'open', delegatesFocus: true};

  /**
   * Form-capable element in the component ShadowRoot.
   *
   * Define in your component with the `@query` decorator
   */
  protected abstract formElement: HTMLInputElement;

  /**
   * Name of the component for form submission
   */
  abstract name: string;
  /**
   * Value of the component for form submission
   */
  abstract value: string;
  abstract disabled: boolean;

  /**
   * Implement ripple getter for Ripple integration with mwc-formfield
   */
  readonly ripple?: Promise<RippleInterface|null>;

  /**
   * Form element that contains this element
   */
  protected containingForm: HTMLFormElement|null = null;
  protected formDataListener = (ev: FormDataEvent) => {
    this.formDataCallback(ev.formData);
  };

  protected findFormElement(): HTMLFormElement|null {
    const root = this.getRootNode() as HTMLElement;
    const forms = root.querySelectorAll('form');
    for (const form of Array.from(forms)) {
      if (form.contains(this)) {
        return form;
      }
    }
    return null;
  }

  /**
   * This callback is called when the containing form element is submitting.
   * Override this callback to change what information is submitted with the
   * form
   */
  protected formDataCallback(formData: FormData) {
    if (!this.disabled && this.name) {
      formData.append(this.name, this.value);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.shadowRoot) {
      return;
    }
    this.containingForm = this.findFormElement();
    this.containingForm?.addEventListener('formdata', this.formDataListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.containingForm !== null) {
      this.containingForm.removeEventListener(
          'formdata', this.formDataListener);
      this.containingForm = null;
    }
  }

  click() {
    if (this.formElement) {
      this.formElement.focus();
      this.formElement.click();
    }
  }

  protected firstUpdated() {
    super.firstUpdated();
    if (this.shadowRoot) {
      this.mdcRoot.addEventListener('change', (e) => {
        this.dispatchEvent(new Event('change', e));
      });
    }
  }
}
