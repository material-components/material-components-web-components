/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {Switch} from '@material/mwc-switch';
import * as hanbi from 'hanbi';
import {html} from 'lit-html';

import {fixture, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

interface SwitchProps {
  checked: boolean;
  disabled: boolean;
  ariaLabel: string;
  ariaLabelledBy: string;
}

const defaultSwitchElement = html`<mwc-switch></mwc-switch>`;

const switchElement = (propsInit: Partial<SwitchProps>) => {
  return html`
    <mwc-switch
      ?checked=${propsInit.checked === true}
      ?disabled=${propsInit.disabled === true}></mwc-switch>
  `;
};

const switchInForm = html`
  <form>
    <mwc-switch></mwc-switch>
  </form>
`;

describe('mwc-switch', () => {
  let fixt: TestFixture;
  let element: Switch;

  afterEach(() => {
    fixt.remove();
  });

  describe('basic', () => {
    beforeEach(async () => {
      fixt = await fixture(defaultSwitchElement);
      element = fixt.root.querySelector('mwc-switch')!;
      await element.updateComplete;
    });

    it('initializes as an mwc-switch', () => {
      expect(element).toBeInstanceOf(Switch);
      expect(element.checked).toEqual(false);
      expect(element.disabled).toEqual(false);
    });

    it('user input emits `change` event', async () => {
      const callback = hanbi.spy();
      element.addEventListener('change', callback.handler);

      element.click();

      expect(callback.callCount).toEqual(1);
    });
  });

  describe('checked', () => {
    beforeEach(async () => {
      fixt = await fixture(switchElement({checked: true}));
      element = fixt.root.querySelector('mwc-switch')!;
      await element.updateComplete;
    });

    it('checks the native input', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      expect(input.checked).toBeTrue();

      element.checked = false;
      await element.updateComplete;
      expect(input.checked).toBeFalse();
    });

    it('setting `checked` affects `aria-checked` of native input', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      expect(input.getAttribute('aria-checked')).toEqual('true');

      element.checked = false;
      await element.updateComplete;
      expect(input.getAttribute('aria-checked')).toEqual('false');
    });
  });

  describe('disabled', () => {
    beforeEach(async () => {
      fixt = await fixture(switchElement({disabled: true}));
      element = fixt.root.querySelector('mwc-switch')!;
      await element.updateComplete;
    });

    it('disables the native input', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      expect(input.disabled).toBeTrue();

      element.disabled = false;
      await element.updateComplete;
      expect(input.disabled).toBeFalse();
    });
  });

  describe('aria', () => {
    beforeEach(async () => {
      fixt = await fixture(defaultSwitchElement);
      element = fixt.root.querySelector('mwc-switch')!;
      await element.updateComplete;
    });

    it('delegates aria-label to the proper element', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      element.setAttribute('aria-label', 'foo');
      await element.updateComplete;
      expect(element.ariaLabel).toEqual('foo');
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(input.getAttribute('aria-label')).toEqual('foo');
    });

    it('delegates .ariaLabel to the proper element', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      element.ariaLabel = 'foo';
      await element.updateComplete;
      expect(element.ariaLabel).toEqual('foo');
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(input.getAttribute('aria-label')).toEqual('foo');
    });

    it('delegates aria-labelledby to the proper element', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      element.setAttribute('aria-labelledby', 'foo');
      await element.updateComplete;
      expect(element.ariaLabelledBy).toEqual('foo');
      expect(element.getAttribute('aria-labelledby')).toEqual(null);
      expect(input.getAttribute('aria-labelledby')).toEqual('foo');
    });

    it('delegates .ariaLabelledBy to the proper element', async () => {
      const input = element.shadowRoot!.querySelector('input')!;
      element.ariaLabelledBy = 'foo';
      await element.updateComplete;
      expect(element.ariaLabelledBy).toEqual('foo');
      expect(element.getAttribute('aria-labelledby')).toEqual(null);
      expect(input.getAttribute('aria-labelledby')).toEqual('foo');
    });
  });

  // IE11 can only append to FormData, not inspect it
  if (Boolean(FormData.prototype.get)) {
    describe('form submission', () => {
      let form: HTMLFormElement;

      beforeEach(async () => {
        fixt = await fixture(switchInForm);
        element = fixt.root.querySelector('mwc-switch')!;
        form = fixt.root.querySelector('form')!;
        await element.updateComplete;
      });

      it('does not submit without a name', () => {
        const formData = simulateFormDataEvent(form);
        const keys = Array.from(formData.keys());
        expect(keys.length).toEqual(0);
      });

      it('does not submit when disabled', async () => {
        element.name = 'foo';
        element.disabled = true;
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toBeNull();
      });

      it('does not submit when not checked', async () => {
        element.name = 'foo';
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toBeNull();
      });

      it('submits "on" by default', async () => {
        element.name = 'foo';
        element.checked = true;
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toEqual('on');
      });

      it('submits given value', async () => {
        element.name = 'foo';
        element.value = 'bar';
        element.checked = true;
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toEqual('bar');
      });
    });
  }
});
