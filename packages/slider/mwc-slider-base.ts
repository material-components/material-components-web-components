/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {applyPassive} from '@material/dom/events';
import {ariaProperty} from '@material/mwc-base/aria-property';
import {addHasRemoveClass, EventType, FormElement, SpecificEventListener} from '@material/mwc-base/form-element';
import {observer} from '@material/mwc-base/observer';
import {MDCSliderAdapter} from '@material/slider/adapter';
import MDCSliderFoundation from '@material/slider/foundation';
import {eventOptions, html, property, PropertyValues, query, state, TemplateResult} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {ifDefined} from 'lit-html/directives/if-defined';
import {styleMap} from 'lit-html/directives/style-map';

const INPUT_EVENT = 'input';
const CHANGE_EVENT = 'change';

export class SliderBase extends FormElement {
  protected mdcFoundation!: MDCSliderFoundation;

  protected readonly mdcFoundationClass = MDCSliderFoundation;

  @query('.mdc-slider') protected mdcRoot!: HTMLElement;

  @query('.mdc-slider') protected formElement!: HTMLElement;

  @query('.mdc-slider__thumb-container') protected thumbContainer!: HTMLElement;

  @query('.mdc-slider__pin-value-marker') protected pinMarker!: HTMLElement;

  @property({type: Number}) min = 0;

  @property({type: Number}) max = 100;

  protected _value = 0;
  set value(value: number) {
    if (this.mdcFoundation) {
      this.mdcFoundation.setValue(value);
    }
    this._value = value;
    this.requestUpdate('value', value);
  }

  @property({type: Number})
  get value() {
    if (this.mdcFoundation) {
      return this.mdcFoundation.getValue();
    } else {
      return this._value;
    }
  }

  @property({type: Number})
  @observer(function(this: SliderBase, value: number, old: number) {
    const oldWasDiscrete = old !== 0;
    const newIsDiscrete = value !== 0;
    if (oldWasDiscrete !== newIsDiscrete) {
      this.resetFoundation();
    }
    this.mdcFoundation.setStep(value);
  })
  step = 0;

  @property({type: Boolean, reflect: true})
  @observer(function(this: SliderBase, value: boolean) {
    this.mdcFoundation.setDisabled(value);
  })
  disabled = false;

  @property({type: Boolean, reflect: true}) pin = false;

  @property({type: Boolean, reflect: true})
  @observer(function(this: SliderBase) {
    this.mdcFoundation.setupTrackMarker();
  })
  markers = false;

  @property() name = '';

  @state() protected pinMarkerText = '';
  @state() protected trackMarkerContainerStyles = {};
  @state() protected thumbContainerStyles = {};
  @state() protected trackStyles = {};

  /** @soyPrefixAttribute */
  @ariaProperty @property({attribute: 'aria-label'}) ariaLabel?: string;

  /** @soyPrefixAttribute */
  @ariaProperty
  @property({attribute: 'aria-labelledby'})
  ariaLabelledBy?: string;

  protected isFoundationDestroyed = false;

