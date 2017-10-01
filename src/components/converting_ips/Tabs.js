//@flow
import Section from './Section'
import cell_formatter from './cell-formatter'
import Tabs from '../common-controls/page_section_rows_tabs'


export default Tabs({
  Section: Section
, cell_formatter: cell_formatter
, exportToExcel: null
, no_summary: true
})

