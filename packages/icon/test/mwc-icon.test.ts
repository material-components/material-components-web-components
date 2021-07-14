/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Icon} from '@material/mwc-icon';


describe('mwc-icon', () => {
  let element: Icon;

  beforeEach(() => {
    element = document.createElement('mwc-icon');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('initializes as an mwc-icon', () => {
    expect(element).toBeInstanceOf(Icon);
  });

  test('sets icon color', () => {
    element.style.color = "blue";
    let icon_color = element.style.color;
    assert.equal(icon_color, "blue");
  });
  
  test('sets icon size', () => {
    element.style.fontSize = "200px";
    let icon_size = element.style.fontSize;
    assert.equal(icon_size, "200px");
  });
});
