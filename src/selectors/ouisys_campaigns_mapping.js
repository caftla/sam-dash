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
      x => x.all_countries
  ]
  , (all_countries) => {
      if(!all_countries) {
        return null
      }
      return R.pipe(
        R.chain(x => x.ouisys_campaign_names)
      , R.map(x => ([
          /\((\d+)/.exec(x)[1]
        , x
        ]))
      , R.fromPairs
      )(all_countries)
  }
)
