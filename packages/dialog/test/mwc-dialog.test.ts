/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '@material/mwc-button';
import '@material/mwc-dialog';

import {Button} from '@material/mwc-button';
import {Dialog} from '@material/mwc-dialog';
import {DocumentWithBlockingElements} from 'blocking-elements';
import {customElement, LitElement} from 'lit-element';
import {html} from 'lit-html';

import {fixture, rafPromise, TestFixture} from '../../../test/src/util/helpers';

const blockingElements =
    (document as DocumentWithBlockingElements).$blockingElements;

const OPENING_EVENT = 'opening';
const OPENED_EVENT = 'opened';
const CLOSING_EVENT = 'closing';
const CLOSED_EVENT = 'closed';

interface HasKeyCode {
  keyCode: number;
}

@customElement('my-test-element')
export class MyTestElement extends LitElement {
  render() {
    return html`
      <mwc-dialog>
        <slot></slot>
        <slot name="primaryAction" slot="primaryAction"></slot>
        <slot name="secondaryAction" slot="secondaryAction"></slot>
      </mwc-dialog>
    `;
  }
}


const awaitEvent =
    (element: Dialog, eventName: string): Promise<CustomEvent> => {
      return new Promise((res) => {
        const listener = (e: CustomEvent) => {
          element.removeEventListener(eventName, listener as EventListener);
          res(e);
        };

        element.addEventListener(eventName, listener as EventListener);
      });
    };

const distributedFocusContent = html`
  <my-test-element>
    <div>
      <mwc-button id="wrappedContentButton">wrapped content button</mwc-button>
    </div>
    <mwc-button id="contentButton">content button</mwc-button>
    <mwc-button
        slot="primaryAction"
        data-dialogAction="ok">
      Ok
    </mwc-button>
    <mwc-button
        slot="secondaryAction">
      Cancel
    </mwc-button>
  </my-test-element>
`;

const basic = html`
  <mwc-dialog></mwc-dialog>
`;

const opened = html`
  <mwc-dialog open></mwc-dialog>
`;

const withButtons = html`
  <mwc-dialog heading="myTitle" actionAttribute="data-dialogAction">
    <mwc-button
        slot="primaryAction"
        data-dialogAction="ok">
      Ok
    </mwc-button>
    <mwc-button
        slot="secondaryAction">
      Cancel
    </mwc-button>
  </mwc-dialog>
`;

