// @flow

import R from 'ramda'
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect'
import { fetchState, match } from '../adts'
import isEqual from 'lodash.isequal'
import type { SorterState } from '../reducers/sort.js'

const id = x => x

const safe_div = (x, y) => y == 0 && x == 0 ? 0
: y == 0 ? Infinity
: x / y


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
      x => x.converting_ips
    , x => {
        const {rowSorter, sectionSorter, tabSorter} = x.controls
        return {rowSorter, sectionSorter, tabSorter}
    }
  ]
  , (res, sorter : SorterState) => {
      
      const {rowSorter, sectionSorter, tabSorter} = sorter

      // [row] -> [row]
      const rowSelector = R.pipe(
        R.filter(r => // r for row
                r.sales >= rowSorter.minSales
        )
      , R.sortBy(R.prop(rowSorter.field))
      , rowSorter.order > 0 ? id : R.reverse
      )
      
      // [section] -> [section]
      const sectionSelector = R.pipe(
          R.filter(s => // s for section
                  s.sales >= sectionSorter.minSales
          )
        , R.sortBy(R.prop(sectionSorter.field))
        , sectionSorter.order > 0 ? id : R.reverse
        , R.map(x => R.merge(x, {data: rowSelector(x.data)}))
      )


      return fetchState.map(R.pipe(
          R.filter(p => // p for page (tab)
               p.sales >= tabSorter.minSales
            && p.views >= tabSorter.minViews
          ) 
        , R.sortBy(R.prop(tabSorter.field))
        , tabSorter.order > 0 ? id : R.reverse
        , sections => [{page: '-', data: sectionSelector(sections.map(s => R.merge(s, {
              section: s.ip3
            , data: s.operators.map(x => R.merge(x, {
                cr: safe_div(x.sales, x.views)
              , pixels_cr: safe_div(x.pixels, x.views)
              , pixels_ratio: safe_div(x.pixels, x.sales)
              , cq: safe_div(x.firstbillings, x.sales)
              , ecpa: safe_div(x.cost, x.sales)
              , cpa: safe_div(x.cost, x.pixels)
            }))
          }))) }]
      ), res)
  }
)
