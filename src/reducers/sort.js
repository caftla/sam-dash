import R from 'ramda'
export default (state = ({ field: 'row', order: 1 }: { field: string, order: number }), action: Action) => {
  switch (action.type) {
    case 'sort_row_filter_page_section_row':
      const { field } = action.payload
      const order = field == state.field ? state.order * -1 : -1
      return { field, order }
    default:
      return state
  }
}
