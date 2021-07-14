/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/mwc-list/mwc-list-item';

import {ListItem} from '@material/mwc-list/mwc-list-item';
import {Select} from '@material/mwc-select';
import {html} from 'lit-html';

import {fixture, rafPromise, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

interface WithSelectedText {
  selectedText: string;
}

const basic = (outlined = false) => html`
  <mwc-select ?outlined=${outlined}>
    <mwc-list-item selected></mwc-list-item>
    <mwc-list-item value="a">Apple</mwc-list-item>
    <mwc-list-item value="b">Banana</mwc-list-item>
    <mwc-list-item value="c">Cucumber</mwc-list-item>
  </mwc-select>
`;

const withLabel = html`<mwc-select label="a label"></mwc-select>`;

const validationRequired = (outlined = false) => html`
  <mwc-select
      ?outlined=${outlined}
      label="I am required"
      required>
    <mwc-list-item selected></mwc-list-item>
    <mwc-list-item value="a">Apple</mwc-list-item>
    <mwc-list-item value="b">Banana</mwc-list-item>
    <mwc-list-item value="c">Cucumber</mwc-list-item>
  </mwc-select>
`;

const reqInitialVal = (outlined = false) => html`
  <mwc-select
      ?outlined=${outlined}
      label="I am required"
      required
      validateOnInitialRender>
    <mwc-list-item selected></mwc-list-item>
    <mwc-list-item value="a">Apple</mwc-list-item>
    <mwc-list-item value="b">Banana</mwc-list-item>
    <mwc-list-item value="c">Cucumber</mwc-list-item>
  </mwc-select>
`;

const itemsTemplate = html`
  <mwc-list-item></mwc-list-item>
  <mwc-list-item value="a">Apple</mwc-list-item>
  <mwc-list-item value="b">Banana</mwc-list-item>
  <mwc-list-item value="c" selected>Cucumber</mwc-list-item>`;

const lazy = (template = html``) => html`
  <mwc-select>
    ${template}
  </mwc-select>
`;

const valueInit = html`
  <mwc-select value="c">
    <mwc-list-item></mwc-list-item>
    <mwc-list-item value="a">Apple</mwc-list-item>
    <mwc-list-item value="b">Banana</mwc-list-item>
    <mwc-list-item value="c">Cucumber</mwc-list-item>
  </mwc-select>
`;

const selectInForm = html`
  <form>
    <mwc-select name="foo">
      <mwc-list-item></mwc-list-item>
      <mwc-list-item value="a">Apple</mwc-list-item>
      <mwc-list-item value="b">Banana</mwc-list-item>
      <mwc-list-item value="c">Cucumber</mwc-list-item>
    </mwc-select>
  </form>
`;

const isUiInvalid = (element: Select) => {
  return !!element.shadowRoot!.querySelector('.mdc-select--invalid');
};

describe('mwc-select:', () => {
  let fixt: TestFixture;

  describe('basic', () => {
    let element: Select;
    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-select')!;
    });

    it('initializes as an mwc-select', () => {
      expect(element).toBeInstanceOf(Select);
    });

    it('initialize with value', async () => {
      fixt.remove();
      fixt = await fixture(valueInit);

      element = fixt.root.querySelector('mwc-select')!;

      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      const cElement = element.querySelector('[value="c"]') as ListItem;

      await element.updateComplete;
      await cElement.updateComplete;

      expect(element.value)
          .withContext('value stays the same as init')
          .toEqual('c');
      expect(cElement)
          .withContext('selected element matches list item')
          .toEqual(element.selected!);
      expect(cElement.selected)
          .withContext('prop sets on list item')
          .toBeTrue();
      expect(element.index).withContext('index is correctly set').toEqual(3);
    });

    it('does not have aria-labelledby set', async () => {
      await element.updateComplete;
      const anchor = element.shadowRoot!.querySelector('.mdc-select__anchor')!;
      expect(anchor.getAttribute('aria-labelledby')).toBeNull();
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('label', () => {
    let element: Select;
    beforeEach(async () => {
      fixt = await fixture(withLabel);
      element = fixt.root.querySelector('mwc-select')!;
    });

    it('anchor has aria-labelledby set', async () => {
      await element.updateComplete;
      const anchor = element.shadowRoot!.querySelector('.mdc-select__anchor')!;
      expect(anchor.getAttribute('aria-labelledby')).toBe('label');
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }
    });
  });

  describe('keydown', () => {
    let element: Select;
    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-select')!;
    });

    it('keydown arrowdown increments selected index', async () => {
      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      element['onKeydown']({
        type: 'keydown',
        key: 'ArrowDown',
        preventDefault: () => {
          // Do nothing.
        }
      } as KeyboardEvent);

      const aElement = element.querySelector('[value="a"]') as ListItem;
      await element.updateComplete;
      await aElement.updateComplete;

      expect(element.value)
          .withContext('value changes to next value in list')
          .toEqual('a');
      expect(aElement)
          .withContext('selected element matches list item')
          .toEqual(element.selected!);
      expect(aElement.selected)
          .withContext('prop sets on list item')
          .toBeTrue();
      expect(element.index).withContext('index is correctly set').toEqual(1);
    });

    it('keydown arrowup decrements selected index', async () => {
      fixt.remove();
      fixt = await fixture(valueInit);

      element = fixt.root.querySelector('mwc-select')!;

      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      element['onKeydown']({
        type: 'keydown',
        key: 'ArrowUp',
        preventDefault: () => {
          // Do nothing.
        }
      } as KeyboardEvent);
      const bElement = element.querySelector('[value="b"]') as ListItem;
      await bElement.updateComplete;
      await element.updateComplete;

      expect(element.value)
          .withContext('value changes to previous list item')
          .toEqual('b');
      expect(bElement)
          .withContext('selected element matches list item')
          .toEqual(element.selected!);
      expect(bElement.selected)
          .withContext('prop sets on list item')
          .toBeTrue();
      expect(element.index).withContext('index is correctly set').toEqual(2);
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
        const element = fixt.root.querySelector('mwc-select')!;

        expect(isUiInvalid(element))
            .withContext('ui initially valid')
            .toBeFalse();
        element.focus();
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('no validation on focus')
            .toBeFalse();
        element.blur();
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('invalid after blur')
            .toBeTrue();
      });

      it('validity & checkValidity do not trigger ui', async () => {
        fixt = await fixture(validationRequired());
        const element = fixt.root.querySelector('mwc-select')!;
        expect(isUiInvalid(element))
            .withContext('ui initially valid')
            .toBeFalse();

        let invalidCalled = false;
        element.addEventListener('invalid', () => invalidCalled = true);

        const validity = element.validity;

        expect(validity.valueMissing)
            .withContext('validation fails - required')
            .toBeTrue();
        expect(validity.valid).withContext('element is invalid').toBeFalse();
        expect(invalidCalled)
            .withContext('invalid event not fired because of .validity')
            .toBeFalse();
        expect(isUiInvalid(element))
            .withContext('ui is not invalid because of .validity')
            .toBeFalse();

        const checkValidity = element.checkValidity();

        expect(checkValidity)
            .withContext('check validity returns false when invalid')
            .toBeFalse();
        expect(invalidCalled).withContext('invalid event called').toBeTrue();
        expect(isUiInvalid(element)).withContext('ui is invalid').toBeFalse();
      });

      it('setCustomValidity', async () => {
        fixt = await fixture(basic());
        const element = fixt.root.querySelector('mwc-select')!;

        // deflake shady dom (IE)
        await rafPromise();
        await element.layout();

        expect(isUiInvalid(element))
            .withContext('ui initially valid')
            .toBeFalse();
        expect(element.validationMessage).toEqual('');

        const validationMsgProp = 'set on prop';
        element.validationMessage = validationMsgProp;
        expect(isUiInvalid(element))
            .withContext('ui not false due to setting validationMessage')
            .toBeFalse();
        expect(element.validationMessage)
            .withContext('setting validationMessage works')
            .toEqual(validationMsgProp);

        const validationMsgFn = 'set by setCustomValidity';
        element.setCustomValidity(validationMsgFn);

        expect(element.validationMessage)
            .withContext('validationMessage prop is set with setCustomValidity')
            .toEqual(validationMsgFn);

        const validity = element.validity;
        expect(validity.customError)
            .withContext('customError is reason for valitity failure')
            .toBeTrue();
        expect(validity.valid).withContext('element is not valid').toBeFalse();
      });

      it('validity transform', async () => {
        fixt = await fixture(basic());
        const element = fixt.root.querySelector('mwc-select')! as Select;

        // deflake shady dom (IE)
        await rafPromise();
        await element.layout();

        expect(element.checkValidity())
            .withContext('element is initially valid')
            .toBeTrue();

        const transformFn =
            (value: string, vState: ValidityState): Partial<ValidityState> => {
              if (value === 'a') {
                return {
                  valid: true,
                };
              } else if (vState.valid) {
                const isOutOfRange = value === 'c';
                if (isOutOfRange) {
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
        expect(validity.valid)
            .withContext('unhandled case is valid')
            .toBeTrue();
        expect(element.checkValidity())
            .withContext('checkValidity is true for unhandled case')
            .toBeTrue();

        element.select(1);
        await element.updateComplete;
        validity = element.validity;
        expect(validity.valid)
            .withContext('explicitly handled value is true')
            .toBeTrue();
        expect(element.reportValidity())
            .withContext('checkValidity is true for explicit case')
            .toBeTrue();

        expect(isUiInvalid(element))
            .withContext('reportValidity makes ui valid when valid')
            .toBeFalse();

        element.select(3);
        await element.updateComplete;
        validity = element.validity;

        expect(validity.valid)
            .withContext('explicitly false case returns false')
            .toBeFalse();
        expect(validity.rangeOverflow)
            .withContext('explicit reason for invalid set')
            .toBeTrue();
        expect(element.reportValidity())
            .withContext('checkValidity is true for explicitly invalid case')
            .toBeFalse();

        expect(isUiInvalid(element))
            .withContext('reportValidity makes ui invalid when invalid')
            .toBeTrue();

        element.select(2);
        await element.updateComplete;
        validity = element.validity;

        expect(validity.valid)
            .withContext('validity can be set back to true')
            .toBeTrue();
        expect(validity.rangeOverflow)
            .withContext('explicit reason for invalid unset')
            .toBeFalse();
        expect(element.reportValidity())
            .withContext('checkValidity is set back true for valid case')
            .toBeTrue();

        expect(isUiInvalid(element))
            .withContext('ui can be made valid again')
            .toBeFalse();
      });

      it('initial validation', async () => {
        fixt = await fixture(reqInitialVal());
        let element = fixt.root.querySelector('mwc-select')!;
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('initial render is invalid')
            .toBeTrue();

        fixt.remove();

        fixt = await fixture(validationRequired());
        element = fixt.root.querySelector('mwc-select')!;
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('without flag is valid')
            .toBeFalse();
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
        const element = fixt.root.querySelector('mwc-select')!;

        expect(isUiInvalid(element))
            .withContext('ui initially valid')
            .toBeFalse();
        element.focus();
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('no validation on focus')
            .toBeFalse();
        element.blur();
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('invalid after blur')
            .toBeTrue();
      });

      it('validity & checkValidity do not trigger ui', async () => {
        fixt = await fixture(validationRequired(true));
        const element = fixt.root.querySelector('mwc-select')!;
        expect(isUiInvalid(element))
            .withContext('ui initially valid')
            .toBeFalse();

        let invalidCalled = false;
        element.addEventListener('invalid', () => invalidCalled = true);

        const validity = element.validity;

        expect(validity.valueMissing)
            .withContext('validation fails - required')
            .toBeTrue();
        expect(validity.valid).withContext('element is invalid').toBeFalse();
        expect(invalidCalled)
            .withContext('invalid event not fired because of .validity')
            .toBeFalse();
        expect(isUiInvalid(element))
            .withContext('ui is not invalid because of .validity')
            .toBeFalse();

        const checkValidity = element.checkValidity();

        expect(checkValidity)
            .withContext('check validity returns false when invalid')
            .toBeFalse();
        expect(invalidCalled).withContext('invalid event called').toBeTrue();
        expect(isUiInvalid(element)).withContext('ui is invalid').toBeFalse();
      });

      it('setCustomValidity', async () => {
        fixt = await fixture(basic(true));
        const element = fixt.root.querySelector('mwc-select')!;
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
        fixt = await fixture(basic(true));
        const element = fixt.root.querySelector('mwc-select')! as Select;

        // deflake shady dom (IE)
        await rafPromise();
        await element.layout();

        expect(element.checkValidity())
            .withContext('element is initially valid')
            .toBeTrue();

        const transformFn =
            (value: string, vState: ValidityState): Partial<ValidityState> => {
              if (value === 'a') {
                return {
                  valid: true,
                };
              } else if (vState.valid) {
                const isOutOfRange = value === 'c';
                if (isOutOfRange) {
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
        expect(validity.valid)
            .withContext('unhandled case is valid')
            .toBeTrue();
        expect(element.checkValidity())
            .withContext('checkValidity is true for unhandled case')
            .toBeTrue();

        element.select(1);
        await element.updateComplete;
        validity = element.validity;
        expect(validity.valid)
            .withContext('explicitly handled value is true')
            .toBeTrue();
        expect(element.reportValidity())
            .withContext('checkValidity is true for explicit case')
            .toBeTrue();

        expect(isUiInvalid(element))
            .withContext('reportValidity makes ui valid when valid')
            .toBeFalse();

        element.select(3);
        await element.updateComplete;
        validity = element.validity;

        expect(validity.valid)
            .withContext('explicitly false case returns false')
            .toBeFalse();
        expect(validity.rangeOverflow)
            .withContext('explicit reason for invalid set')
            .toBeTrue();
        expect(element.reportValidity())
            .withContext('checkValidity is true for explicitly invalid case')
            .toBeFalse();

        expect(isUiInvalid(element))
            .withContext('reportValidity makes ui invalid when invalid')
            .toBeTrue();

        element.select(2);
        await element.updateComplete;
        validity = element.validity;

        expect(validity.valid)
            .withContext('validity can be set back to true')
            .toBeTrue();
        expect(validity.rangeOverflow)
            .withContext('explicit reason for invalid unset')
            .toBeFalse();
        expect(element.reportValidity())
            .withContext('checkValidity is set back true for valid case')
            .toBeTrue();

        expect(isUiInvalid(element))
            .withContext('ui can be made valid again')
            .toBeFalse();
      });

      it('initial validation', async () => {
        fixt = await fixture(reqInitialVal(true));
        let element = fixt.root.querySelector('mwc-select')!;
        await element.updateComplete;

        // deflake shady dom (IE)
        await rafPromise();
        await element.layout();

        expect(isUiInvalid(element))
            .withContext('initial render is invalid')
            .toBeTrue();

        fixt.remove();

        fixt = await fixture(validationRequired(true));
        element = fixt.root.querySelector('mwc-select')!;
        await element.updateComplete;
        expect(isUiInvalid(element))
            .withContext('without flag is valid')
            .toBeFalse();
      });

      afterEach(() => {
        if (fixt) {
          fixt.remove();
        }
      });
    });
  });

  describe('selection', () => {
    let element: Select;
    let changeCalls = 0;
    const changeListener = () => {
      changeCalls++;
    };

    beforeEach(async () => {
      fixt = await fixture(basic());

      element = fixt.root.querySelector('mwc-select')!;
      element.addEventListener('change', changeListener);

      await element.updateComplete;
    });

    it('selection via index', async () => {
      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      expect(changeCalls)
          .withContext('change evt not called on startup')
          .toEqual(0);
      expect(element.value).withContext('initial value is blank').toEqual('');
      expect((element as unknown as WithSelectedText).selectedText)
          .withContext('selectedText is blank')
          .toEqual('');
      expect(!!element.selected)
          .withContext('there is a selected element')
          .toBeTrue();

      const firstElement = element.querySelector('mwc-list-item')!;
      expect(firstElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();

      element.select(1);
      await element.updateComplete;
      expect(changeCalls)
          .withContext('change event called once on selection')
          .toEqual(1);

      element.select(1);
      await element.updateComplete;
      expect(changeCalls)
          .withContext(
              'change event not emitted twice when same value selected again')
          .toEqual(1);

      expect(element.value)
          .withContext('select method updates value')
          .toEqual('a');
      expect((element as unknown as WithSelectedText).selectedText === 'Apple')
          .withContext('selectedText is updated')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('there is a selected element after select')
          .toBeTrue();

      const aElement = element.querySelector('[value="a"]') as ListItem;
      expect(firstElement.selected)
          .withContext('the previous has be deselected')
          .toBeFalse();
      expect(aElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();
      expect(aElement === element.selected)
          .withContext(
              'element with selected prop is the same as selected on mwc-select')
          .toBeTrue();

      element.value = 'a';
      await element.updateComplete;
      expect(changeCalls)
          .withContext(
              'change event not emitted twice when same value selected again using value property')
          .toEqual(1);
      changeCalls = 0;

      element.select(-1);
      await element.updateComplete;
      expect(changeCalls)
          .withContext('change event called once on selection')
          .toEqual(1);
      changeCalls = 0;

      expect(element.value).withContext('deselection clears value').toEqual('');
      expect((element as unknown as WithSelectedText).selectedText === '')
          .withContext('selectedText is cleared on deselection')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('selected element is cleared')
          .toBeFalse();

      expect(aElement.selected)
          .withContext('the previous has be deselected')
          .toBeFalse();
    });

    it('selection via element', async () => {
      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      expect(changeCalls)
          .withContext('change evt not called on startup')
          .toEqual(0);
      expect(element.value).withContext('initial value is blank').toEqual('');
      expect((element as unknown as WithSelectedText).selectedText === '')
          .withContext('selectedText is blank')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('there is a selected element')
          .toBeTrue();

      const firstElement = element.querySelector('mwc-list-item')!;
      expect(firstElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();

      const aElement = element.querySelector('[value="a"]') as ListItem;
      aElement.selected = true;
      await aElement.updateComplete;
      await element.updateComplete;
      expect(changeCalls)
          .withContext('change event called once on selection')
          .toEqual(1);
      changeCalls = 0;

      expect(element.value)
          .withContext('select method updates value')
          .toEqual('a');
      expect((element as unknown as WithSelectedText).selectedText === 'Apple')
          .withContext('selectedText is updated')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('there is a selected element after select')
          .toBeTrue();

      expect(firstElement.selected)
          .withContext('the previous has be deselected')
          .toBeFalse();
      expect(aElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();
      expect(aElement === element.selected)
          .withContext(
              'element with selected prop is the same as selected on mwc-select')
          .toBeTrue();
    });

    it('lazy selection', async () => {
      fixt.remove();
      fixt = await fixture(lazy());
      element = fixt.root.querySelector('mwc-select')!;

      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      expect(element.index)
          .withContext('unselected index when no children')
          .toEqual(-1);

      fixt.template = lazy(itemsTemplate);
      await fixt.updateComplete;
      await element.updateComplete;

      expect(element.index)
          .withContext('index updates when lazily slotted')
          .toEqual(3);
      expect(element.value)
          .withContext('value updates when lazily slotted')
          .toEqual('c');
    });

    it('selection via value prop', async () => {
      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      expect(changeCalls)
          .withContext('change evt not called on startup')
          .toEqual(0);
      expect(element.value).withContext('initial value is blank').toEqual('');
      expect((element as unknown as WithSelectedText).selectedText)
          .withContext('selectedText is blank')
          .toEqual('');
      expect(!!element.selected)
          .withContext('there is a selected element')
          .toBeTrue();

      const firstElement = element.querySelector('mwc-list-item')!;
      expect(firstElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();
      const aElement = element.querySelector('[value="a"]') as ListItem;

      element.value = 'a';
      await element.updateComplete;
      await aElement.updateComplete;
      expect(changeCalls)
          .withContext('change event called once on selection')
          .toEqual(1);
      changeCalls = 0;

      expect(element.value)
          .withContext('setting value prop sets value prop')
          .toEqual('a');
      expect(element.index)
          .withContext('updates the index when matches')
          .toEqual(1);
      expect((element as unknown as WithSelectedText).selectedText === 'Apple')
          .withContext('selectedText is updated')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('there is a selected element after select')
          .toBeTrue();

      expect(firstElement.selected)
          .withContext('the previous has be deselected')
          .toBeFalse();
      expect(aElement.selected)
          .withContext('the element has selected prop')
          .toBeTrue();
      expect(aElement === element.selected)
          .withContext(
              'element with selected prop is the same as selected on mwc-select')
          .toBeTrue();

      element.value = 'nonexistent';
      await element.updateComplete;
      await aElement.updateComplete;
      expect(changeCalls)
          .withContext('change event called once on selection')
          .toEqual(1);
      changeCalls = 0;

      expect(element.value)
          .withContext('setting value prop sets value prop')
          .toEqual('');
      expect(element.index)
          .withContext('nonexistent value sets index to -1')
          .toEqual(-1);
      expect((element as unknown as WithSelectedText).selectedText === '')
          .withContext('selectedText is empty when value doesn\'t match')
          .toBeTrue();
      expect(!!element.selected)
          .withContext('there is no selected element when value doesn\'t match')
          .toBeFalse();

      expect(aElement.selected)
          .withContext('the previous element is deselcted when doesn\'t match')
          .toBeFalse();
    });

    it('label change selected', async () => {
      fixt.remove();
      fixt = await fixture(lazy());
      element = fixt.root.querySelector('mwc-select')!;

      // deflake shady dom (IE)
      await rafPromise();
      await element.layout();

      fixt.template = lazy(itemsTemplate);
      await fixt.updateComplete;
      await element.updateComplete;

      expect(element.index)
          .withContext('index updates when lazily slotted')
          .toEqual(3);
      expect(element.value)
          .withContext('value updates when lazily slotted')
          .toEqual('c');
      expect((element as unknown as WithSelectedText).selectedText)
          .toEqual('Cucumber');

      element.selected!.textContent = 'Cherry';
      await element.updateComplete;

      expect((element as unknown as WithSelectedText).selectedText)
          .toEqual('Cucumber');

      await element.layoutOptions();
      await element.updateComplete;

      expect((element as unknown as WithSelectedText).selectedText)
          .toEqual('Cherry');
    });

    afterEach(() => {
      if (fixt) {
        fixt.remove();
      }

      element.removeEventListener('change', changeListener);
      changeCalls = 0;
    });
  });

  // IE11 can only append to FormData, not inspect it
  if (Boolean(FormData.prototype.get)) {
    describe('form submission', () => {
      let form: HTMLFormElement;
      let element: Select;
      let items: ListItem[];

      beforeEach(async () => {
        fixt = await fixture(selectInForm);
        form = fixt.root.querySelector('form')!;
        element = fixt.root.querySelector('mwc-select')!;
        items = Array.from(fixt.root.querySelectorAll('mwc-list-item'));
        await Promise.all(
            [element.updateComplete, ...(items.map((i) => i.updateComplete))]);
      });

      it('does not submit without a name', async () => {
        element.name = '';
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        const keys = Array.from(formData.keys());
        expect(keys.length).toEqual(0);
      });

      it('does not submit when disabled', async () => {
        element.disabled = true;
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toBeNull();
      });

      it('does not submit when there are no items', async () => {
        for (const item of items) {
          item.remove();
        }
        await element.layout();
        await element.updateComplete;
        const formData = simulateFormDataEvent(form);
        expect(formData.get('foo')).toBeNull();
      });

      it('submits selected element value', async () => {
        let formData = simulateFormDataEvent(form);
        expect(formData.get('foo'))
            .withContext('default item')
            .toEqual(items[0].value);
        element.select(1);
        await element.updateComplete;
        formData = simulateFormDataEvent(form);
        expect(formData.get('foo'))
            .withContext('second item')
            .toEqual(items[1].value);
      });

      afterEach(() => {
        fixt?.remove();
      });
    });
  }
});
