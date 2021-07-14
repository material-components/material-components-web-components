/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import '@material/mwc-list/mwc-list-item';

import {Corner as CornerEnum} from '@material/menu-surface/constants';
import {List} from '@material/mwc-list';
import {ListItem} from '@material/mwc-list/mwc-list-item';
import {Menu} from '@material/mwc-menu';
import {Corner, MenuCorner, MenuSurface} from '@material/mwc-menu/mwc-menu-surface';
import * as hanbi from 'hanbi';
import {html, TemplateResult} from 'lit-html';

import {fixture, ieSafeKeyboardEvent, rafPromise, TestFixture} from '../../../test/src/util/helpers';

const defaultMenu = html`<mwc-menu></mwc-menu>`;
const defaultSurface = html`<mwc-menu-surface></mwc-menu-surface>`;

interface MenuCornerInternals {
  previousMenuCorner: MenuCorner|null;
  bitwiseCorner: CornerEnum;
}

interface MenuProps {
  open: boolean;
  quick: boolean;
  wrapFocus: boolean;
  innerRole: 'menu'|'listbox';
  corner: Corner;
  x: number;
  y: number;
  absolute: boolean;
  multi: boolean;
  activatable: boolean;
  fixed: boolean;
  fullwidth: boolean;
  forceGroupSelection: boolean;
  contents: TemplateResult;
}

interface SurfaceProps {
  quick: boolean;
  open: boolean;
  fixed: boolean;
  fullwidth: boolean;
  contents: TemplateResult;
  menuCorner: MenuCorner;
}

type WindowWithShadyDOM = {
  ShadyDOM?: {inUse: boolean};
}&Window;

const menu = (propsInit: Partial<MenuProps>) => {
  return html`
    <mwc-menu
      .open=${propsInit.open === true}
      .quick=${propsInit.quick === true}
      .wrapFocus=${propsInit.wrapFocus === true}
      .innerRole=${propsInit.innerRole ?? 'menu'}
      .corner=${propsInit.corner ?? 'TOP_START'}
      .x=${propsInit.x ?? null}
      .y=${propsInit.y ?? null}
      .absolute=${propsInit.absolute === true}
      .multi=${propsInit.multi === true}
      .activatable=${propsInit.activatable === true}
      .fixed=${propsInit.fixed === true}
      .fullwidth=${propsInit.fullwidth === true}
      .forceGroupSelection=${propsInit.forceGroupSelection === true}>
      ${propsInit.contents ?? html``}
    </mwc-menu>
  `;
};

const surface = (propsInit: Partial<SurfaceProps>) => {
  return html`
    <mwc-menu-surface
      .quick=${propsInit.quick === true}
      .fixed=${propsInit.fixed === true}
      .menuCorner=${propsInit.menuCorner ?? 'START'}
      .fullwidth=${propsInit.fullwidth === true}
      .open=${propsInit.open === true}>
      ${propsInit.contents}
    </mwc-menu-surface>`;
};

