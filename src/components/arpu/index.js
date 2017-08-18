// @flow

import React from 'react'
import { connect } from 'react-redux'
import R from 'ramda'
import { format } from 'd3-format'
import { timeFormat } from 'd3-time-format'
import { ThemeProvider } from 'styled-components'
import { sequence } from '../../helpers'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import {
    fetch_all_countries
  , fetch_all_affiliates
  , fetch_arpu, cleanup_fetch_arpu
  , sort_row_filter_page_section_row, sort_row_filter_page_section, min_row_filter_page_section_row
  , set_params } from '../../actions'
import type { QueryParams } from 'my-types'
import type { FetchState } from '../../adts'
import { match, fetchState } from '../../adts'

import filter_page_section_row_selector from '../../selectors/filter_page_section_row.js'
import affiliates_mapping_selector from '../../selectors/affiliates_mapping.js'
import { fromQueryString } from '../../helpers'
import { store } from '../../store'


type Props = {
  match: { params: QueryParams }
, history: any
, data: FetchState<Array<any>>
, params: QueryParams
, fetch_arpu: (date_from : string, date_to : string, filter : string, page : string, section : string, row : string) => void
, fetch_all_countries: (date_from: string, date_to: string) => void
, all_countries: Maybe<Array<any>>
, fetch_all_affiliates: () => void
, all_affiliates: Maybe<Array<any>>
, cleanup_fetch_arpu: () => void
, sort_row_filter_page_section_row: (field: string, order: number) => void
, sort: any
, set_params: (params: QueryParams) => void
, horizontal_keys: Array<T>
}

const theme = {
  flexDirection: 'row'
, formSectionWidth: '260px'
, formLabelWidth: '60px'
, formLabelTextAlign: 'right'
, filterFormSectionDisplay: 'flex'
, filterFormSectionWidth: '600px'
, elementHeight: '22px'
, elementWidth: '200px'
, fontSize: '1em'
, formContainerMargin: '0'
, formTitleFontSize: '1em'
, flexAlignItems: 'flex-start'
, submitAlignSelf: 'flex-end'
}


// return plot(pjson, view, res, params)

const TD = ({children, style}) => <td style={ R.merge({ borderBottom: 'solid 1px #ddd', padding: '0.3em 0 0.3em 0' }, style) }>{children}</td>
const TH = ({children, width}) => <th style={ { textAlign: 'left', width: `${width}px`, fontWeight: 'bold', backgroundColor: '#f0f0f0', fontSize: '0.9em', padding: '0.5em 0' } }>{children}</th>

const Table = ({section}) => {
  const horizontal_keys = R.pipe(
    R.chain(x => x.data)
  , R.map(x => x.day_after_subscription)
  , R.uniq
  , R.sortBy(x => x)
  )(section.data)
  return <table className='main-table'>
  <thead>
    <tr>
      <TH>Month</TH>
      <TH>Page</TH>
      <TH>Section</TH>
      <TH>Row</TH>
      <TH>Sales</TH>
      <TH>eCPA</TH>
      {
        horizontal_keys.map(k => <TH key={k}>{ k < 28 ? `Week ${k / 7}` : `Month ${Math.round(k / 30.5)}`}</TH>)
      }
    </tr>
  </thead>

    <tbody>
      {
      // each member of data array is a row
      section.data.map((x, i) => {
        const ecpa = x.ecpa
        return <tr key={i}>
          <TD>{timeFormat('%Y-%m')(new Date(x.sale_window_start))}</TD>
          <TD>{x.page}</TD>
          <TD>{x.section}</TD>
          <TD>{x.row}</TD>
          <TD>{format(',')(x.sale_count)}</TD>
          <TD>{format('0.2f')(x.ecpa)}</TD>
          {
            x.data.map((x, i) => <TD key={i} style={ { color: x.arpu > ecpa ? 'green' : '' } }>{format('0.2f')(x.arpu)}</TD>)
          }
        </tr>
      })}
    </tbody>
</table>
}

class Arpu extends React.Component {

  props: Props

  constructor(props) {
    super(props)

  }

  componentWillUnmount() {
    this.props.cleanup_fetch_arpu()
  }

  componentDidMount() {
    this.props.fetch_arpu()
  }

  
  render(){
    return <div>
    {
      match({
        Nothing: () => <div>Nothing</div>
      , Loading: () => <div>Loading...</div>
      , Error: (error) => <div>Error</div>
      , Loaded: (data) => <Table section={data[0].data[0]} />
    })(this.props.data)
    }
    </div>
  }
}

export default connect(
  state => ({
    all_countries: state.all_countries 
    , all_affiliates: state.all_affiliates
    , data: state.arpu
  })
, {
  fetch_arpu
  , cleanup_fetch_arpu
})(Arpu)
