# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## Unreleased

### Changed
- all
  - Update sass build to match internal imports and naming
  - Switch testing from Mocha to Jasmine
  - **BREAKING:** Changed all instances of `static get styles = styles;` to be
    an array of `[styles]`
- base
  - **BREAKING:** Removed `findAssignedElement` from utils, use
    `@queryAssignedNodes` lit decorator instead.
- fab
  - **BREAKING** renderIcon currently doesn't do anything until an internal
    google bug is resolved

### Fixed
- `select`
  - Fix setting `aria-labelledby` only when a label is actually provided
- `textarea`
  - Fix setting `aria-labelledby` only when a label is actually provided
- `textfield`
  - Fix `firstUpdated` code path to avoid a race condition in initialization with `notched-outline`
  - Fix setting `aria-labelledby` only when a label is actually provided
  - Remove definition of invalid `aria-errortext` attribute

- An infinite loop caused by having both `_getUpdateComplete` and
  `getUpdateComplete` introduced by lit-element 2.5.0

### Added

- `button`
  - Add `ariaHasPopup` property
- `icon-button`
  - Add `ariaHasPopup` property

## [v0.21.0] - 2021-04-30

### Changed

- all
  - Upgrade typescript to 4.1.4
  - Change all fields from `private` to `protected`
- `base`
  - Clean up RippleInterface now that the ripple directive has been removed
  - Remove `HTMLElementWithRipple` interface
  - Clean up `ripple` property typing
- `checkbox`
  - Remove underscores from internal event handler functions
- `floating-label`
  - Using new directive syntax
- `line-ripple`
  - Using new directive syntax
- `menu`
  - Added new `closing` event triggering any immediate action that must be taken
    without waiting for animations to finish.
  - BREAKING(VISUAL): Added a min-width of 112px to be in line with material
    spec.
- `ripple`
  - Use css.declaration in ripple-theme.scss
  - Remove RippleAPI interface, merged with RippleInterface in base
  - Remove mwc-ripple-global.scss, which was only used for the ripple directive
- `select`
  - Added `fixedMenuPosition` to allow menu overlaying in nested absolute
    contexts e.g. dialog.
- `snackbar`
  - Removed directive and inlined implementation to element


### Fixed

- all
  - Format sass files with prettier
- `circular-progress`
  - Support setting `aria-label` attribute
- `dialog`
  - Blocking elements will not throw if dialog is closed and removed from DOM
    before opening animation is completed.
  - Memory leak with document event listener
  - Only bind event listeners once in `firstUpdated`
- `fab`
  - Added missing documentation for extended-(label|icon)-padding custom props
- `FormElement`
  - FormElement checks if `change` event re-refiring is needed
- `icon-button`
  - Fixed `label` property to use `aria-label` attribute
- `icon-button-toggle`
  - Fixed `label` property to use `aria-label` attribute
- `linear-progress`
  - Fixed `ariaLabel` property to use `aria-label` attribute
- `list`
  - Fix issue with diff indices of different digit length
- `ripple`
  - Fix IE11 errors with `isActive()`
  - Fix cases where `hover` effect is stuck when toggling `disabled`
- `select`
  - menu not opening when disabled initially set
- `tab`
  - Clean up fixture typing so that tests work when reordered

### Added

- `base`
  - Add `@ariaProperty` decorator
- `checkbox`
  - Add `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`, and `name` properties
- `fab`
  - Added `--mdc-fab-focus-outline-color`
  - Added `--mdc-fab-focus-outline-width`
- `select`
  - Forwarded `layoutOptions` method from foundation
- `switch`
  - Add `ariaLabel` and `ariaLabelledBy` properties
- `radio`
  - Add `ariaLabel` and `ariaLabelledBy`
- `slider`
  - Add `ariaLabel` and `ariaLabelledBy`

## [v0.20.0] - 2020-12-03

### Changed

- `ripple_directive`
  - Remove in favor of `mwc-ripple`

### Added

- `button`
  - Insertion point for an elevation overlay
  - `--mdc-button-raised-box-shadow-hover`

### Fixed

- `textfield`
  - inconsistencies of autovalidation when it's turned off.
- Tapping on tappable components no longer triggers tap highlight
- `checkbox`
  - Changed display to `inline-flex` to fix layout issues