suite('mwc-dialog:', () => {
  let fixt: TestFixture;

  suite('basic', () => {
    let element: Dialog;
    setup(async () => {
      fixt = await fixture(basic);

      element = fixt.root.querySelector('mwc-dialog')!;
    });

    test('initializes as an mwc-dialog', () => {
      assert.instanceOf(element, Dialog);
    });

    test('Title spacing is not displayed when there is no title', async () => {
      let titleTag = element.shadowRoot!.querySelector('.mdc-dialog__title');
      assert.isNull(titleTag);

      element.heading = 'This is my Title';
      await element.requestUpdate();
      titleTag = element.shadowRoot!.querySelector('.mdc-dialog__title');
      assert.notStrictEqual(titleTag, null);
      assert.strictEqual(titleTag!.textContent, 'This is my Title');
    });

    test('Dialog fires open and close events', async () => {
      let openingCalled = false;
      let openedCalled = false;
      let closingCalled = false;
      let closedCalled = false;
      const surfaceElement = element.shadowRoot!.querySelector(
                                 '.mdc-dialog__surface') as HTMLDivElement;

      element.addEventListener(OPENING_EVENT, () => {
        openingCalled = true;
      });

      element.addEventListener(OPENED_EVENT, () => {
        openedCalled = true;
      });

      element.addEventListener(CLOSING_EVENT, () => {
        closingCalled = true;
      });

      element.addEventListener(CLOSED_EVENT, () => {
        closedCalled = true;
      });

      const openedPromise = awaitEvent(element, OPENED_EVENT);
      const closedPromise = awaitEvent(element, CLOSED_EVENT);

      assert.isFalse(openingCalled);
      assert.isFalse(openedCalled);
      assert.isFalse(closingCalled);
      assert.isFalse(closedCalled);

      assert.strictEqual(surfaceElement.offsetWidth, 0);
      assert.strictEqual(surfaceElement.offsetHeight, 0);

      element.heading = 'Basic title';
      element.hideActions = true;
      element.open = true;
      await openedPromise;

      assert.isTrue(openingCalled);
      assert.isTrue(openedCalled);
      assert.isFalse(closingCalled);
      assert.isFalse(closedCalled);

      assert.isTrue(surfaceElement.offsetWidth > 0);
      assert.isTrue(surfaceElement.offsetHeight > 0);

      openingCalled = false;
      openedCalled = false;
      element.open = false;

      await closedPromise;

      assert.isFalse(openingCalled);
      assert.isFalse(openedCalled);
      assert.isTrue(closingCalled);
      assert.isTrue(closedCalled);

      assert.strictEqual(surfaceElement.offsetWidth, 0);
      assert.strictEqual(surfaceElement.offsetHeight, 0);
    });

    test('Scrim closes dialog', async () => {
      const SCRIM_ACTION = 'SCRIM_CLOSE';
      element.scrimClickAction = SCRIM_ACTION;
      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      const scrim = element.shadowRoot!.querySelector('.mdc-dialog__scrim') as
          HTMLDivElement;

      scrim.click();

      const event = await awaitEvent(element, CLOSED_EVENT);

      const action = event.detail.action;
      assert.strictEqual(action, SCRIM_ACTION);
    });

    test('Escape closes dialog', async () => {
      const ESCAPE_ACTION = 'ESCAPE_CLOSE';
      element.escapeKeyAction = ESCAPE_ACTION;
      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      const init = {detail: 0, bubbles: true, cancelable: true, composed: true};
      const escDown = new CustomEvent('keydown', init);
      const escUp = new CustomEvent('keyup', init);

      (escDown as unknown as HasKeyCode).keyCode = 27;
      (escUp as unknown as HasKeyCode).keyCode = 27;

      document.dispatchEvent(escDown);
      document.dispatchEvent(escUp);

      const event = await awaitEvent(element, CLOSED_EVENT);

      const action = event.detail.action;
      assert.strictEqual(action, ESCAPE_ACTION);
    });

    test('Hide Actions hides empty whitespace', async () => {
      const actionsFooter =
          element.shadowRoot!.querySelector('#actions') as HTMLElement;

      element.open = true;
      await awaitEvent(element, OPENED_EVENT);

      assert.isTrue(actionsFooter.offsetWidth > 0);
      assert.isTrue(actionsFooter.offsetHeight > 0);

      element.hideActions = true;
      await element.requestUpdate();

      assert.strictEqual(actionsFooter.offsetHeight, 0);
    });

    test('declaratively opens', async () => {
      const fixt = await fixture(opened);
      const element = fixt.root.firstElementChild as Dialog;

      let openedCalled = false;
      element.addEventListener(OPENED_EVENT, () => {
        openedCalled = true;
      });

      await awaitEvent(element, OPENED_EVENT);

      assert.isTrue(openedCalled);

      fixt.remove();
    });

    teardown(async () => {
      if (element && element.open) {
        element.open = false;
        await awaitEvent(element, CLOSED_EVENT);
      }

      if (fixt) {
        fixt.remove();
      }
    });
  });

  suite('with actions', () => {
    let element: Dialog;
    let distFocusFixt: TestFixture;

    setup(async () => {
      fixt = await fixture(withButtons);
      element = fixt.root.firstElementChild as Dialog;

      distFocusFixt = await fixture(distributedFocusContent);
    });

    test('Actions close dialog', async () => {
      element.open = true;
      await awaitEvent(element, OPENED_EVENT);

      let closedCalled = false;

      element.addEventListener(CLOSED_EVENT, () => {
        closedCalled = true;
      });

      const primary = element.querySelector('[slot="primaryAction"]') as Button;
      const secondary =
          element.querySelector('[slot="secondaryAction"]') as Button;

      secondary.click();

      assert.isFalse(closedCalled);

      primary.click();

      const action = await awaitEvent(element, CLOSED_EVENT);

      assert.isTrue(closedCalled);
      assert.strictEqual(action.detail.action, 'ok');

      closedCalled = false;

      element.open = true;
      await awaitEvent(element, OPENED_EVENT);

      secondary.setAttribute('data-dialogAction', 'cancel');

      secondary.click();

      const secondaryAction = await awaitEvent(element, CLOSED_EVENT);

      assert.isTrue(closedCalled);
      assert.strictEqual(secondaryAction.detail.action, 'cancel');
    });

    test('Initial focus attribute focuses', async () => {
      const button = element.firstElementChild as Button;

      assert.isNull(fixt.root.activeElement);

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.isNull(fixt.root.activeElement);

      element.open = false;

      await awaitEvent(element, CLOSED_EVENT);

      assert.isNull(fixt.root.activeElement);

      button.setAttribute('dialogInitialFocus', '');

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.strictEqual(fixt.root.activeElement, button);
    });

    test('initial focus not in light dom but still distributed', async () => {
      const testElement = distFocusFixt.root.firstElementChild!;
      const root = testElement.shadowRoot!;
      element = root.querySelector('mwc-dialog')!;

      await element.updateComplete;

      // secondary
      const primaryButton =
          testElement.querySelector('[slot="primaryAction"]') as Button;

      primaryButton.setAttribute('dialogInitialFocus', '');

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.strictEqual(
          primaryButton.shadowRoot!.activeElement,
          primaryButton.shadowRoot!.querySelector('button'),
          'root slotted primary action is focused');

      element.open = false;

      await awaitEvent(element, CLOSED_EVENT);

      primaryButton.removeAttribute('dialogInitialFocus');

      // secondary
      const secondaryButton =
          testElement.querySelector('[slot="secondaryAction"]') as Button;

      secondaryButton.setAttribute('dialogInitialFocus', '');

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.strictEqual(
          secondaryButton.shadowRoot!.activeElement,
          secondaryButton.shadowRoot!.querySelector('button'),
          'root slotted secondary action is focused');

      element.open = false;

      await awaitEvent(element, CLOSED_EVENT);

      secondaryButton.removeAttribute('dialogInitialFocus');

      // secondary
      const contentButton =
          testElement.querySelector('#contentButton') as Button;

      contentButton.setAttribute('dialogInitialFocus', '');

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.strictEqual(
          contentButton.shadowRoot!.activeElement,
          contentButton.shadowRoot!.querySelector('button'),
          'root slotted content focused');

      element.open = false;

      await awaitEvent(element, CLOSED_EVENT);

      contentButton.removeAttribute('dialogInitialFocus');

      // wrapped
      const wrappedContentButton =
          testElement.querySelector('#wrappedContentButton') as Button;

      wrappedContentButton.setAttribute('dialogInitialFocus', '');

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);

      assert.strictEqual(
          wrappedContentButton.shadowRoot!.activeElement,
          wrappedContentButton.shadowRoot!.querySelector('button'),
          'wrapped slotted content focused');

      element.open = false;

      await awaitEvent(element, CLOSED_EVENT);

      wrappedContentButton.removeAttribute('dialogInitialFocus');
    });

    test('Stacking reverses actions', async () => {
      const primary = element.querySelector('[slot="primaryAction"]') as Button;
      const secondary =
          element.querySelector('[slot="secondaryAction"]') as Button;

      element.open = true;

      await awaitEvent(element, OPENED_EVENT);
      const topDiff = primary.offsetTop - secondary.offsetTop;

      // tops are within about 5 px of each other
      assert.isTrue(Math.abs(topDiff) < 5);
      assert.isTrue(primary.offsetLeft > secondary.offsetLeft);

      element.stacked = true;
      await element.requestUpdate();
      await rafPromise();

      const primaryRight = primary.offsetLeft + primary.offsetWidth;
      const secondaryRight = secondary.offsetLeft + secondary.offsetWidth;
      const rightDiff = primaryRight - secondaryRight;

      // rights are within about 5 px of each other: some browsers don't
      // calculate offsetLeft+offsetWidth to necessarily equal right
      assert.isTrue(Math.abs(rightDiff) < 5);
      assert.isTrue(secondary.offsetTop > primary.offsetTop);
    });

    test('Enter clicks primary action', async () => {
      const mdcRoot = element.shadowRoot!.querySelector('.mdc-dialog');
      assert.isTrue(!!mdcRoot, 'root has rendered');

      let clickCalled = false;
      const primary = element.querySelector('[slot="primaryAction"]') as Button;

      primary.addEventListener('click', () => {
        clickCalled = true;
      });

      element.open = true;
      await awaitEvent(element, OPENED_EVENT);

      assert.isFalse(clickCalled);

      const init = {detail: 0, bubbles: true, cancelable: true, composed: true};
      const enterDown = new CustomEvent('keydown', init);
      const enterUp = new CustomEvent('keyup', init);

      (enterDown as unknown as HasKeyCode).keyCode = 13;
      (enterUp as unknown as HasKeyCode).keyCode = 13;

      mdcRoot!.dispatchEvent(enterDown);
      mdcRoot!.dispatchEvent(enterUp);


      const action = await awaitEvent(element, CLOSED_EVENT);
      assert.isTrue(clickCalled);

      assert.strictEqual(action.detail.action, 'ok');
    });

    teardown(async () => {
      if (element && element.open) {
        element.open = false;
        await awaitEvent(element, CLOSED_EVENT);
      }

      if (fixt) {
        fixt.remove();
      }

      if (distFocusFixt) {
        distFocusFixt.remove();
      }
    });
  });

  suite('disconnecting', () => {
    let container: HTMLElement;

    setup(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    teardown(() => {
      document.body.removeChild(container);
    });

    test('open event is cancelled when disconnected', async () => {
      const dialog = document.createElement('mwc-dialog');
      let sawOpenEvent = false;
      dialog.addEventListener(OPENED_EVENT, () => {
        sawOpenEvent = true;
      });
      container.appendChild(dialog);
      dialog.open = true;
      container.removeChild(dialog);
      // Wait according to MDC implementation plus a little more.
      await rafPromise();
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 150 + 10);
      });
      assert.isFalse(sawOpenEvent);
    });

    test('maintains open state when disconnected and reconnected', async () => {
      const dialog = document.createElement('mwc-dialog');
      container.appendChild(dialog);
      dialog.open = true;
      await awaitEvent(dialog, OPENED_EVENT);
      assert.isTrue(dialog.open);
      assert.strictEqual(blockingElements.top, dialog);

      container.removeChild(dialog);
      assert.isTrue(dialog.open);
      assert.strictEqual(blockingElements.top, null);
      await awaitEvent(dialog, CLOSED_EVENT);
      assert.isTrue(dialog.open);
      assert.strictEqual(blockingElements.top, null);

      container.appendChild(dialog);
      await awaitEvent(dialog, OPENED_EVENT);
      assert.isTrue(dialog.open);
      assert.strictEqual(blockingElements.top, dialog);
    });
  });
});
