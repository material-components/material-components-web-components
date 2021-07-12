/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {matches} from '@material/dom/ponyfill';
import {BaseElement} from '@material/mwc-base/base-element';
import {RippleInterface} from '@material/mwc-base/utils';
import {MDCRippleAdapter} from '@material/ripple/adapter';
import MDCRippleFoundation from '@material/ripple/foundation';
import {html, property, PropertyValues, query, state, TemplateResult} from 'lit-element';
import {classMap} from 'lit-html/directives/class-map';
import {styleMap} from 'lit-html/directives/style-map';

/** @soyCompatible */
export class RippleBase extends BaseElement implements RippleInterface {
  @query('.mdc-ripple-surface') mdcRoot!: HTMLElement;

  @property({type: Boolean}) primary = false;

  @property({type: Boolean}) accent = false;

  @property({type: Boolean}) unbounded = false;

  @property({type: Boolean}) disabled = false;

  @property({type: Boolean}) activated = false;

  @property({type: Boolean}) selected = false;

  @state() protected hovering = false;

  @state() protected bgFocused = false;

  @state() protected fgActivation = false;

  @state() protected fgDeactivation = false;

  @state() protected fgScale = '';

  @state() protected fgSize = '';

  @state() protected translateStart = '';

  @state() protected translateEnd = '';

  @state() protected leftPos = '';

  @state() protected topPos = '';

  protected mdcFoundationClass = MDCRippleFoundation;

  protected mdcFoundation!: MDCRippleFoundation;

  get isActive(): any {
    return matches(this.parentElement || this, ':active');
  }

  createAdapter(): MDCRippleAdapter {
    return {
      browserSupportsCssVars: () => true,
      isUnbounded: () => this.unbounded,
      isSurfaceActive: () => this.isActive,
      isSurfaceDisabled: () => this.disabled,
      addClass: (className: string) => {
        switch (className) {
          case 'mdc-ripple-upgraded--background-focused':
            this.bgFocused = true;
            break;
          case 'mdc-ripple-upgraded--foreground-activation':
            this.fgActivation = true;
            break;
          case 'mdc-ripple-upgraded--foreground-deactivation':
            this.fgDeactivation = true;
            break;
          default:
            break;
        }
      },
      removeClass: (className: string) => {
        switch (className) {
          case 'mdc-ripple-upgraded--background-focused':
            this.bgFocused = false;
            break;
          case 'mdc-ripple-upgraded--foreground-activation':
            this.fgActivation = false;
            break;
          case 'mdc-ripple-upgraded--foreground-deactivation':
            this.fgDeactivation = false;
            break;
          default:
            break;
        }
      },
      containsEventTarget: () => true,
      registerInteractionHandler: () => undefined,
      deregisterInteractionHandler: () => undefined,
      registerDocumentInteractionHandler: () => undefined,
      deregisterDocumentInteractionHandler: () => undefined,
      registerResizeHandler: () => undefined,
      deregisterResizeHandler: () => undefined,
      updateCssVariable: (varName: string, value: string) => {
        switch (varName) {
          case '--mdc-ripple-fg-scale':
            this.fgScale = value;
            break;
          case '--mdc-ripple-fg-size':
            this.fgSize = value;
            break;
          case '--mdc-ripple-fg-translate-end':
            this.translateEnd = value;
            break;
          case '--mdc-ripple-fg-translate-start':
            this.translateStart = value;
            break;
          case '--mdc-ripple-left':
            this.leftPos = value;
            break;
          case '--mdc-ripple-top':
            this.topPos = value;
            break;
          default:
            break;
        }
      },
      computeBoundingRect: () =>
          (this.parentElement || this).getBoundingClientRect(),
      getWindowPageOffset: () =>
          ({x: window.pageXOffset, y: window.pageYOffset}),
    };
  }

  startPress(ev?: Event) {
    this.waitForFoundation(() => {
      this.mdcFoundation.activate(ev);
    });
  }

  endPress() {
    this.waitForFoundation(() => {
      this.mdcFoundation.deactivate();
    });
  }

  startFocus() {
    this.waitForFoundation(() => {
      this.mdcFoundation.handleFocus();
    });
  }

  endFocus() {
    this.waitForFoundation(() => {
      this.mdcFoundation.handleBlur();
    });
  }

  startHover() {
    this.hovering = true;
  }

  endHover() {
    this.hovering = false;
  }

  /**
   * Wait for the MDCFoundation to be created by `firstUpdated`
   */
  protected waitForFoundation(fn: () => void) {
    if (this.mdcFoundation) {
      fn();
    } else {
      this.updateComplete.then(fn);
    }
  }

  protected update(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('disabled')) {
      // stop hovering when ripple is disabled to prevent a stuck "hover" state
      // When re-enabled, the outer component will get a `mouseenter` event on
      // the first movement, which will call `startHover()`
      if (this.disabled) {
        this.endHover();
      }
    }
    super.update(changedProperties);
  }

  /** @soyTemplate */
  protected render(): TemplateResult {
    const shouldActivateInPrimary =
        this.activated && (this.primary || !this.accent);
    const shouldSelectInPrimary =
        this.selected && (this.primary || !this.accent);

    /** @classMap */
    const classes = {
      'mdc-ripple-surface--accent': this.accent,
      'mdc-ripple-surface--primary--activated': shouldActivateInPrimary,
      'mdc-ripple-surface--accent--activated': this.accent && this.activated,
      'mdc-ripple-surface--primary--selected': shouldSelectInPrimary,
      'mdc-ripple-surface--accent--selected': this.accent && this.selected,
      'mdc-ripple-surface--disabled': this.disabled,
      'mdc-ripple-surface--hover': this.hovering,
      'mdc-ripple-surface--primary': this.primary,
      'mdc-ripple-surface--selected': this.selected,
      'mdc-ripple-upgraded--background-focused': this.bgFocused,
      'mdc-ripple-upgraded--foreground-activation': this.fgActivation,
      'mdc-ripple-upgraded--foreground-deactivation': this.fgDeactivation,
      'mdc-ripple-upgraded--unbounded': this.unbounded,
    };
    return html`
        <div class="mdc-ripple-surface mdc-ripple-upgraded ${classMap(classes)}"
          style="${styleMap({
      '--mdc-ripple-fg-scale': this.fgScale,
      '--mdc-ripple-fg-size': this.fgSize,
      '--mdc-ripple-fg-translate-end': this.translateEnd,
      '--mdc-ripple-fg-translate-start': this.translateStart,
      '--mdc-ripple-left': this.leftPos,
      '--mdc-ripple-top': this.topPos,
    })}"></div>`;
  }
}
