// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
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
      x => x.all_affiliates
  ]
  , (all_affiliates) => {
      if(!all_affiliates) {
        return null
      }
      return R.pipe(
          R.chain(x => R.map(afid => [afid, x.affiliate_name])(x.affiliate_ids))
        , R.fromPairs
        , x => R.merge({'Unknown': 'Unknown'}, x)
      )(all_affiliates)
  }
)
