// @flow

import R from 'ramda'
import { createSelector } from 'reselect'

export default createSelector(
    [ x => x.filter_page_section_row, x => x.sort ]
  , (res, {field, order}) => {
      if(typeof(res) != 'string') {
        return R.pipe(
            R.map(c => R.merge(c, { data: R.pipe(
              R.map(x => R.merge(x, {data: R.pipe(
                  R.sortBy(r => R.prop(field)(r))
                , order > 0 ? x => x : R.reverse
              )(x.data)}))
            )(c.data) }))
        )(res)
      } else {
        return res
      }
  }
)
