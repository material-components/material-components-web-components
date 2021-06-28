/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Slider} from '@material/mwc-slider/mwc-slider';
import * as hanbi from 'hanbi';
import {html} from 'lit-html';

import {fixture, ieSafeKeyboardEvent, rafPromise, simulateFormDataEvent, TestFixture} from '../../../test/src/util/helpers';

const defaultSliderProps = {
  min: 0,
  max: 100,
  value: 0,
};

type SliderProps = typeof defaultSliderProps;

const basic = html`
  <mwc-slider></mwc-slider>
`;

const slider = (propsInit: Partial<SliderProps> = {}) => {
  const props = {...defaultSliderProps, ...propsInit};

  return html`
    <mwc-slider
        .min=${props.min}
        .max=${props.max}
        .value=${props.value}>
    </mwc-slider>
  `;
};

const sliderInForm = html`
  <form>
    <mwc-slider name="foo"></mwc-slider>
  </form>
`;

const afterRender = async (root: ShadowRoot) => {
  const slider = root.querySelector('mwc-slider')!;
  await slider.updateComplete;
  slider.layout();
  await rafPromise();
  await rafPromise();
};

describe('mwc-slider', () => {
  let fixt: TestFixture;
  let element: Slider;

  describe('basic', () => {
    beforeEach(async () => {
      fixt = await fixture(basic);
      element = fixt.root.querySelector('mwc-slider')!;
    });

    afterEach(() => {
      fixt.remove();
    });

    it('initializes as an mwc-slider', () => {
      expect(element).toBeInstanceOf(Slider);
    });

    it('initializes defaults', () => {
      expect(element.value).toEqual(0);
      expect(element.min).toEqual(0);
      expect(element.max).toEqual(100);
      expect(element.step).toEqual(0);
      expect(element.disabled).toEqual(false);
      expect(element.pin).toEqual(false);
      expect(element.markers).toEqual(false);
    });

    it('sets correct aria values', () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      expect(slider.getAttribute('aria-valuemin')).toEqual('0');
      expect(slider.getAttribute('aria-valuenow')).toEqual('0');
    });

    it('key events change value and fire events', async () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      const inputHandler = hanbi.spy();
      const changeHandler = hanbi.spy();
      element.addEventListener('input', inputHandler.handler);
      element.addEventListener('change', changeHandler.handler);

      // arrow up keycode
      const upEv = ieSafeKeyboardEvent('keydown', 38);
      slider.dispatchEvent(upEv);

      await element.updateComplete;
      await rafPromise();
      expect(inputHandler.called).toBeTrue();
      expect(changeHandler.called).toBeTrue();
      expect(element.value).toEqual(1);

      // arrow down keycode
      const downEv = ieSafeKeyboardEvent('keydown', 40);
      slider.dispatchEvent(downEv);
      await element.updateComplete;
      await rafPromise();
      expect(element.value).toEqual(0);
    });

    it('markers display when enabled', async () => {
      const markerSelector = '.mdc-slider__track-marker-container';
      let markers = element.shadowRoot!.querySelector(markerSelector);
      expect(markers).toEqual(null);
      element.markers = true;
      await element.updateComplete;
      markers = element.shadowRoot!.querySelector(markerSelector);
      expect(markers).toEqual(null);
      element.step = 1;
      await element.updateComplete;
      markers = element.shadowRoot!.querySelector(markerSelector);
      expect(markers).toBeInstanceOf(Element);
    });

    it('pin displays when enabled and receiving input', async () => {
      const pinSelector = '.mdc-slider__pin';
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      let pin = element.shadowRoot!.querySelector(pinSelector);
      expect(pin).toEqual(null);
      element.pin = true;
      element.step = 1;
      await element.updateComplete;
      await rafPromise();

      // arrow up keycode
      const upEv = ieSafeKeyboardEvent('keydown', 38);
      slider.dispatchEvent(upEv);

      await element.updateComplete;
      await rafPromise();
      pin = element.shadowRoot!.querySelector(pinSelector);
      const pinText = pin!.querySelector('.mdc-slider__pin-value-marker')!;
      expect(pin).toBeInstanceOf(Element);
      expect(pinText.textContent).toEqual('1');
    });
  });

  describe('aria', () => {
    beforeEach(async () => {
      fixt = await fixture(basic);
      element = fixt.root.querySelector('mwc-slider')!;
    });

    afterEach(() => {
      fixt.remove();
    });

    it('delegates aria-label via attribute', async () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      element.setAttribute('aria-label', 'foo');
      await element.updateComplete;
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(element.ariaLabel).toEqual('foo');
      expect(slider.getAttribute('aria-label')).toEqual('foo');
    });

    it('delegates aria-label via property', async () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      element.ariaLabel = 'foo';
      await element.updateComplete;
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(element.ariaLabel).toEqual('foo');
      expect(slider.getAttribute('aria-label')).toEqual('foo');
    });

    it('delegates aria-labelledby via attribute', async () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      element.setAttribute('aria-label', 'foo');
      await element.updateComplete;
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(element.ariaLabel).toEqual('foo');
      expect(slider.getAttribute('aria-label')).toEqual('foo');
    });

    it('delegates aria-labelledby via property', async () => {
      const slider = element.shadowRoot!.querySelector('.mdc-slider')!;
      element.ariaLabel = 'foo';
      await element.updateComplete;
      expect(element.getAttribute('aria-label')).toEqual(null);
      expect(element.ariaLabel).toEqual('foo');
      expect(slider.getAttribute('aria-label')).toEqual('foo');
    });
  });

  describe('min-max-value initializations', () => {
    afterEach(() => {
      fixt.remove();
    });

    it('vals set correctly when explicitly set to defaults', async () => {
      fixt = await fixture(slider(), {afterRender});
      element = fixt.root.querySelector('mwc-slider')!;

      expect(element.min).toEqual(0);
      expect(element.max).toEqual(100);
      expect(element.value).toEqual(0);
    });

    it('can set min max over 100', async () => {
      fixt = await fixture(
          slider({min: 101, max: 103, value: 102}), {afterRender});
      element = fixt.root.querySelector('mwc-slider')!;

      expect(element.min).toEqual(101);
      expect(element.max).toEqual(103);
      expect(element.value).toEqual(102);
    });

    it('can set min max below 0', async () => {
      fixt =
          await fixture(slider({min: -3, max: -1, value: -2}), {afterRender});
      element = fixt.root.querySelector('mwc-slider')!;

      expect(element.min).toEqual(-3);
      expect(element.max).toEqual(-1);
      expect(element.value).toEqual(-2);
    });

    it('value below min', async () => {
      fixt =
          await fixture(slider({min: 101, max: 103, value: 99}), {afterRender});
      element = fixt.root.querySelector('mwc-slider')!;

      expect(element.min).toEqual(101);
      expect(element.max).toEqual(103);
      expect(element.value).toEqual(101);
    });

    it('value above max', async () => {
      fixt = await fixture(slider({min: -3, max: -1, value: 1}), {afterRender});
      element = fixt.root.querySelector('mwc-slider')!;

      expect(element.min).toEqual(-3);
      expect(element.max).toEqual(-1);
      expect(element.value).toEqual(-1);
    });
  });

  // IE11 can only append to FormData, not inspect it
  describe('form submission', () => {
    let form: HTMLFormElement;
    beforeEach(async () => {
      fixt = await fixture(sliderInForm);
      element = fixt.root.querySelector('mwc-slider')!;
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

    it('does not submit with disabled', async () => {
      element.disabled = true;
      await element.updateComplete;
      const formData = simulateFormDataEvent(form);
      expect(formData.get('foo')).toBeNull();
    });

    it('submits value', async () => {
      let formData = simulateFormDataEvent(form);
      expect(formData.get('foo')).withContext('default value').toEqual(0);
      element.value = 100;
      await element.updateComplete;
      formData = simulateFormDataEvent(form);
      expect(formData.get('foo')).withContext('value set to 100').toEqual(100);
    });
  });
});
