/**
@license
Copyright 2021 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/// tslint:disable:no-any
// eslint-disable @typescript-eslint/no-explicit-any

import {PropertyDeclaration, ReactiveElement} from '@lit/reactive-element';

/**
 * Expose protected statics on UpdatingElement
 */
interface ReactiveElementInternals {
  getPropertyDescriptor(name: PropertyKey, key: string): PropertyDescriptor;
  getPropertyOptions(name: PropertyKey): PropertyDeclaration;
}

/**
 * TypeScript version of the decorator
 * @see https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators
 */
function tsDecorator(
    prototype: {}, name: string, descriptor?: PropertyDescriptor) {
  const constructor =
      (prototype.constructor as unknown as ReactiveElementInternals);
  if (!descriptor) {
    /**
     * lit-element uses internal properties with two leading underscores to
     * provide storage for accessors
     */
    const litInternalPropertyKey = `__${name}`;
    descriptor =
        constructor.getPropertyDescriptor(name, litInternalPropertyKey);
    if (!descriptor) {
      throw new Error('@ariaProperty must be used after a @property decorator');
    }
  }

  // descriptor must exist at this point, reassign so typescript understands
  const propDescriptor = descriptor;
  let attribute = '';

  if (!propDescriptor.set) {
    throw new Error(`@ariaProperty requires a setter for ${name}`);
  }

  const wrappedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    set(this: ReactiveElement, value: unknown) {
      if (attribute === '') {
        const options = constructor.getPropertyOptions(name);
        // the attribute will be a string at runtime
        attribute = (options.attribute as string);
      }
      if (this.hasAttribute(attribute)) {
        this.removeAttribute(attribute);
      }
      propDescriptor.set!.call(this, value);
    }
  };

  if (propDescriptor.get) {
    wrappedDescriptor.get = function(this: ReactiveElement) {
      return propDescriptor.get!.call(this);
    };
  }

  return wrappedDescriptor;
}

/**
 * A property decorator proxies an aria attribute to an internal node
 *
 * This decorator is only intended for use with ARIA attributes, such as `role`
 * and `aria-label` due to screenreader needs.
 *
 * Upon first render, `@ariaProperty` will remove the attribute from the host
 * element to prevent screenreaders from reading the host instead of the
 * internal node.
 *
 * This decorator should only be used for non-Symbol public fields decorated
 * with `@property`, or on a setter with an optional getter.
 *
 * @example
 * ```ts
 * class MyElement {
 *   @ariaProperty
 *   @property({ type: String, attribute: 'aria-label' })
 *   ariaLabel?: string;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */
export function ariaProperty(
    protoOrDescriptor: {}, name?: string,
    descriptor?: PropertyDescriptor): any {
  if (name !== undefined) {
    return tsDecorator(protoOrDescriptor, name, descriptor);
  } else {
    throw new Error('@ariaProperty only supports TypeScript Decorators');
  }
}