  // TODO(sorvell) #css: needs a default width
  protected render() {
    const isDiscrete = this.step !== 0;
    const hostClassInfo = {
      'mdc-slider--discrete': isDiscrete,
      'mdc-slider--display-markers': this.markers && isDiscrete,
    };

    let markersTemplate: TemplateResult|string = '';

    if (isDiscrete && this.markers) {
      markersTemplate = html`
        <div
            class="mdc-slider__track-marker-container"
            style="${styleMap(this.trackMarkerContainerStyles)}">
        </div>`;
    }

    let pin: TemplateResult|string = '';

    if (this.pin) {
      pin = html`
      <div class="mdc-slider__pin">
        <span class="mdc-slider__pin-value-marker">${this.pinMarkerText}</span>
      </div>`;
    }

    return html`
      <div class="mdc-slider ${classMap(hostClassInfo)}"
           tabindex="0" role="slider"
           aria-label="${ifDefined(this.ariaLabel)}"
           aria-labelledby="${ifDefined(this.ariaLabelledBy)}"
           aria-valuemin="${this.min}" aria-valuemax="${this.max}"
           aria-valuenow="${this.value}"
           aria-disabled="${this.disabled.toString() as 'true' | 'false'}"
           data-step="${this.step}"
           @mousedown=${this.layout}
           @touchstart=${this.layout}>
        <div class="mdc-slider__track-container">
          <div
              class="mdc-slider__track"
              style="${styleMap(this.trackStyles)}">
          </div>
          ${markersTemplate}
        </div>
        <div
            class="mdc-slider__thumb-container"
            style="${styleMap(this.thumbContainerStyles)}">
          <!-- TODO: use cache() directive -->
          ${pin}
          <svg class="mdc-slider__thumb" width="21" height="21">
            <circle cx="10.5" cy="10.5" r="7.875"></circle>
          </svg>
        <div class="mdc-slider__focus-ring"></div>
      </div>
    </div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.mdcRoot && this.isFoundationDestroyed) {
      this.isFoundationDestroyed = false;
      this.mdcFoundation.init();
    }
  }

  updated(changed: PropertyValues) {
    const minChanged = changed.has('min');
    const maxChanged = changed.has('max');

    if (minChanged && maxChanged) {
      if (this.max < this.mdcFoundation.getMin()) {
        // for when min is above previous max
        this.mdcFoundation.setMin(this.min);
        this.mdcFoundation.setMax(this.max);
      } else {
        // for when max is below previous min
        this.mdcFoundation.setMax(this.max);
        this.mdcFoundation.setMin(this.min);
      }
    } else if (minChanged) {
      this.mdcFoundation.setMin(this.min);
    } else if (maxChanged) {
      this.mdcFoundation.setMax(this.max);
    }

    super.updated(changed);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.isFoundationDestroyed = true;
    this.mdcFoundation.destroy();
  }

  protected createAdapter(): MDCSliderAdapter {
    return {
      ...addHasRemoveClass(this.mdcRoot),
      getAttribute: (name: string) => this.mdcRoot.getAttribute(name),
      setAttribute: (name: string, value: string) =>
          this.mdcRoot.setAttribute(name, value),
      removeAttribute: (name: string) => this.mdcRoot.removeAttribute(name),
      computeBoundingRect: () => {
        const rect = this.mdcRoot.getBoundingClientRect();
        const myRect: ClientRect = {
          bottom: rect.bottom,
          height: rect.height,
          left: rect.left + window.pageXOffset,
          right: rect.right,
          top: rect.top,
          width: rect.width,
        };

        return myRect;
      },
      getTabIndex: () => this.mdcRoot.tabIndex,
      registerInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) => {
            const init = type === 'touchstart' ? applyPassive() : undefined;
            this.mdcRoot.addEventListener(type, handler, init);
          },
      deregisterInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) =>
              this.mdcRoot.removeEventListener(type, handler),
      registerThumbContainerInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) => {
            const init = type === 'touchstart' ? applyPassive() : undefined;
            this.thumbContainer.addEventListener(type, handler, init);
          },
      deregisterThumbContainerInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) =>
              this.thumbContainer.removeEventListener(type, handler),
      registerBodyInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) =>
              document.body.addEventListener(type, handler),
      deregisterBodyInteractionHandler:
          <K extends EventType>(type: K, handler: SpecificEventListener<K>) =>
              document.body.removeEventListener(type, handler),
      registerResizeHandler: (handler: SpecificEventListener<'resize'>) =>
          window.addEventListener('resize', handler, applyPassive()),
      deregisterResizeHandler: (handler: SpecificEventListener<'resize'>) =>
          window.removeEventListener('resize', handler),
      notifyInput: () => {
        const value = this.mdcFoundation.getValue();
        if (value !== this._value) {
          this.value = value;
          this.dispatchEvent(new CustomEvent(
              INPUT_EVENT,
              {detail: this, composed: true, bubbles: true, cancelable: true}));
        }
      },
      notifyChange: () => {
        this.dispatchEvent(new CustomEvent(
            CHANGE_EVENT,
            {detail: this, composed: true, bubbles: true, cancelable: true}));
      },
      setThumbContainerStyleProperty: (propertyName: string, value: string) => {
        this.thumbContainerStyles[propertyName] = value;
        this.requestUpdate();
      },
      setTrackStyleProperty: (propertyName: string, value: string) => {
        this.trackStyles[propertyName] = value;
        this.requestUpdate();
      },
      setMarkerValue: (value: number) => this.pinMarkerText =
          value.toLocaleString(),
      setTrackMarkers: (step, max, min) => {
        // calculates the CSS for the notches on the slider. Taken from
        // https://github.com/material-components/material-components-web/blob/8f851d9ed2f75dc8b8956d15b3bb2619e59fa8a9/packages/mdc-slider/component.ts#L122
        const stepStr = step.toLocaleString();
        const maxStr = max.toLocaleString();
        const minStr = min.toLocaleString();
        // keep calculation in css for better rounding/subpixel behavior
        const markerAmount = `((${maxStr} - ${minStr}) / ${stepStr})`;
        const markerWidth = '2px';
        const markerBkgdImage = `linear-gradient(to right, currentColor ${
            markerWidth}, transparent 0)`;
        const markerBkgdLayout = `0 center / calc((100% - ${markerWidth}) / ${
            markerAmount}) 100% repeat-x`;
        const markerBkgdShorthand = `${markerBkgdImage} ${markerBkgdLayout}`;

        this.trackMarkerContainerStyles['background'] = markerBkgdShorthand;
        this.requestUpdate();
      },
      isRTL: () => getComputedStyle(this.mdcRoot).direction === 'rtl',
    };
  }

  protected resetFoundation() {
    if (this.mdcFoundation) {
      this.mdcFoundation.destroy();
      this.mdcFoundation.init();
    }
  }

  protected async firstUpdated() {
    await super.firstUpdated();

    this.mdcFoundation.setValue(this._value);
  }

  /**
   * Layout is called on mousedown / touchstart as the dragging animations of
   * slider are calculated based off of the bounding rect which can change
   * between interactions with this component, and this is the only location
   * in the foundation that udpates the rects. e.g. scrolling horizontally
   * causes adverse effects on the bounding rect vs mouse drag / touchmove
   * location.
   */
  @eventOptions({capture: true, passive: true})
  layout() {
    this.mdcFoundation.layout();
  }
}
