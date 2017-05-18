// @flow

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'
import * as arr from 'flow-static-land/lib/Arr'
import type { Arr } from 'flow-static-land/lib/Arr'

export * from './persist'
export * from './fetch'

export const sequence = <T>(arr_maybe : Array<Maybe<T>>) =>
  arr_maybe.some(x => maybe.isNothing(x))
  ? maybe.Nothing
  : maybe.of(arr_maybe.map(x => maybe.prj(x)))
