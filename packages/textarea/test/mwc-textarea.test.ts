/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {TextArea} from '@material/mwc-textarea';
import {html} from 'lit-html';

import {fixture, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

const basic = html`
  <mwc-textarea></mwc-textarea>
`;

const withLabel = html`
  <mwc-textarea label="a label"></mwc-textarea>
`;

const textareaInForm = html`
  <form>
    <mwc-textarea name="foo"></mwc-textarea>
  </form>
`;

describe('mwc-textarea:', () => {
  let fixt: TestFixture;

  describe('basic', () => {
    let element: TextArea;
    beforeEach(async () => {
      fixt = await fixture(basic);

      element = fixt.root.querySelector('mwc-textarea')!;
    });

    it('initializes as an mwc-textarea', () => {
      expect(element).toBeInstanceOf(TextArea);
    });

    it('setting value sets on textarea', async () => {
      element.value = 'my test value';
      await element.updateComplete;

      const inputElement = element.shadowRoot!.querySelector('textarea');
      expect(inputElement!.value).toEqual('my test value');
    });

    it('textarea does not have aria-labelledby set', async () => {
      await element.updateComplete;
      const textarea = element.shadowRoot!.querySelector('textarea')!;
      expect(textarea.getAttribute('aria-labelledby')).toBeNull();
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('label', () => {
    let element: TextArea;
    beforeEach(async () => {
      fixt = await fixture(withLabel);

      element = fixt.root.querySelector('mwc-textarea')!;
    });

    it('textarea has aria-labelledby set', async () => {
      await element.updateComplete;
      const textarea = element.shadowRoot!.querySelector('textarea')!;
      expect(textarea.getAttribute('aria-labelledby')).toBe('label');
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  // IE11 can only append to FormData, not inspect it
  if (Boolean(FormData.prototype.get)) {
    describe('form submission', () => {
      let form: HTMLFormElement;
      let element: TextArea;

      beforeEach(async () => {
        fixt = await fixture(textareaInForm);
        element = fixt.root.querySelector('mwc-textarea')!;
        form = fixt.root.querySelector('form')!;
        await element.updateComplete;
      });

      it('does not submit without a name', async () => {
        element.name = '';
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        const keys = Array.from(formData.keys());
        expect(keys.length).toEqual(0);
      });

      it('does not submit if disabled', async () => {
        element.disabled = true;
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toBeNull();
      });

      it('submits empty string by default', async () => {
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toEqual('');
      });

      it('submits given value', async () => {
        element.value = 'bar';
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toEqual('bar');
      });
    });
  }
});