### Changed

- `textfield`
  - `autoValidate` now validates on value change rather than input
- `ripple`
  - Renamed custom property `--m-ripple-z-index` => `--mdc-ripple-z-index`.

- `list`
  - List items removal from DOM initiates an async layout in the managing list
  - Added `itemsReady` promise to the list's updateComplete

- `tab`
  - Calling `activate()` before first render does not throw an error.

## [v0.19.1] - 2020-10-08

### Fixed

- `linear-progress`
  - Fix distributed build by including ResizeObserver types

## [v0.19.0] - 2020-10-07

### Added

- `button`
  - Sass theming mixins added
- `base-element`
  - BaseElement.click() forwards focus to BaseElement.mdcRoot
- `elevation-overlay`
  - implemented elevation overlay styles
- `fab`
  - `reducedTouchTarget` reduces the touch target on mini fab
- `form-element`
  - FormElement.click() forwards focus to FormElement.formElement
- `list`
  - export for `ActionDetail`
  - export for `SelectedDetail`
- `menu`
  - `--mdc-menu-max-height` to set max height on menu
- `tab`
  - export for `TabInteractionEventDetail`
  - fix race condition on safari

### Changed

- `fab`
  - **BREAKING:VISUAL** default touch target increased on mini fab by 8px.
- `button`
  - Separate classMap into its own method

### Fixed

- Unpkg integration should properly dedupe after removing file extensions from imports
- `button`
  - outline color should default to on-surface with 12% opacity
  - disabled outline color should default to on-surface with 12% opacity
- `fab`
  - **BREAKING:VISUAL** vertical alignment is now all inline and up to spec.
- `icon-button-toggle`
  - removed aria-hidden="true" from button
- `linear-progress`
  - Fixed performance issues with indeterminate set on modern browsers
  - Animations no longer run when indicator has been closed.
- `menu`
  - Fixed a wrong export of `DefaultFocusState` from `mwc-menu.ts`

## [v0.18.0] - 2020-08-03

### Changed

- `fab`
  - **BREAKING** removed `--mdc-fab-box-shadow-hover`; use `--mdc-fab-box-shadow`
  - **BREAKING** removed `--mdc-fab-box-shadow-active`; use `--mdc-fab-box-shadow`
  - Ripple now uses and exposes `mwc-ripple`'s CSS custom properties API
- `icon-button`
  - **BREAKING** now uses lazy `mwc-ripple` in its implementation
- `icon-button-toggle`
  - **BREAKING** now uses lazy `mwc-ripple` in its implementation
- `select`
  - render methods have been renamed and reorganized (breaking if extending and
    overriding)
- `slider`
  - An upcoming change will migrate the slider to use the MDC M2 slider. In
    preparation for this, the MWC slider => MDC slider dependency will not be
    updated until the migration is complete.
- `textfield`
  - render methods have been renamed and reorganized (breaking if extending and
    overriding)
  - remove extra space between label and required asterisk (`*`)
- `top-app-bar(-fixed)`
  - `--mdc-top-app-bar-width` is now configurable

### Fixed

- `button`
  - ripple will unripple when mouse/touchend happens outside of button
- `checkbox`
  - Remove animation class after the animation ends to prevent replaying animations when hidden and shown, or removed and readded to the DOM
- `select`
  - label will be highlighted before selected text during horizontal navigation
    for screen readers
  - filled variant now has a ripple
- `textarea`
  - label will be highlighted before input during horizontal navigation for
    screen readers
  - minlength attribute is now supported
  - inputmode attribute is now supported
  - autocapitalize attribute is now supported
  - remove extra space between label and required asterisk (`*`)
- `textfield`
  - label will be highlighted before input during horizontal navigation for
    screen readers
  - remove extra space between label and required asterisk (`*`)

### Added

  - `mwc-circular-progress` implemented.
  - `mwc-circular-progress-four-color` implemented.

## [v0.17.2] - 2020-06-29

### Fixed

- prod dependency breakage based on `@material/dom`

## [v0.17.1] - 2020-06-29

- unused GH tag

## [v0.17.0] - 2020-06-29

### Added

- `linear-progress`
  - theming sass helpers.

### Changed

- `notched-outline`
  - **BREAKING** removed border-radius and leading-width custom properties in favor of `--mdc-shape-small`
