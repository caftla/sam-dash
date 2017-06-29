// @flow
import R from 'ramda'

export type Sorter = {
    field : string
  , order:number
  , minViews: number
  , minSales: number
}

export type SorterState = {
    rowSorter: Sorter
  , sectionSorter : Sorter
}

const defaultState = {
    rowSorter: { field: 'row', order: 1, minViews: 0, minSales: 0 }
  , sectionSorter: { field: 'section', order: 1, minViews: 0, minSales: 0 }
}
export default (state = defaultState, action: Action) : SorterState => {
  switch (action.type) {
    case 'sort_row_filter_page_section_row':
      var { field } = action.payload
      var sorter = state.rowSorter
      var order = field == sorter.field ? sorter.order * -1 : -1
      return R.merge(state, { rowSorter: { ...sorter, field, order } })
    case 'sort_row_filter_page_section':
      var { field } = action.payload
      var sorter = state.sectionSorter
      var order = field == sorter.field ? sorter.order * -1 : -1
      return R.merge(state, { sectionSorter: { ...sorter, field, order } })
    case 'min_row_filter_page_section_row':
      var { field, value } = action.payload
      var sorter = state.rowSorter
      return { ...state, rowSorter: { ...sorter, minViews: (field == 'views' ? value : sorter.minViews), minSales: (field == 'sales' ? value : sorter.minSales) } }
    case 'min_row_filter_page_section':
      var { field, value } = action.payload
      var sorter = state.sectionSorter
      return { ...state, sectionSorter: { ...sorter, minViews: (field == 'views' ? value : sorter.minViews), minSales: (field == 'sales' ? value : sorter.minSales) } }
    default:
      return state
  }
}
