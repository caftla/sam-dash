// @flow

// not used in SAM Dash project, kept here ofor reference temporarily

import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import * as R from 'ramda'
import { query, cleanup_fetch_filter_section_row } from '../actions'
import { fromQueryString } from '../helpers'

import { DashboardLoading } from './Styled'

import type { QueryLoadingState, DashboardQuery, QueryParams } from 'my-types'

import * as Maybe from 'flow-static-land/lib/Maybe'

type Props = {
    maybe_dashboard: Maybe.Maybe<DashboardQuery>
  , params: QueryParams
  , query: (params: QueryParams) => void
  , cleanup_fetch_filter_section_row: () => void
}

class Dashboard extends React.Component {
  props : Props
  d3Node : HTMLElement
  constructor(props: Props) {
    super(props)
  }
  componentDidMount() {
  }
  componentWillUnmount() {
    this.props.cleanup_fetch_filter_section_row()
  }
  render() {
    const self = this

    const params = R.merge(this.props.params, fromQueryString(window.location.search.substr(1)))

    return Maybe.maybe(
        _ => {
          this.props.query(params)
          return <DashboardLoading>Loading...</DashboardLoading>
        }
      , dashboard => _ => {

          const draw = (view) => {
            const transformed_result = window.transformation(dashboard.queryResult)
            window.presentation(view, transformed_result, params)

          }

          if(!!self.d3Node) {
            draw(self.d3Node)
          } else {
            setTimeout(() => draw(self.d3Node), 500)
          }

          return <div style={ { width: 1600, height: 900 } } ref={node => { self.d3Node = node }}></div>
        }
      , this.props.maybe_dashboard
    )()
  }
}

// Dashboard.propTypes = {
//     maybe_dashboard: React.PropTypes.shape({})
//   , params: React.PropTypes.shape({})
//   , query: React.PropTypes.func.isRequired
// }

export default connect(state => ({ maybe_dashboard: state.dashboard, params: state.controls }), { query, cleanup_fetch_filter_section_row })(Dashboard)
