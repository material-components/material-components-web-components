/**
@license
Copyright 2018 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {SingleSelectionController} from '@material/mwc-radio/single-selection-controller';
import {property} from 'lit-element';
import {RadioBase} from './mwc-radio-base';


/**
 * @fires checked
 */
export class RadioBaseWithSingleSelection extends RadioBase {
  @property({type: Boolean}) global = false;

  private _selectionController?: SingleSelectionController;

  connectedCallback() {
    super.connectedCallback();
    // Note that we must defer creating the selection controller until the
    // element has connected, because selection controllers are keyed by the
    // radio's shadow root. For example, if we're stamping in a lit-html map
    // or repeat, then we'll be constructed before we're added to a root node.
    //
    // Also note if we aren't using native shadow DOM, then we don't technically
    // need a SelectionController, because our inputs will share document-scoped
    // native selection groups. However, it simplifies implementation and
    // testing to use one in all cases. In particular, it means we correctly
    // manage groups before the first update stamps the native input.
    //
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this._selectionController = SingleSelectionController.getController(this);
    this._selectionController.register(this);
    // With native <input type="radio">, when a checked radio is added to the
    // root, then it wins. Immediately update to emulate this behavior.
    this._selectionController.update(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // The controller is initialized in connectedCallback, so if we are in
    // disconnectedCallback then it must be initialized.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._selectionController!.unregister(this);
    this._selectionController = undefined;
  }

  protected handleFocus() {
    super.handleFocus();

    if (this._selectionController !== undefined) {
      this._selectionController.focus(this);
    }
  }

  protected firstUpdated() {
    super.firstUpdated();
    // We might not have been able to synchronize this from the checked setter
    // earlier, if checked was set before the input was stamped.
    this.formElement.checked = this.checked;
    if (this._selectionController !== undefined) {
      this._selectionController.update(this);
    }
  }

  protected handleProgrammaticCheck() {
    if (this._selectionController) {
      this._selectionController.update(this);
    }

    // useful when unchecks self and wrapping element needs to synchronize
    // TODO(b/168543810): Remove triggering event on programmatic API call.
    this.dispatchEvent(new Event('checked', {bubbles: true, composed: true}));
  }
}
