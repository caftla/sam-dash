import React from 'react'
import { connect } from 'react-redux'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { fetch_filter_section_row, cleanup_fetch_filter_section_row } from '../../actions'
import type { QueryParams } from 'my-types'

import Section from './Section'

type Props = {
    data: Maybe<any>
  , params: QueryParams
  , fetch_filter_section_row: (params: QueryParams) => void
  , cleanup_fetch_filter_section_row: () => void
}


class Filter_Section_Row extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillUnmount() {
  }

  render() {
    const {params} = this.props.match
    return <div>
      <h1>{params.date_from} to {params.date_to} {params.filter}</h1>
      <h1>{params.section} &times; {params.row}</h1>
      {
        maybe.maybe(
            _ => {
              this.props.fetch_filter_section_row(params.date_from, params.date_to, params.filter, params.section, params.row)
              return <div>Loading...</div>
            }
          , data => _ => {
              return <div>
                {
                  data.map((x,i) => <Section key={i} data={x} />)
                }
              </div>
            }
          , this.props.data
        )()
      }
    </div>
  }
}


const Comp = ({data} : { data : Maybe<Array<any>> }) => {

  console.log('Filter_Section_Row', data)
  return <div>Filter_Section_Row</div>
}

export default connect(
    state => ({ data: state.filter_section_row })
  , { fetch_filter_section_row, cleanup_fetch_filter_section_row }
)(Filter_Section_Row)
