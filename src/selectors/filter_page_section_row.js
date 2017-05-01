// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { fetchState, match } from '../adts'
import isEqual from 'lodash.isequal'


const customSelectorCreator = createSelectorCreator(defaultMemoize,
  (a, b) => {
    if(typeof a == typeof b && typeof a == 'object') {
      return isEqual(a, b)
    } else {
      return isEqual(fetchState.toEq(a), fetchState.toEq(b))
    }
  })

export default customSelectorCreator(
  [
      x => x.filter_page_section_row
    , x => x.sort
  ]
  , (res, {field, order}) => {
      return fetchState.map(R.pipe(
            R.map(c => R.merge(c, { data: R.pipe(
              R.map(x => R.merge(x, {data: R.pipe(
                  R.sortBy(r => R.prop(field)(r))
                , order > 0 ? x => x : R.reverse
              )(x.data)}))
            )(c.data) }))
        ), res)
  }
)
