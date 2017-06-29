// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { fetchState, match } from '../adts'
import isEqual from 'lodash.isequal'
import type { SorterState } from '../reducers/sort.js'


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
  , (res, sorter : SorterState) => {
      const {rowSorter, sectionSorter} = sorter
      return fetchState.map(R.pipe(
            R.map(c => R.merge(c, { data: R.pipe(
                R.map(x => R.merge(x, {data: R.pipe(
                    R.sortBy(r => R.prop(rowSorter.field)(r))
                  , rowSorter.order > 0 ? x => x : R.reverse
                  , R.filter(x => 
                         +x.sales >= sorter.rowSorter.minSales
                      && +x.views >= sorter.rowSorter.minViews
                    )
                )(x.data)}))
              , R.sortBy(s => R.prop(sectionSorter.field)(s))
              , sectionSorter.order > 0 ? x => x : R.reverse
            )(c.data) }))
        ), res)
  }
)