- `textarea`
  - **BREAKING** shape is now customized with `--mdc-shape-small`
- `textfield`
  - **BREAKING** shape is now customized with `--mdc-shape-small`

## [v0.16.0] - 2020-06-29

### Fixed

- `mwc-list-item`
  - get rid of mobile os glow on tap
  - do not set aria-selected on incompatible roles
  - ripple will unrip if unclick or touchend is outside of list-item
- `mwc-list`
  - fixed regression in list that broke mwc-select in IE or shady dom.
- Tabs no longer focus on initialization
- mwc-list-item ripple color will now change based off of --mdc-ripple-color on initialization
- Fix issue where textfield would throw an error when fed a non-string value
- list selected item will update if selected item is disconnected
- `floating-label`: in both `select` and `textfield` the user no longer has to call layout when changing label or outlined

### Added

- `textarea`
  - added separate internal and external character counters
- `textfield`
  - added support for autocapitalize attribute
- `--mdc-drawer-width` Drawer width is now configurable.
- Added `name` property `mwc-textfield` & `mwc-textarea` for browser autofill.
- `ListItem.multipleGraphics` list-item graphic width now configuratble for multiple graphics
- `Menu.menuCorner` can now configure from which horizontal corner should the menu anchor from.
- Add `reducedTouchTarget` param to `mwc-checkbox` to control touchscreen accessibility.
- Typeahead on `mwc-select`
- Added `focusItemAtIndex(index)` and `getFocusedItemIndex` to both `list` and `menu`
- Add `--m-ripple-z-index` to control ripple z-index.

### Changed

- `radio`
  - **BREAKING** renamed `SelectionController` to `SingleSelectionController`
  - **BREAKING** moved `SingleSelectionController` to `@material/mwc-radio/single-selection-controller.ts`
  - `SingleSelectionController` now accepts `CheckableElements` rather than just MWC Radio elements
- `textarea`
  - **BREAKING** character counters are now external by default
  - **BREAKING** removed `fullwidth` variant
- `textfield`
  - **BREAKING** removed `fullwidth` variant
- **BREAKING** `--mdc-tab-border-radius` has been removed to align with spec
- **BREAKING** replaced `--mdc-dialog-shape-radius` with `--mdc-shape-medium`
- **BREAKING** mwc-checkbox sizing changed to 48x48 by default for touch accessibility. Disable with `reducedTouchTarget` attribute or property.
- **BREAKING** mwc-select's fullwidth property removed since it was behaving as initially expected. Use `width: 100%` on the root element to accomplish fullwidth.

## [v0.15.0] - 2020-05-05

### Added

- Added --mdc-menu-z-index to menu-surface
- Added surface/on-surface theme properties for mwc-switch
- Added overrides for ripple focus and hover opacities
  - `--mdc-ripple-focus-opacity` and `--mdc-ripple-hover-opacity` respectively
- Added `spaceBetween` to mwc-formfield
- Added `activated` and `selected` states for ripple
- Added documentation for ripple
- Prefix and suffix to mwc-textfield
- `mwc-formfield` now has a nowrap property
- mdc-button now has --mdc-shape-small for border radii
- Added `size` property to `mwc-textfield`
- `mwc-fab` now has a slot of icons
- Added `fullwidth` property to `mwc-select`.
- Added `minLength` to `mwc-textfield`

### Changed

- Refactor `mwc-checkbox`
  - Remove usage of `MDCCheckboxFoundation`
  - Replace `ripple-directive` with lazy `mwc-ripple`
- Refactor `mwc-button`
  - Replace `ripple-directive` with lazy `mwc-ripple`
- Refactor `mwc-ripple`
  - Normalized API to `start${state}` `end${state}` naming