describe('mwc-menu', () => {
  let fixt: TestFixture;
  let element: Menu;

  afterEach(() => {
    fixt.remove();
  });

  describe('basic', () => {
    beforeEach(async () => {
      fixt = await fixture(defaultMenu);
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    it('initializes as an mwc-menu', () => {
      expect(element).toBeInstanceOf(Menu);
      expect(element.open).toEqual(false);
      expect(element.quick).toEqual(false);
      expect(element.wrapFocus).toEqual(false);
      expect(element.innerRole).toEqual('menu');
      expect(element.corner).toEqual('TOP_START');
      expect(element.x).toEqual(null);
      expect(element.y).toEqual(null);
      expect(element.absolute).toEqual(false);
      expect(element.multi).toEqual(false);
      expect(element.activatable).toEqual(false);
      expect(element.fixed).toEqual(false);
      expect(element.forceGroupSelection).toEqual(false);
      expect(element.fullwidth).toEqual(false);
    });

    it('surface is visible when open', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(surface.hasAttribute('hidden')).toBeTrue();
      expect(surface.open).toBeFalse();
      element.open = true;
      await element.updateComplete;
      expect(surface.hasAttribute('hidden')).toBeFalse();
      expect(surface.open).toBeTrue();
    });

    it('`items` returns list items', async () => {
      element.innerHTML = '<mwc-list-item>1</mwc-list-item>';
      element.layout(true);
      await element.updateComplete;
      const items = element.items;
      expect(items.length).toEqual(1);
      expect(items[0]).toEqual(element.children[0] as ListItem);
    });

    it('`anchor` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.anchor).toEqual(null);
      expect(surface.anchor).toEqual(null);
      element.anchor = document.body;
      await element.updateComplete;
      expect(surface.anchor).toEqual(document.body);
    });

    it('`quick` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.quick).toEqual(false);
      expect(surface.quick).toEqual(false);
      element.quick = true;
      await element.updateComplete;
      expect(surface.quick).toEqual(true);
    });

    it('`corner` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.corner).toEqual('TOP_START');
      expect(surface.corner).toEqual('TOP_START');
      element.corner = 'BOTTOM_START';
      await element.updateComplete;
      expect(surface.corner).toEqual('BOTTOM_START');
    });

    it('`menuCorner` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.menuCorner).toEqual('START');
      expect(surface.menuCorner).toEqual('START');
      element.menuCorner = 'END';
      await element.updateComplete;
      expect(surface.menuCorner).toEqual('END');
    });

    it('`x` and `y` are passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.x).toEqual(null);
      expect(element.y).toEqual(null);
      expect(surface.x).toEqual(null);
      expect(surface.y).toEqual(null);
      element.x = 111;
      element.y = 101;
      await element.updateComplete;
      expect(element.x).toEqual(111);
      expect(element.y).toEqual(101);
      expect(surface.x).toEqual(111);
      expect(surface.y).toEqual(101);
    });

    it('`absolute` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.absolute).toEqual(false);
      expect(surface.absolute).toEqual(false);
      element.absolute = true;
      await element.updateComplete;
      expect(element.absolute).toEqual(true);
      expect(surface.absolute).toEqual(true);
    });

    it('`fixed` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.fixed).toEqual(false);
      expect(surface.fixed).toEqual(false);
      element.fixed = true;
      await element.updateComplete;
      expect(element.fixed).toEqual(true);
      expect(surface.fixed).toEqual(true);
    });

    it('`fullwidth` is passed to surface', async () => {
      const surface =
          element.shadowRoot!.querySelector<MenuSurface>('.mdc-menu')!;
      expect(element.fullwidth).toEqual(false);
      expect(surface.fullwidth).toEqual(false);
      element.fullwidth = true;
      await element.updateComplete;
      expect(element.fullwidth).toEqual(true);
      expect(surface.fullwidth).toEqual(true);
    });

    it('correct roles are passed to inner list', async () => {
      const list =
          element.shadowRoot!.querySelector<List>('.mdc-deprecated-list')!;
      expect(element.innerRole).toEqual('menu');
      expect(list.innerRole).toEqual('menu');
      expect(list.itemRoles).toEqual('menuitem');
      element.innerRole = 'listbox';
      await element.updateComplete;
      expect(list.innerRole).toEqual('listbox');
      expect(list.itemRoles).toEqual('option');
    });

    it('`activatable` is set on inner list', async () => {
      const list =
          element.shadowRoot!.querySelector<List>('.mdc-deprecated-list')!;
      expect(element.activatable).toEqual(false);
      expect(list.activatable).toEqual(false);
      element.activatable = true;
      await element.updateComplete;
      expect(element.activatable).toEqual(true);
      expect(list.activatable).toEqual(true);
    });
  });

  describe('multi', () => {
    beforeEach(async () => {
      fixt = await fixture(menu({
        multi: true,
        open: true,
        contents: html`
          <mwc-list-item>1</mwc-list-item>
          <mwc-list-item>2</mwc-list-item>`
      }));
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    it('`multi` is set on inner list', async () => {
      const list =
          element.shadowRoot!.querySelector<List>('.mdc-deprecated-list')!;
      expect(element.multi).toEqual(true);
      expect(list.multi).toEqual(true);
      element.multi = false;
      await element.updateComplete;
      expect(element.multi).toEqual(false);
      expect(list.multi).toEqual(false);
    });

    it('clicking items sets selection', async () => {
      const item0 = element.children[0] as ListItem;
      const item1 = element.children[1] as ListItem;
      item0.click();
      item1.click();
      const items = element.selected! as ListItem[];
      expect(items[0]).toEqual(item0);
      expect(items[1]).toEqual(item1);
    });
  });

  describe('grouped', () => {
    let originalSetTimeout: typeof window.setTimeout;

    beforeEach(async () => {
      originalSetTimeout = window.setTimeout;
      // tslint:disable-next-line
      (window as any).setTimeout = (fn: () => unknown) => {
        fn();
        return -1;
      };
      fixt = await fixture(menu({
        multi: true,
        open: true,
        contents: html`
          <mwc-list-item group="a">1a</mwc-list-item>
          <mwc-list-item group="a">1b</mwc-list-item>
          <mwc-list-item group="b">2a</mwc-list-item>
          <mwc-list-item group="b">2b</mwc-list-item>`
      }));
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    afterEach(() => {
      window.setTimeout = originalSetTimeout;
    });

    it('clicking items within one group overrides prev sel', async () => {
      const [item1a, item1b, item2a, item2b] =
          element.children as unknown as ListItem[];
      item1a.click();
      expect(element.selected!).toEqual([item1a]);
      item1b.click();
      expect(element.selected!).toEqual([item1b]);
      item2a.click();
      expect(element.selected!).toEqual([item1b, item2a]);
      item2b.click();
      expect(element.selected!).toEqual([item1b, item2b]);
    });
  });

  describe('show()', () => {
    beforeEach(async () => {
      fixt = await fixture(defaultMenu);
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    it('opens the menu', async () => {
      expect(element.open).toBeFalse();
      element.show();
      expect(element.open).toBeTrue();
    });
  });

  describe('close()', () => {
    beforeEach(async () => {
      fixt = await fixture(menu({open: true}));
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    it('closes the menu', async () => {
      expect(element.open).toBeTrue();
      element.close();
      expect(element.open).toBeFalse();
    });
  });

  describe('selection', () => {
    beforeEach(async () => {
      fixt = await fixture(menu({
        open: true,
        contents: html`
          <mwc-list-item>1</mwc-list-item>
          <mwc-list-item>2</mwc-list-item>`
      }));
      element = fixt.root.querySelector('mwc-menu')!;
      await element.updateComplete;
    });

    it('`index` returns selected index', async () => {
      const list = element.shadowRoot!.querySelector('mwc-list')!;
      expect(list.index).toEqual(-1);
      expect(element.index).toEqual(-1);
      element.select(1);
      await element.updateComplete;
      expect(list.index).toEqual(1);
      expect(element.index).toEqual(1);
    });

    it('`selected` returns selected item', async () => {
      const list = element.shadowRoot!.querySelector('mwc-list')!;
      const item = element.children[1] as ListItem;
      element.select(1);
      await element.updateComplete;
      expect(element.selected).toEqual(item);
      expect(list.selected).toEqual(item);
    });

    it('clicking an item closes the menu', async () => {
      const item = element.children[1] as ListItem;
      item.click();
      expect(element.open).toEqual(false);
      expect(element.selected).toEqual(item);
    });
  });
});

describe('mwc-menu-surface', () => {
  let fixt: TestFixture;
  let element: MenuSurface;

  afterEach(() => {
    fixt.remove();
  });

  describe('basic', () => {
    beforeEach(async () => {
      fixt = await fixture(defaultSurface);
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
    });

    it('initializes as an mwc-menu-surface', () => {
      expect(element).toBeInstanceOf(MenuSurface);
      expect(element.absolute).toEqual(false);
      expect(element.fullwidth).toEqual(false);
      expect(element.fixed).toEqual(false);
      expect(element.x).toEqual(null);
      expect(element.y).toEqual(null);
      expect(element.quick).toEqual(false);
      expect(element.open).toEqual(false);
      expect(element.corner).toEqual('TOP_START');
      expect(element.menuCorner).toEqual('START');
      expect((element as unknown as MenuCornerInternals).bitwiseCorner)
          .toEqual(CornerEnum.TOP_START);
    });
  });

  describe('fixed', () => {
    beforeEach(async () => {
      fixt = await fixture(surface({fixed: true}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
    });

    it('sets correct class', async () => {
      const fixedClass = 'mdc-menu-surface--fixed';
      const surface = element.shadowRoot!.querySelector('.mdc-menu-surface')!;
      expect(surface.classList.contains(fixedClass)).toBeTrue();
      element.fixed = false;
      await element.updateComplete;
      expect(surface.classList.contains(fixedClass)).toBeFalse();
    });
  });

  describe('fullwidth', () => {
    beforeEach(async () => {
      fixt = await fixture(surface({fullwidth: true}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
    });

    it('sets correct class', async () => {
      const fullwidthClass = 'mdc-menu-surface--fullwidth';
      const surface = element.shadowRoot!.querySelector('.mdc-menu-surface')!;
      expect(surface.classList.contains(fullwidthClass)).toBeTrue();
      element.fullwidth = false;
      await element.updateComplete;
      expect(surface.classList.contains(fullwidthClass)).toBeFalse();
    });
  });

  describe('open/close', () => {
    beforeEach(async () => {
      fixt = await fixture(surface({quick: true}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
    });

    it('`show()` opens surface', async () => {
      element.show();
      await element.updateComplete;
      expect(element.open).toEqual(true);
    });

    it('`close()` closes surface', async () => {
      element.show();
      await element.updateComplete;
      element.close();
      expect(element.open).toEqual(false);
    });

    it('closing fires the closed event after raf', async () => {
      const fake = hanbi.spy();
      element.addEventListener('closed', fake.handler);
      element.show();
      await element.updateComplete;
      await rafPromise();
      element.close();
      await element.updateComplete;
      await rafPromise();
      expect(fake.called).toBeTrue();
    });

    it('closing fires the closing event immediately', async () => {
      const fake = hanbi.spy();
      element.addEventListener('closing', fake.handler);
      element.show();
      await element.updateComplete;
      await rafPromise();
      element.close();
      await element.updateComplete;
      expect(fake.called).toBeTrue();
    });

    it('opening fires the opened event', async () => {
      const fake = hanbi.spy();
      element.addEventListener('opened', fake.handler);
      element.show();
      await element.updateComplete;
      await rafPromise();
      expect(fake.called).toBeTrue();
    });

    it('escape key closes surface', async () => {
      const surface = element.shadowRoot!.querySelector('.mdc-menu-surface')!;
      element.show();
      await element.updateComplete;
      await rafPromise();

      // escape keycode
      const escEv = ieSafeKeyboardEvent('keydown', 27);
      surface.dispatchEvent(escEv);

      await rafPromise();
      await element.updateComplete;
      expect(element.open).toBeFalse();
    });

    it('clicking outside the surface closes surface', async () => {
      element.show();
      await element.updateComplete;
      await rafPromise();
      document.body.dispatchEvent(new MouseEvent('click'));
      await rafPromise();
      await element.updateComplete;
      expect(element.open).toBeFalse();
    });

    it('respects stayOpenOnBodyClick', async () => {
      element.stayOpenOnBodyClick = true;
      element.show();
      await element.updateComplete;
      await rafPromise();
      document.body.dispatchEvent(new MouseEvent('click'));
      await rafPromise();
      await element.updateComplete;
      expect(element.open).toBeTrue();
    });
  });

  describe('menuCorner', () => {
    beforeEach(async () => {
      fixt = await fixture(surface({quick: true}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
    });

    it('`menuCorner` doesnt flip corners on init', async () => {
      const internals = element as unknown as MenuCornerInternals;
      expect(internals.previousMenuCorner).toEqual(null);
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_START);
      expect(element.corner).toEqual('TOP_START');
    });

    it('`menuCorner` flips corners on init with `END`', async () => {
      await fixt.remove();
      fixt = await fixture(surface({quick: true, menuCorner: 'END'}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      await element.updateComplete;
      const internals = element as unknown as MenuCornerInternals;
      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');
    });

    it('`menuCorner` flips after initialization', async () => {
      const internals = element as unknown as MenuCornerInternals;

      element.menuCorner = 'END';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');

      element.menuCorner = 'START';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('START');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_START);
      expect(element.corner).toEqual('TOP_START');
    });

    it('`menuCorner` wont flip with invalid/same val', async () => {
      const internals = element as unknown as MenuCornerInternals;

      (element as unknown as {menuCorner: 'end'}).menuCorner = 'end';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual(null);
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_START);
      expect(element.corner).toEqual('TOP_START');

      element.menuCorner = 'START';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual(null);
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_START);
      expect(element.corner).toEqual('TOP_START');

      element.menuCorner = 'END';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');

      (element as unknown as {menuCorner: 'start'}).menuCorner = 'start';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');

      element.menuCorner = 'END';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');
    });

    it('`corner` internals flip when `menuCorner` flipped', async () => {
      const internals = element as unknown as MenuCornerInternals;

      element.corner = 'TOP_END';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual(null);
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_END');

      element.menuCorner = 'END';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_START);
      expect(element.corner).toEqual('TOP_END');

      element.corner = 'TOP_START';

      await element.updateComplete;

      expect(internals.previousMenuCorner).toEqual('END');
      expect(internals.bitwiseCorner).toEqual(CornerEnum.TOP_END);
      expect(element.corner).toEqual('TOP_START');
    });
  });

  describe('focus', () => {
    let focusedElement: HTMLElement;
    let innerFocusedElement: HTMLElement;

    beforeEach(async () => {
      focusedElement = document.createElement('input');
      document.body.appendChild(focusedElement);
      const contents = html`<input>`;
      fixt = await fixture(surface({quick: true, contents}));
      element = fixt.root.querySelector('mwc-menu-surface')!;
      innerFocusedElement = fixt.root.querySelector('input')!;
      await element.updateComplete;
    });

    afterEach(() => {
      focusedElement.parentNode!.removeChild(focusedElement);
    });

    it('focus is restored after closing', async () => {
      const w: WindowWithShadyDOM = window;
      if (w.ShadyDOM && w.ShadyDOM.inUse) {
        /*
         * skip tests in IE due to rendering bug. Absolute div will not show
         * unless mouse interaction causes it to render. This means that the
         * inner input cannot be focused.
         */
        return;
      }

      focusedElement.focus();
      element.show();
      await element.updateComplete;
      await rafPromise();
      innerFocusedElement.focus();
      await rafPromise();
      expect(document.activeElement).toEqual(fixt);
      expect(fixt.shadowRoot!.activeElement).toEqual(innerFocusedElement);
      element.close();
      await rafPromise();
      await element.updateComplete;
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      expect(document.activeElement).toEqual(focusedElement);
    });
  });
});
