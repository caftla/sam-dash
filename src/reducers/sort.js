// @flow
import R from 'ramda'

export type Sorter = {
    field : string
  , order:number
}

export type SorterState = {
    rowSorter: Sorter
  , sectionSorter : Sorter
}

const defaultState = {
    rowSorter: { field: 'row', order: 1 }
  , sectionSorter: { field: 'section', order: 1 }
}
export default (state = defaultState, action: Action) : SorterState => {
  switch (action.type) {
    case 'sort_row_filter_page_section_row':
      var { field } = action.payload
      var sorter = state.rowSorter
      var order = field == sorter.field ? sorter.order * -1 : -1
      return R.merge(state, { rowSorter: { field, order } })
    case 'sort_row_filter_page_section':
      var { field } = action.payload
      var sorter = state.sectionSorter
      var order = field == sorter.field ? sorter.order * -1 : -1
      return R.merge(state, { sectionSorter: { field, order } })
    default:
      return state
  }
}