- **BREAKING:VISUAL:** mwc-list-item now internally uses mwc-ripple instead of styling ripple on host
- `mwc-menu`'s `quick` variant now opens synchronously
- Convert to [Sass modules](https://sass-lang.com/documentation/at-rules/use)
- **BREAKING** removed textfield's character counter foundation directive
- Refactor `mwc-select`
  - **BREAKING:VISUAL** internal structure of select anchor updated.
  - **BREAKING** `naturalWidth` property renamed to `naturalMenuWidth` for clarity.
  - **BREAKING:** `--mdc-select-dropdown-icon-opacity` and `--mdc-select-disabled-dropdown-icon-opacity` removed; opacity is now expressed in alpha channel of color.
  - **BREAKING:VISUAL:** Dropdown arrow icon motion updated.
  - **BREAKING** remove `helperPersistent` property; helper text now persistent by default if included.
- Refactor snackbar to conform to other elements' `.open` `.show()` `.close()` APIs
  - **BREAKING** mwc-snackbar `isOpen` property is now called `open`
  - **BREAKING** mwc-snackbar `open()` method is now called `show()`
  - **BREAKING** mwc-snackbar's isOpen -> open property is now editable
- Removed default slot from switch
- mwc-select's button role changed to combobox

### Fixed

- Fix property renaming issues with Closure Compiler
  - Use `RippleAPI` interface between `RippleHandlers` and `mwc-ripple`
  - Use `RippleInterface` interface for `ripple-directive`
- Fix regression in textfield line color custom properties
- Fix infinite loop bug in `mwc-tab-bar` when `activeIndex` is set in first render
- Fixed bug in `mwc-slider` where initializing min and max over `100` would not set correct bounds on UI.
- Fixed `"` showing up in mwc-button when the ripple activates
- Changing an invalid textfield's validation properties to valid values will update styles automatically

## [v0.14.1] - 2020-03-23

### Added

- `innerAriaLabel` to `mwc-list` to set `aria-label`.
- `--mdc-text-field-disabled-line-color` added

### Changed

- Update `lit-element` dependency to `2.3.0` for all components.

### Fixed

## [v0.14.0] - 2020-03-19

### Added

- `inputMode` to `mwc-textfield` and `mwc-textarea`
- `readOnly` to `mwc-textfield` and `mwc-textarea`
- CSS custom properties for typography
- Added `autoValidate` property on textfield
- `mwc-button` now has a slot for `icon` and `trailingIcon`
- **BREAKING** setting `mwc-list-item.selected` will update selection in the parent list
- `mwc-ripple` now has CSS properties `--mdc-ripple-color`, `--mdc-ripple-fg-opacity`, and `--mdc-ripple-hover-opacity`
- Added `RippleHandlers` to `mwc-ripple` to provide an easy integration point for calling ripple API.
- Added `light` property to `mwc-ripple` to help style ripples on dark surfaces.
- `mwc-select` can now select items by setting `mwc-select.value`.
- Exposed --mdc-shape-medium on mwc-menu-surface
- Added `focusOnActivate` property to `mwc-tab`
  - `true` by default, set to `false` to disable focusing on tab activation
- mwc-select now has --mdc-select-disabled-dropdown-icon-color

### Changed

- **BREAKING** `--mdc-button-text-transform` has been renamed to `--mdc-typography-button-text-transform`
- **BREAKING** `--mdc-button-letter-spacing` has been renamed to `--mdc-typography-button-letter-spacing`
- **BREAKING** `--mdc-tab-text-transform` has been renamed to `--mdc-typography-button-text-transform`
- **BREAKING:VISUAL** textfield will now only validate on blur instead of input without `autoValidate` prop
- **BREAKING:VISUAL** `mwc-tab`'s default slot now has name `icon`
- `mdcFoundation` and `mdcFoundationClass` are now optional in BaseElement.
- Remove `export *` from BaseElement and FormElement.
- **BREAKING:A11Y** mwc-list will no longer update items on slotchange but on first render and on list item connect meaning list dividers will only add role="separator" in those cases
- Make FormElement and `mwc-formfield` support asynchronous ripple properties
- **BREAKING** Remove `active` property from `mwc-ripple`.
  - Use `activate()` and `deactivate()` methods instead
- **BREAKING** `mwc-ripple` now requires implementing event handlers manually in the parent component.
- **BREAKING** Components must now import `@observer` manually from `@material/mwc-base/observer`;

### Fixed

- Setting `scrollTarget` on `mwc-top-app-bar` will update listeners
- Fixed sass imports of `_index.scss` files
- Fixed issue with caret jumping to end of input on textfield
- mwc-list-item now works on IE
- mwc-select's `updateComplete` will now properly await child custom elements' `updateComplete`s
- **BREAKING** Disabled icon buttons no longer have pointer events
- `mwc-textfield` will not set `value` on the internal input tag on `input` event causing caret jumping in Safari
- `mwc-select`'s `--mdc-select-ink-color` actually does something now
- Setting `disabled` on `mwc-ripple` will hide the ripple
- mwc-menu's x and y anchor margins now work for all corners
- mwc-select's --mdc-select-disabled-ink-color now colors the selected text
- inconsistencies on how `<contol>-list-item`s' state of controls and element
- `list` sets initial `tabindex` when initialized with `noninteractive` and then set to false

## [0.13.0] - 2020-02-03

### Added

- End-alignment to `mwc-textfield` and `mwc-textarea`
- Implemented:
  - `mwc-select`
  - `mwc-menu`
  - `mwc-menu-surface`
  - `mwc-list`
  - `mwc-list-item`
- Base / utils.ts
  - `isNodeElement` - performant node -> element checking
  - `deepActiveElementPath` - finds the deepest `activeElement` node
  - `doesElementContainFocus` - determines is ancestor of `activeElement`
- `mwc-radio.global` - groups radios across document rather than shadow root
- Style underline of filled textfield
  - `--mdc-text-field-idle-line-color`
  - `--mdc-text-field-hover-line-color`

### Fixed

- Fixed mwc-dialog not removing keydown event listener on close.

## [0.12.0] - 2019-12-16

### Changed

- **BREAKING:VISUAL** Wrap mwc-button label in a slot
- Remove mwc-button border-radius from ripple
- Make mwc-button internal button overflow none

### Added

- Added custom properties to style `mwc-radio`'s colors
- CSS styling options to `mwc-tab`
- `active` attribute to `mwc-tab` when (de)activated
- Added  custom properties to style `mwc-checkbox`'s colors
- Added `show` and `close` methods to `mwc-dialog`

### Fixed

- **BREAKING:VISUAL** `mwc-tab` will now automatically size slotted images. Also
  slotted image will override icon font.

### Changed

- **BREAKING** `mwc-tab` can now only have slotted content via the
  `hasImageIcon` flag.
- **BREAKING:VISUAL** `mwc-checkbox` default display is changed from inline to inline-block.

## [0.11.1] - 2019-11-26

### Fixed

- Restore removed code in linear progress adapter

## [0.11.0] - 2019-11-26

### Added

- CSS styling options to `mwc-button`
- CSS styling options to `mwc-textfield`
- README for `mwc-drawer`
- README for `mwc-checkbox`
- README for `mwc-formfield`
- Demo for `mwc-drawer` without a header in the drawer
- `--mdc-icon-button-size` and `--mdc-icon-size` to `mwc-icon-button`

### Changed

- **BREAKING** `Dialog.title` renamed to `Dialog.heading` and
  `--mdc-dialog-title-ink-color` renamed to `--mdc-dialog-heading-ink-color` as
  it caused clashes with `HTMLElement.prototype.title`.
- Updated material dependencies to `4.0.0-canary.735147131.0`.
- **BREAKING** `Slider.discrete` removed and `Slider.pin` added.
- `mwc-dialog` will now search its flattened distributed nodes and their trees
  for a focusable element.
- **BREAKING** `mwc-slider` now emits bubbling and composed `input` and `change`
  events instead of `MDCSlider:input` and `MDCSlider:change`.
- **BREAKING:VISUAL** the digits inside the `Slider`'s pin will be rounded to at
  most 3 decimal digits.
- **BREAKING** `LinearProgress.determinate = false` removed in favor of `LinearProgres.indeterminate = false`.
- **BREAKING** `LinearProgress.buffer = 0` default value changed to `1`.
- **BREAKING:VISUAL** `mwc-linear-progress` had `--mdc-theme-secondary` applied
  to its buffer bar's background color. This custom property's name was changed
  to `--mdc-linear-progress-buffer-color`.
- **BREAKING:VISUAL** the digits inside the `Slider`'s pin will be rounded to at
  most 3 decimal digits.
- **BREAKING** `LinearProgress.determinate = false` removed in favor of `LinearProgres.indeterminate = false`.
- **BREAKING** `LinearProgress.buffer = 0` default value changed to `1`.
- **BREAKING:VISUAL** `mwc-linear-progress` had `--mdc-theme-secondary` applied
  to its buffer bar's background color. This custom property's name was changed
  to `--mdc-linear-progress-buffer-color`.
- **BREAKING** `mwc-icon-button` will now use its default slot for `<img>` or
  `<svg>` icons instead of a named "icon" slot.

### Fixed
- Fixed checkbox ripple visibility when focused while being unchecked.
- Fixed app content not being expanded inside drawer.
- Fixed issue where slider when resized or scrolled will not respond to touch
  as expected.
- Fixed issue where `mwc-ripple` would not ripple when parent was a shadow root
- **BREAKING:VISUAL** Fixed sizing of the `mwc-icon-button` in `mwc-snackbar`
- Fixed `mwc-icon-button` icon at end layout.
- `mwc-slider` can now have its pin and markers added and changed
  dynamically.
- Fixed `mwc-icon-button` icon at end layout.
- `mwc-slider` can now have its pin and markers added and changed
  dynamically.
- Fixed `mwc-dialog` race-condition bug with the blocking elements polyfill that
  could occur if the dialog was disconnected before it had finished opening.
- Fixed `mwc-button` alignment issues when some buttons have icons and others do
  not.

## [0.10.0] - 2019-10-11

### Added

- `mwc-textfield` ink and fill css variables

### Changed

- **BREAKING** Removed `mwc-icon-font.js` import. Most users should load the
  Material Icons and Roboto fonts by adding the following to their HTML file:

  ```html
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
  ```

  See the [Fonts](https://github.com/material-components/material-components-web-components#fonts)
  section of the README for more details.

- **BREAKING** Moved `@material/mwc-textfield/character-counter/mwc-character-counter-directive.js`
  to `@material/mwc-textfield/mwc-character-counter-directive.js`.

### Fixed

- Fixed `mwc-dialog`'s issues with working on older browsers.
- `<mwc-radio>` groups are now correctly synchronized when stamped using a
  lit-html `map` or `repeat`, and any other time the radio is not created and
  connected at the same time ([#282](https://github.com/material-components/material-components-web-components/issues/282)).

## [0.9.1] - 2019-09-30

### Fixed

- Fixed missing `@material/mwc-base` dep on `@material/mwc-dialog`.

## [0.9.0] - 2019-09-26

### Added

- Implemented `mwc-dialog`
- `mwc-textfield.layout` method.

### Changed

- **BREAKING:** Added custom `.focus()` and `.blur()` functions to mwc-button
  that cause the button to ripple as when tab focusing.
- **BREAKING:** mwc-textfield's custom `.focus()` function will now call
  `.focus()` on the native internal input causing the caret to appear instead of
  just forcing focus styles to appear.
- **BREAKING:** mwc-textfield's custom `.blur()` function will now call
  `.blur()` on the native internal input instead of just forcing focus styles to
  disapprear.
- **BREAKING** `mwc-base/base-element` no longer exports any of the
  `lit-element` or `lit-html` APIs (e.g. `LitElement`, `customElement`,
  `classMap`). Users should import directly from the `lit-element` and
  `lit-html` modules instead.
- **BREAKING** `mwc-textfield` and `mwc-textarea` will now update their `.value`
  on the native `input`'s `input` event instead of `change`.

### Fixed

- `<mwc-drawer>` can now be used with Rollup (via version bump to pick up
  [WICG/inert#135](https://github.com/WICG/inert/pull/135)).
- `<mwc-textfield>` and `<mwc-textarea>` will now have the same height between
  their filled and outlined variants with helper text on older browsers.
- `mwc-textfield[required]` and `mwc-textarea[required]` will now have their
  required asterisk colored correctly when customized.
- `<mwc-textfield>` and `<mwc-textarea>` can now have basic usability in IE.
- `mwc-textarea[disabled][outlined]` will no longer have a filled-in background
  as is per material spec.
- `mwc-textarea[disabled]label="string!"][value="string!"]` will now float the
  label to the correct spot.


## [0.8.0] - 2019-09-03

### Changed

- Published JavaScript files no longer include inlined TypeScript helpers such
  as `__decorate`. Instead, helpers are now imported from the
  [`tslib`](https://github.com/microsoft/tslib) module dependency. This reduces
  code size by allowing multiple components to share the same helpers, and
  eliminates *"this has been rewritten to undefined"* errors from Rollup.
  ([#439](https://github.com/material-components/material-components-web-components/pull/439))

- **BREAKING** Renamed component *`base`* modules:
  ([#440](https://github.com/material-components/material-components-web-components/pull/440)):
  - `icon-button-toggle-base.ts` → `mwc-icon-button-toggle-base.ts`
  - `icon-button-base.ts` → `mwc-icon-button-base.ts`
  - `top-app-bar-fixed-base.ts` → `mwc-top-app-bar-fixed-base.ts`

## [0.7.1] - 2019-08-27

### Added
- Added "module" field in all packages' `package.json` manifests
  ([#434](https://github.com/material-components/material-components-web-components/pull/434))

## [0.7.0] - 2019-08-27

### Added
- New components:
  - [`<mwc-textfield>`](https://github.com/material-components/material-components-web-components/tree/master/packages/textfield) ([#297](https://github.com/material-components/material-components-web-components/pull/297))
  - [`<mwc-textarea>`](https://github.com/material-components/material-components-web-components/tree/master/packages/textarea) ([#297](https://github.com/material-components/material-components-web-components/pull/297))
  - [`<mwc-icon-button-toggle>`](https://github.com/material-components/material-components-web-components/tree/master/packages/icon-button-toggle) ([#370](https://github.com/material-components/material-components-web-components/pull/370))
  - [`<mwc-top-app-bar-fixed>`](https://github.com/material-components/material-components-web-components/tree/master/packages/top-app-bar-fixed) ([#379](https://github.com/material-components/material-components-web-components/pull/379))

- Added support for `<svg>` and `<img>` icons to `<mwc-icon-button>` and
  `<mwc-icon-button-toggle>`.
  ([#358](https://github.com/material-components/material-components-web-components/pull/358))

- Added `--mdc-snackbar-action-color` CSS custom property to `<mwc-snackbar>` to
  override the default action button color
  ([#354](https://github.com/material-components/material-components-web-components/pull/354)).

- Added a default slot to `<mwc-top-app-bar>` and `<mwc-top-app-bar-fixed>`
  which takes page content and automatically applies the correct `padding-top`
  ([#370](https://github.com/material-components/material-components-web-components/pull/370)).

- Added documentation for:
  - [`<mwc-button>`](https://github.com/material-components/material-components-web-components/tree/master/packages/button)
    ([#366](https://github.com/material-components/material-components-web-components/pull/366))
  - [`<mwc-fab>`](https://github.com/material-components/material-components-web-components/tree/master/packages/fab)
    ([#361](https://github.com/material-components/material-components-web-components/pull/361))
  - [`<mwc-icon-button>`](https://github.com/material-components/material-components-web-components/tree/master/packages/icon-button)
    ([#370](https://github.com/material-components/material-components-web-components/pull/370))
  - [`<mwc-radio>`](https://github.com/material-components/material-components-web-components/tree/master/packages/radio)
    ([#377](https://github.com/material-components/material-components-web-components/pull/377))
  - [`<mwc-snackbar>`](https://github.com/material-components/material-components-web-components/tree/master/packages/snackbar)
    ([#355](https://github.com/material-components/material-components-web-components/pull/355))
  - [`<mwc-top-app-bar>`](https://github.com/material-components/material-components-web-components/tree/master/packages/top-app-bar)
    ([#379](https://github.com/material-components/material-components-web-components/pull/379))

### Changed
- **BREAKING** The Material Icons font is no longer loaded automatically
  ([#314](https://github.com/material-components/material-components-web-components/pull/314)).
  This allows more control over how fonts are loaded (e.g. serving fonts from a
  different server, or loading multiple fonts with a single request). Most users
  should now add tags like this to their HTML page:

  ```html
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
  ```

- **BREAKING** The *toggling* behavior of `<mwc-icon-button>` has been removed
  (i.e. `offIcon`), and is now instead supported by the dedicated
  [`<mwc-icon-button-toggle>`](https://github.com/material-components/material-components-web-components/tree/master/packages/icon-button-toggle)
  component
  ([#370](https://github.com/material-components/material-components-web-components/pull/370)).


- **BREAKING** The *short* layout for `<mwc-top-app-bar>` has been removed, and
  is no longer supported because it is not part of the Material Design
  specification
  ([#422](https://github.com/material-components/material-components-web-components/pull/422)).


- **BREAKING** The *fixed* layout for `<mwc-top-app-bar>` has been removed, and
  is now instead implemented by the dedicated `<mwc-top-app-bar-fixed>`
  component
  ([#379](https://github.com/material-components/material-components-web-components/pull/379)).

### Fixed

- Fixed bug where `<mwc-snackbar>` `open` method threw if called immediately
  after construction (before `firstUpdated`)
  ([#356](https://github.com/material-components/material-components-web-components/pull/356)).
- Fixed bug where setting the `<mwc-snackbar>` `labelText` property could throw
  an exception and fail to render
  ([#412](https://github.com/material-components/material-components-web-components/pull/412)).
- Buttons slotted into `<mwc-snackbar>` now render with the correct default
  styles
  ([#354](https://github.com/material-components/material-components-web-components/pull/354)).
- Fixed layout issue affecting scrolling `<mwc-tab-bar>` in Firefox
  ([#349](https://github.com/material-components/material-components-web-components/pull/349)).
- Fixed bug where `<mwc-icon>` icons did not render in IE11
  ([#353](https://github.com/material-components/material-components-web-components/pull/353)).
- Fixed bug where setting the `checked` property on an `<mwc-radio>` did not
  result in the other radios in the group becoming unchecked
  ([#373](https://github.com/material-components/material-components-web-components/pull/373)).
- Fixed bug where `<mwc-drawer>` did not work in IE
  ([WICG/inert#129](https://github.com/WICG/inert/pull/129)).
- Fixed `dense` and `prominent` styling bugs in `<mwc-top-app-bar>`
  ([#379](https://github.com/material-components/material-components-web-components/pull/379)).

## [0.6.0] - 2019-06-05
- Upgrade lerna to 3.x
- Upgrade typescript to 3.4, add config for tsbuildinfo files needed for incremental compilation mode
- Add README notes that component set is in experimental status.
- Remove draft components, simplify package listing.
- Prepare drawer, icon-button, linear-progress, slider, snackbar, tab components, and top-app-bar for release.
- Fix typing for event listeners in adapters due to typescript update.
- Add wicg-inert and blocking-elements dependencies to mwc-drawer

## [0.5.0] - 2019-03-26
- Update to mdc 1.0
- Rewrite Adapters and Foundations with Typescript types
- Disable pointer-events on disabled buttons

## [0.4.0] - 2019-03-11
- Update to mdc 0.44
- fix button label issues

## [0.3.6] - 2019-02-05
- Use `static get styles()` on all components
- Clean up dependencies
- Implement drawer focus trapping
- Add tests
- Setup travis CI
- Update to lit-html 1.0

## [0.3.5] - 2019-01-11
- Update lit and lit-element dependencies
- Publish mwc-drawer

## [0.3.4] - 2018-12-13
- Update to lit-element 0.6.5 and lit-html 1.0.0-rc.1

## [0.3.3] - 2018-12-03
- Fix ripple directive for lit-html 0.13

## [0.3.2] - 2018-11-16
- Move event listeners to the class with lit-element 0.6.2
- Add `@eventOptions({passive: true})` to event handlers in tab-bar-scroller
  - More efficient scrolling behavior, as `preventDefault` is never called
- Implement icon-button in typescript

## [0.3.1] - 2018-10-08
- Fix demo publishing
- Update to lit-element 0.6.2
- Add dependencies to lit-html where necessary
- Add explicit `.js` endings to imports, where necessary
- Fill in CHANGELOG

## [0.3.0] - 2018-10-04
- Rewrite elements in typescript
- Add `ripple` lit directive to add a material ripple to any component
- Add `@observe` decorator to tie data changes into base MDC Foundation handlers
- Add a watcher for styling and typescript changes

## [0.2.1] - 2018-09-21
- Update to lit-element 0.6.1

## [0.2.0] - 2018-09-13
- Use lit-element 0.6

## [0.1.2] - 2018-06-14
- Use lit-element 0.5

## [0.1.1] - 2018-05-09
- Add READMEs and examples

## [0.1.0] - 2018-05-08
- Initial WIP of components
