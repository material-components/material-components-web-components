/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {cssClasses as floatingClasses} from '@material/floating-label/constants';
import {FloatingLabel} from '@material/mwc-floating-label';
import {TextField} from '@material/mwc-textfield';
import {cssClasses} from '@material/textfield/constants';
import {html} from 'lit-html';

import {fixture, rafPromise, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

const basic = (outlined = false) => html`
  <mwc-textfield ?outlined=${outlined}></mwc-textfield>
`;

const validationRequired = (outlined = false) => html`
  <mwc-textfield
      ?outlined=${outlined}
      label="I am required"
      required>
  </mwc-textfield>
`;

const validationPattern = (outlined = false) => html`
  <mwc-textfield
      ?outlined=${outlined}
      pattern="[0-9]+"
      value="dogs">
  </mwc-textfield>
`;

const reqInitialVal = (outlined = false) => html`
  <mwc-textfield
      ?outlined=${outlined}
      label="I am required"
      required
      validateOnInitialRender>
  </mwc-textfield>
`;

const makeOutlined = (isHidden: boolean) => html`
  <style>
    .hidden {
      display: none;
    }
  </style>
  <mwc-textfield
      outlined
      label="label"
      class="${isHidden ? 'hidden' : ''}"
      value="some value to notch label">
  </mwc-textfield>
`;

const withLabel = html`
  <mwc-textfield label="a label"></mwc-textfield>
`;

const textfieldInForm = html`
  <form>
    <mwc-textfield name="foo"></mwc-textfield>
  </form>
`;

const isUiInvalid = (element: TextField) => {
  return !!element.shadowRoot!.querySelector(`.${cssClasses.INVALID}`);
};

const asDateType = html`
  <mwc-textfield
    type="date"
    min="${'2020-01-01' as unknown as number}"
    max="${'2020-12-31' as unknown as number}"
    ?required="${true}">
  </mwc-textfield>
`;

describe('mwc-textfield:', () => {
  let fixt: TestFixture;

  describe('basic', () => {
    let element: TextField;
    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-textfield')!;
    });

    it('initializes as an mwc-textfield', () => {
      expect(element).toBeInstanceOf(TextField);
    });

    it('setting value sets on input', async () => {
      element.value = 'my test value';
      await element.updateComplete;

      const inputElement = element.shadowRoot!.querySelector('input');
      expect(inputElement!.value).toEqual('my test value');
    });

    it('setting non-string values stringifies values', async () => {
      (element.value as unknown as undefined) = undefined;
      await element.updateComplete;
      expect(element.value).toEqual('undefined');

      (element.value as unknown as null) = null;
      await element.updateComplete;
      expect(element.value).toEqual('null');

      (element.value as unknown as number) = 15;
      await element.updateComplete;
      expect(element.value).toEqual('15');

      (element.value as unknown) = {};
      await element.updateComplete;
      expect(element.value).toEqual('[object Object]');
    });

    it('does not throw exception setting value', async () => {
      await element.updateComplete;
      const testFn = () => {
        element.value = 'foo';
      };
      expect(testFn).not.toThrow();
    });

    it('does not have aria-labelledby set', async () => {
      await element.updateComplete;
      const input = element.shadowRoot!.querySelector('input')!;
      expect(input.getAttribute('aria-labelledby')).toBeNull();
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('validation', () => {
    describe('standard', () => {
      it('required invalidates on blur', async () => {
        fixt = await fixture(validationRequired());
        const element = fixt.root.querySelector('mwc-textfield')!;

        expect(isUiInvalid(element)).toBeFalse();
        element.focus();
        element.blur();
        expect(isUiInvalid(element)).toBeTrue();
      });

      it('validity & checkValidity do not trigger ui', async () => {
        fixt = await fixture(validationPattern());
        const element = fixt.root.querySelector('mwc-textfield')!;

        expect(isUiInvalid(element)).toBeFalse();

        let invalidCalled = false;
        element.addEventListener('invalid', () => invalidCalled = true);

        const validity = element.validity;

        expect(validity.patternMismatch).toBeTrue();
        expect(validity.valid).toBeFalse();
        expect(invalidCalled).toBeFalse();
        expect(isUiInvalid(element)).toBeFalse();

        const checkValidity = element.checkValidity();

        expect(checkValidity).toBeFalse();
        expect(invalidCalled).toBeTrue();
        expect(isUiInvalid(element)).toBeFalse();
      });

      it('setCustomValidity', async () => {
        fixt = await fixture(basic());
        const element = fixt.root.querySelector('mwc-textfield')!;

        expect(isUiInvalid(element)).toBeFalse();
        expect(element.validationMessage).toEqual('');

        const validationMsgProp = 'set on prop';
        element.validationMessage = validationMsgProp;
        expect(isUiInvalid(element)).toBeFalse();
        expect(element.validationMessage).toEqual(validationMsgProp);

        const validationMsgFn = 'set by setCustomValidity';
        element.setCustomValidity(validationMsgFn);

        expect(element.validationMessage).toEqual(validationMsgFn);

        const validity = element.validity;
        expect(validity.customError).toBeTrue();
        expect(validity.valid).toBeFalse();
      });

      it('validity transform', async () => {
        fixt = await fixture(validationPattern());
        const element = fixt.root.querySelector('mwc-textfield')!;

        expect(element.checkValidity()).toBeFalse();

        const transformFn =
            (value: string, vState: ValidityState): Partial<ValidityState> => {
              if (value.indexOf('dogs') !== -1) {
                return {
                  valid: true,
                };
              } else if (vState.valid) {
                const numberifiedValue = Number(value);
                if (numberifiedValue > 5) {
                  return {
                    valid: false,
                    rangeOverflow: true,
                  };
                }
              }

              return {};
            };

        element.validityTransform = transformFn;

        let validity = element.validity;
        // true because dogs
        expect(validity.valid).toBeTrue();
        expect(validity.patternMismatch).toBeTrue();
        expect(element.checkValidity()).toBeTrue();

        element.value = '6';
        await element.updateComplete;
        validity = element.validity;
        // false because > 5
        expect(validity.valid).toBeFalse();
        expect(validity.rangeOverflow).toBeTrue();
        expect(element.reportValidity()).toBeFalse();

        expect(isUiInvalid(element)).toBeTrue();

        element.value = '1';
        await element.updateComplete;
        validity = element.validity;
        // true because < 5
        expect(validity.valid).toBeTrue();
        expect(validity.patternMismatch).toBeFalse();
        expect(validity.rangeOverflow).toBeFalse();
        expect(element.reportValidity()).toBeTrue();

        expect(isUiInvalid(element)).toBeFalse();
      });

      it('initial validation', async () => {
        fixt = await fixture(reqInitialVal());
        let element = fixt.root.querySelector('mwc-textfield')!;
        expect(isUiInvalid(element)).toBeTrue();

        fixt.remove();

        fixt = await fixture(validationRequired());
        element = fixt.root.querySelector('mwc-textfield')!;
        expect(isUiInvalid(element)).toBeFalse();
      });

      it('autoValidate validates on value change', async () => {
        fixt = await fixture(validationRequired());
        const element = fixt.root.querySelector('mwc-textfield')!;
        expect(isUiInvalid(element)).toBeFalse();

        element.value = 'some value';
        // value update followed async by ui invalid update
        await element.updateComplete;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();

        element.value = '';
        await element.updateComplete;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();

        element.autoValidate = true;
        await element.updateComplete;
        expect(isUiInvalid(element)).toBeFalse();

        element.value = 'some value';
        // value update followed async by ui invalid update
        await element.updateComplete;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();

        element.value = '';
        await element.updateComplete;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeTrue();
      });

      afterEach(() => {
        if (fixt) {
          fixt.remove();
        }
      });
    });

    describe('outlined', () => {
      it('required invalidates on blur', async () => {
        fixt = await fixture(validationRequired(true));
        const element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();
        element.focus();
        element.blur();
        expect(isUiInvalid(element)).toBeTrue();
      });

      it('validity & checkValidity do not trigger ui', async () => {
        fixt = await fixture(validationPattern(true));
        const element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();

        let invalidCalled = false;
        element.addEventListener('invalid', () => invalidCalled = true);

        const validity = element.validity;

        expect(validity.patternMismatch).toBeTrue();
        expect(validity.valid).toBeFalse();
        expect(invalidCalled).toBeFalse();
        expect(isUiInvalid(element)).toBeFalse();


        const checkValidity = element.checkValidity();

        expect(checkValidity).toBeFalse();
        expect(invalidCalled).toBeTrue();
        expect(isUiInvalid(element)).toBeFalse();
      });

      it('setCustomValidity', async () => {
        fixt = await fixture(basic(true));
        const element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;

        expect(isUiInvalid(element)).toBeFalse();
        expect(element.validationMessage).toEqual('');

        const validationMsgProp = 'set on prop';
        element.validationMessage = validationMsgProp;
        expect(isUiInvalid(element)).toBeFalse();
        expect(element.validationMessage).toEqual(validationMsgProp);

        const validationMsgFn = 'set by setCustomValidity';
        element.setCustomValidity(validationMsgFn);

        expect(element.validationMessage).toEqual(validationMsgFn);

        const validity = element.validity;
        expect(validity.customError).toBeTrue();
        expect(validity.valid).toBeFalse();
      });

      it('validity transform', async () => {
        fixt = await fixture(validationPattern(true));
        const element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;

        expect(element.checkValidity()).toBeFalse();

        const transformFn =
            (value: string, vState: ValidityState): Partial<ValidityState> => {
              if (value.indexOf('dogs') !== -1) {
                return {
                  valid: true,
                };
              } else if (vState.valid) {
                const numberifiedValue = Number(value);
                if (numberifiedValue > 5) {
                  return {
                    valid: false,
                    rangeOverflow: true,
                  };
                }
              }

              return {};
            };

        element.validityTransform = transformFn;

        let validity = element.validity;
        // true because dogs
        expect(validity.valid).toBeTrue();
        expect(validity.patternMismatch).toBeTrue();
        expect(element.checkValidity()).toBeTrue();

        element.value = '6';
        await element.updateComplete;
        validity = element.validity;
        // false because > 5
        expect(validity.valid).toBeFalse();
        expect(validity.rangeOverflow).toBeTrue();
        expect(element.reportValidity()).toBeFalse();

        expect(isUiInvalid(element)).toBeTrue();

        element.value = '1';
        await element.updateComplete;
        validity = element.validity;
        // true because < 5
        expect(validity.valid).toBeTrue();
        expect(validity.patternMismatch).toBeFalse();
        expect(validity.rangeOverflow).toBeFalse();
        expect(element.reportValidity()).toBeTrue();

        expect(isUiInvalid(element)).toBeFalse();
      });

      it('initial validation', async () => {
        fixt = await fixture(reqInitialVal(true));
        let element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;
        expect(isUiInvalid(element)).toBeTrue();

        fixt.remove();

        fixt = await fixture(validationRequired(true));
        element = fixt.root.querySelector('mwc-textfield')!;
        await element.updateComplete;
        expect(isUiInvalid(element)).toBeFalse();
      });

      afterEach(() => {
        if (fixt) {
          fixt.remove();
        }
      });
    });
  });


  describe('select', () => {
    let element: TextField;

    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-textfield')!;
    });

    it('selects the input text', () => {
      const input = element.shadowRoot!.querySelector('input')!;

      input.value = 'foobar';

      element.select();

      expect(input.selectionStart).toEqual(0);
      expect(input.selectionEnd).toEqual(6);
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('setSelectionRange', () => {
    let element: TextField;

    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-textfield')!;
    });

    it('sets correct selection', async () => {
      const input = element.shadowRoot!.querySelector('input')!;

      element.value = 'one two three';
      await element.updateComplete;

      element.setSelectionRange(4, 6);

      expect(input.selectionStart).toEqual(4);
      expect(input.selectionEnd).toEqual(6);
      expect(element.selectionStart).toEqual(4);
      expect(element.selectionEnd).toEqual(6);
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('notch', () => {
    let fixt: TestFixture;
    it('notch can be layout-ed to correct size', async () => {
      fixt = await fixture(makeOutlined(true));
      const element = fixt.root.querySelector('mwc-textfield')!;

      const notchedOutline =
          element.shadowRoot!.querySelector('mwc-notched-outline')!;
      const floatingLabel = element.shadowRoot!.querySelector(
                                '.mdc-floating-label') as FloatingLabel;

      element.requestUpdate();
      await element.updateComplete;
      // needed for older browsers
      notchedOutline.requestUpdate();
      await notchedOutline.updateComplete;

      let outlineWidth = notchedOutline.width;
      expect(notchedOutline.open).toBeTrue();

      expect(outlineWidth).toBe(0);

      element.classList.remove('hidden');
      element.requestUpdate();
      await element.updateComplete;
      await rafPromise();
      outlineWidth = notchedOutline.width;
      let labelWidth = floatingLabel.floatingLabelFoundation.getWidth();
      expect(outlineWidth).toBe(0);
      expect(labelWidth > 0).toBeTrue();

      await element.layout();
      await element.updateComplete;

      outlineWidth = notchedOutline.width;
      labelWidth = floatingLabel.floatingLabelFoundation.getWidth();

      const diff = Math.abs(outlineWidth - labelWidth);
      expect(diff).toBeLessThan(3);
    });

    it('notch changes size with label change', async () => {
      fixt = await fixture(makeOutlined(false));
      const element = fixt.root.querySelector('mwc-textfield')!;

      const notchedOutline =
          element.shadowRoot!.querySelector('mwc-notched-outline')!;
      const floatingLabel = element.shadowRoot!.querySelector(
                                '.mdc-floating-label') as FloatingLabel;
      element.requestUpdate();
      await element.updateComplete;

      // needed for older browsers
      notchedOutline.requestUpdate();
      await notchedOutline.updateComplete;

      let outlineWidth = notchedOutline.width;
      let labelWidth = floatingLabel.floatingLabelFoundation.getWidth();
      expect(notchedOutline.open).toBeTrue();
      let diff = Math.abs(outlineWidth - labelWidth);
      expect(diff).toBeLessThan(5);

      element.label = 'this is some other label';

      // wait for this label to finish updating
      await element.updateComplete;
      // wait for internal event listener to trigger layout method
      element.requestUpdate();
      await element.updateComplete;
      // needed for older browsers
      notchedOutline.requestUpdate();
      await notchedOutline.updateComplete;

      outlineWidth = notchedOutline.width;
      labelWidth = floatingLabel.floatingLabelFoundation.getWidth();
      diff = Math.abs(outlineWidth - labelWidth);
      expect(diff).toBeLessThan(5);
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('label', () => {
    let element: TextField;

    beforeEach(async () => {
      fixt = await fixture(withLabel);
      element = fixt.root.querySelector('mwc-textfield')!;
      await element.updateComplete;
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });

    it('label floats when value is set', async () => {
      const floatingLabel = element.shadowRoot!.querySelector(
                                '.mdc-floating-label') as FloatingLabel;

      expect(
          floatingLabel.classList.contains(floatingClasses.LABEL_FLOAT_ABOVE))
          .toBeFalse();

      element.value = 'foo bar';
      await element.updateComplete;

      expect(
          floatingLabel.classList.contains(floatingClasses.LABEL_FLOAT_ABOVE))
          .toBeTrue();
    });

    it('input has aria-labelledby set', async () => {
      await element.updateComplete;
      const input = element.shadowRoot!.querySelector('input')!;
      expect(input.getAttribute('aria-labelledby')).toBe('label');
    });
  });

  describe('date type textfield', () => {
    // IE 8-1 has no support for input[type=date]
    // Feature detection to skip these unit tests in IE, they will always fail
    if (window.MSInputMethodContext) {
      return;
    }

    // Safari has no support for input[type=date]
    // User Agent sniff to skip these unit tests in Safari, they will always
    // fail
    if (navigator.userAgent.indexOf('Safari') !== -1) {
      return;
    }

    let fixt: TestFixture;
    let element: TextField;

    beforeEach(async () => {
      fixt = await fixture(asDateType);
      element = fixt.root.querySelector('mwc-textfield')!;
      await element.updateComplete;
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });

    it('will be valid with a date-string inside min-max range', async () => {
      element.focus();
      element.value = '2020-10-16';
      element.blur();

      await element.updateComplete;

      expect(element.reportValidity()).toBeTrue();
      expect(isUiInvalid(element)).toBeFalse();
    });

    it('will be invalid with a date-string before min', async () => {
      element.focus();
      element.value = '2019-10-16';
      element.blur();

      await element.updateComplete;

      expect(element.reportValidity()).toBeFalse();
      expect(isUiInvalid(element)).toBeTrue();
    });

    it('will be invalid with a date-string after max', async () => {
      element.focus();
      element.value = '2021-10-16';
      element.blur();

      await element.updateComplete;

      expect(element.reportValidity()).toBeFalse();
      expect(isUiInvalid(element)).toBeTrue();
    });
  });

  // IE11 can only append to FormData, not inspect it
  if (Boolean(FormData.prototype.get)) {
    describe('form submission', () => {
      let form: HTMLFormElement;
      let element: TextField;

      beforeEach(async () => {
        fixt = await fixture(textfieldInForm);
        element = fixt.root.querySelector('mwc-textfield')!;
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
