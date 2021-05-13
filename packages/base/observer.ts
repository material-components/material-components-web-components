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
*/// tslint:disable:no-any

import {PropertyValues, ReactiveElement} from '@lit/reactive-element';

/**
 * Observer function type.
 */
export interface Observer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (value: any, old: any): void;
}

type UpdatingElementClass = typeof ReactiveElement;
interface UpdatingElementClassWithObservers extends UpdatingElementClass {
  // tslint:disable-next-line:enforce-name-casing
  _observers: Map<PropertyKey, Observer>;
}

/**
 * Specifies an observer callback that is run when the decorated property
 * changes. The observer receives the current and old value as arguments.
 */
export const observer = (observer: Observer) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proto: any, propName: PropertyKey) => {
      // if we haven't wrapped `updated` in this class, do so
      if (!(proto.constructor as UpdatingElementClassWithObservers)
               ._observers) {
        proto.constructor._observers = new Map<PropertyKey, Observer>();
        const userUpdated = proto.updated;
        proto.updated = function(
            this: ReactiveElement, changedProperties: PropertyValues) {
          userUpdated.call(this, changedProperties);
          changedProperties.forEach((v, k) => {
            const observers =
                (this.constructor as UpdatingElementClassWithObservers)
                    ._observers;
            const observer = observers.get(k);
            if (observer !== undefined) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              observer.call(this, (this as any)[k], v);
            }
          });
        };
        // clone any existing observers (superclasses)
        // eslint-disable-next-line no-prototype-builtins
      } else if (!proto.constructor.hasOwnProperty('_observers')) {
        const observers = proto.constructor._observers;
        proto.constructor._observers = new Map();
        observers.forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (v: any, k: PropertyKey) => proto.constructor._observers.set(k, v));
      }
      // set this method
      proto.constructor._observers.set(propName, observer);
    };
