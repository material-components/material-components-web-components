/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {customElement} from 'lit-element';

import {SwitchBase} from './mwc-switch-base';
import {styles} from './mwc-switch.css';

declare global {
  interface HTMLElementTagNameMap {
    'mwc-switch': Switch;
  }
}

@customElement('mwc-switch')
export class Switch extends SwitchBase {
  static styles = [styles];
}
