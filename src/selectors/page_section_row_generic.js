// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { fetchState, match } from '../adts'
import isEqual from 'lodash.isequal'
import type { SorterState } from '../reducers/sort.js'

const trace1 = x => { console.log(x); return x }

const id = x => x

const screen_size_to_int = size => !size || size == 'Unknown' ? 0 : size.split('X').reduce((acc, a) => parseInt(a) * acc, "1")

const sort_util = sorter => R.pipe(
    R.sortBy(
      sorter.fieldValue == 'screen_size' && ['page', 'section', 'row'].some(i => i == sorter.field)
      ? R.pipe(R.prop(sorter.field), screen_size_to_int)
      : R.prop(sorter.field)
    )
  , sorter.order > 0 ? id : R.reverse
)

const customSelectorCreator = createSelectorCreator(defaultMemoize,
  (a, b) => {
    if(typeof a == typeof b && typeof a == 'object') {
      return isEqual(a, b)
    } else {
      return isEqual(fetchState.toEq(a), fetchState.toEq(b))
    }
  })

export default (selector) => customSelectorCreator(
  [
      selector
    , x => {
        const {rowSorter, sectionSorter, tabSorter, row, section, page} = x.controls
        return {
            rowSorter: R.merge({ fieldValue: row }, rowSorter)
          , sectionSorter: R.merge({ fieldValue: section }, sectionSorter)
          , tabSorter: R.merge({ fieldValue: page }, tabSorter)}
    }
  ]
  , (res, sorter : SorterState) => {
      const {rowSorter, sectionSorter, tabSorter} = sorter

      // [row] -> [row]
      const rowSelector = R.pipe(
          R.filter(r => // r for row
                  r.sales >= rowSorter.minSales
              &&  (r.views || 0) >= rowSorter.minViews
          )
        , sort_util(rowSorter)
      )
      
      // [section] -> [section]
      const sectionSelector = R.pipe(
          R.filter(s => // s for section
                  s.sales >= sectionSorter.minSales
              &&  (s.views || 0) >= sectionSorter.minViews
          )
        , sort_util(sectionSorter)
        , R.map(x => R.merge(x, {data: rowSelector(x.data)}))
      )

      return fetchState.map(R.pipe(
            R.filter(p => // p for page (tab)
                 p.sales >= tabSorter.minSales
              && (p.views || 0) >= tabSorter.minViews
            ) 
          , sort_util(tabSorter)
          , R.map(p => R.merge(p, { data: sectionSelector(p.data) }))
        ), res)
  }
)
