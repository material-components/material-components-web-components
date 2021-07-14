/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {FormElement} from '@material/mwc-base/form-element';
import {customElement, LitElement, property, query} from 'lit-element';
import {html} from 'lit-html';

import {fixture, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

interface FormElementInternals {
  containingForm: HTMLFormElement|null;
}

interface FormDataEvent extends Event {
  formData: FormData;
}

@customElement('test-form-element')
class TestFormElement extends FormElement {
  @query('#root') protected mdcRoot!: HTMLElement;
  @query('#input') protected formElement!: HTMLInputElement;
  disabled = false;
  name = '';
  value = '';

  protected mdcFoundation = undefined;
  protected mdcFoundationClass = undefined;
  protected createAdapter() {
    return {};
  }

  render() {
    return html`
      <label id="root" for="input">
        <input type="text" id="input"></input>
      </label>
    `;
  }
}

@customElement('custom-click-form-element')
class CustomClickFormElement extends FormElement {
  @query('#root') protected mdcRoot!: HTMLElement;
  @query('#indirect') indirectFormElement!: HTMLInputElement;
  @query('#direct') protected formElement!: HTMLInputElement;
  disabled = false;
  name = '';
  value = '';

  protected mdcFoundation = undefined;
  protected mdcFoundationClass = undefined;
  protected createAdapter() {
    return {};
  }
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  click() {
    if (this.indirectFormElement) {
      this.indirectFormElement.click();
    }
  }

  render() {
    return html`
      <section id="root">
        <label id="label_direct" for="direct">
          <input type="text" id="direct"></input>
        </label>
        <label id="label_indirect" for="indirect">
          <input type="text" id="indirect"></input>
        </label>
      </section>
    `;
  }
}

@customElement('form-submission')
class FormSubmission extends FormElement {
  @property() name = 'foo';
  @property() value = 'bar';
  @property({type: Boolean}) disabled = false;
  @query('input') protected formElement!: HTMLInputElement;
  @query('input') protected mdcRoot!: HTMLElement;

  protected mdcFoundation = undefined;
  protected mdcFoundationClass = undefined;
  protected createAdapter() {
    return {};
  }

  render() {
    return html`<input value="${this.value}" ?disabled="${
        this.disabled}" name="${this.name}"></input>`;
  }
}

const testFormElement = html`
  <test-form-element></test-form-element>
`;

const testClickFormElement = html`
  <custom-click-form-element></custom-click-form-element>
`;

const testFormSubmission =
    html`<form><form-submission></form-submission></form>`;

describe('form-element:', () => {
  describe('test-form-element', () => {
    let fixt: TestFixture;
    let component: TestFormElement|null;
    let formElement: HTMLElement|null;

    beforeEach(async () => {
      fixt = await fixture(testFormElement);
      component = fixt.root.querySelector('test-form-element');

      if (component !== null && component.shadowRoot !== null) {
        formElement = component.shadowRoot.querySelector('#input');
      }
    });

    afterEach(async () => {
      if (fixt) {
        fixt.remove();
      }
    });

    it('is an instance of form-element', () => {
      expect(component).toBeInstanceOf(TestFormElement);
      expect(component).toBeInstanceOf(FormElement);
    });

    it('shadowRoot focuses on formElement after click', async () => {
      if (component === null) {
        expect(component).not.toBeNull();
        return;
      }
      if (component.shadowRoot === null) {
        expect(component.shadowRoot).not.toBeNull();
        return;
      }
      if (formElement === null) {
        expect(formElement).not.toBeNull();
        return;
      }

      component.click();
      await component.updateComplete;

      expect(component.shadowRoot.activeElement).toEqual(formElement);
    });
  });

  describe('custom-click-form-element', () => {
    let fixt: TestFixture;
    let component: CustomClickFormElement|null;
    let formElement: HTMLElement|null;
    let indirectFormElement: HTMLElement|null;

    beforeEach(async () => {
      fixt = await fixture(testClickFormElement);
      component = fixt.root.querySelector('custom-click-form-element');

      if (component !== null && component.shadowRoot !== null) {
        formElement = component.shadowRoot.querySelector('#direct');
        indirectFormElement = component.shadowRoot.querySelector('#indirect');
      }
    });

    afterEach(async () => {
      if (fixt) {
        fixt.remove();
      }
    });

    it('is a descendant of FormElement', () => {
      expect(component).toBeInstanceOf(FormElement);
    });

    it('shadowRoot should not focus on #indirect after click', async () => {
      if (component === null) {
        expect(component).not.toBeNull();
        return;
      }
      if (component.shadowRoot === null) {
        expect(component.shadowRoot).not.toBeNull();
        return;
      }
      if (indirectFormElement === null) {
        expect(indirectFormElement).not.toBeNull();
        return;
      }

      component.click();
      await component.updateComplete;

      expect(component.shadowRoot.activeElement)
          .not.toEqual(indirectFormElement);
    });

    it('shadowRoot should not focus on #root after click', async () => {
      if (component === null) {
        expect(component).not.toBeNull();
        return;
      }
      if (component.shadowRoot === null) {
        expect(component.shadowRoot).not.toBeNull();
        return;
      }
      if (formElement === null) {
        expect(formElement).not.toBeNull();
        return;
      }

      component.click();
      await component.updateComplete;

      expect(component.shadowRoot.activeElement).not.toEqual(formElement);
    });
  });

  describe('form submission', () => {
    let fixt: TestFixture;
    let component: FormSubmission;
    let form: HTMLFormElement;

    // IE11 can only append to FormData, not inspect it
    const canInspectFormData = Boolean(FormData.prototype.get);

    beforeEach(async () => {
      fixt = await fixture(testFormSubmission);
      component = fixt.root.querySelector('form-submission')!;
      form = fixt.root.querySelector('form')!;

      await component.updateComplete;
    });

    afterEach(() => {
      fixt?.remove();
    });

    it('finds the form element container', () => {
      expect((component as unknown as FormElementInternals).containingForm)
          .toEqual(form);
    });

    it('resets containingForm on disconnect', () => {
      component.remove();
      expect((component as unknown as FormElementInternals).containingForm)
          .toBeNull();
    });

    it('reports name and value on "formdata" event', () => {
      if (!canInspectFormData) {
        return;
      }
      const formData = simulateFormDataEvent(form);
      expect(formData.get('foo')).toEqual('bar');
    });

    it('does not report when the component is disabled', async () => {
      if (!canInspectFormData) {
        return;
      }
      component.disabled = true;
      await component.updateComplete;
      const formData = simulateFormDataEvent(form);
      expect(formData.get('foo')).toBeNull();
    });

    it('does not report when name is not set', async () => {
      if (!canInspectFormData) {
        return;
      }
      component.name = '';
      await component.updateComplete;
      const formData = simulateFormDataEvent(form);
      const keys = Array.from(formData.keys());
      expect(keys.length).toEqual(0);
    });
  });
});
