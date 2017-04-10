import React from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'

import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

import { fetch_filter_section_row, cleanup_fetch_filter_section_row, set_params } from '../../actions'
import type { QueryParams } from 'my-types'

import Section from './Section'
import Controls from './Controls'

const theme = {
    flexDirection: 'row'
  , elementHeight: '22px'
  , elementWidth: '200px'
  , fontSize: '1em'
  , formContainerMargin: '0'
  , formTitleFontSize: '1em'
  , flexAlignItems: 'flex-start'
  , submitAlignSelf: 'flex-end'
}

type Props = {
    data: Maybe<any>
  , params: QueryParams
  , fetch_filter_section_row: (params: QueryParams) => void
  , cleanup_fetch_filter_section_row: () => void
  , set_params: (params: QueryParams) => void
}

// This is a route
class Filter_Section_Row extends React.Component {
  constructor(props : Props) {
    super(props)
    const {params} = this.props.match
    this.props.set_params(params)
  }

  componentWillUnmount() {
  }

  render() {
    const {params} = this.props.match
    return <div>
      <ThemeProvider theme={theme}>
        <Controls params={ params }
          set_params={ params => {
            this.props.set_params(params)
            this.props.cleanup_fetch_filter_section_row()
            this.props.history.push(`/filter_section_row/${params.date_from}/${params.date_to}/${params.filter}/${params.section}/${params.row}`)
          } }
        />
      </ThemeProvider>
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

export default connect(
    state => ({ data: state.filter_section_row })
  , { fetch_filter_section_row, cleanup_fetch_filter_section_row, set_params }
)(Filter_Section_Row)
