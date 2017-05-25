// @flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FilterFormSection, Select } from '../Styled'
import styled from 'styled-components'
import * as maybe from 'flow-static-land/lib/Maybe'
import type { Maybe } from 'flow-static-land/lib/Maybe'

type ControlsInstanceProps = ControlsProps & {
    cleanup_fetch_converting_ips: () => void
  , set_params: (params: QueryParams) => void
  , history: any
}

const ControlsInstance = Controls => (props : ControlsInstanceProps) => {
  const {params} = props

  const filter_params = R.pipe(
      R.split(',')
    , R.map(R.split('='))
    , R.fromPairs
  )(params.filter)

  const params_affiliate_ids = !filter_params.affiliate_id ? [] : R.split(';')(filter_params.affiliate_id)
  const affiliate_name = params_affiliate_ids.length == 0 ? '' : R.pipe(
      x => x[0]
    , affiliate_id => R.pipe(
        R.find(x => x.affiliate_ids.some(a => a == affiliate_id))
      , x => !x ? '' : x.affiliate_name
    )(props.affiliates)
  )(params_affiliate_ids)

  return <Controls
    { ...props }
    params={ params }
    affiliate_name = { affiliate_name }
    filter_params={ filter_params }
    set_params={ params => props.set_params(params) }
  />
}

const ControlWithPublishers = (Control) => (props: ControlsInstanceProps) => {

  const get_filter_string = (state: Object, with_publisher_id: boolean) => {
    const affiliate_ids = R.pipe(
        R.filter(x => x.affiliate_name == state.affiliate_name)
      , R.map(x => x.affiliate_ids)
      , R.chain(x => x)
      , R.join(';')
    )(props.affiliates)

    return R.pipe(
        R.map(k => [k, state[k]])
      , R.filter(([k, v]) => !!v)
      , R.map(R.join('='))
      , R.join(',')
      , x => !x ? '-' : x
    )(["country_code", "operator_code", "handle_name", "gateway", "platform"].concat(with_publisher_id ? ["publisher_id", "sub_id"] : [])) + (!affiliate_ids ? '' : `,affiliate_id=${affiliate_ids}`)
  }

    const get_breakdown_stats = R.reduce(
        ({views, sales, firstbillings}, a) => ({views: views + a.views, sales: sales + a.sales, firstbillings: firstbillings + a.firstbillings})
      , {views: 0, sales: 0, firstbillings: 0}
    )

    const get_publishers = (state) => {
      const selected_affiliate_ids = !state.affiliate_name
        ? []
        : R.pipe(
            R.filter(x => x.affiliate_name == state.affiliate_name)
          , R.chain(x => x.affiliate_ids)
        )(props.affiliates)

      const publishers = maybe.maybe(
          []
        , R.pipe(
            R.filter(x => x.country_code == state.country_code && selected_affiliate_ids.some(s => s === x.affiliate_id))
          , R.groupBy(x => x.publisher_id)
          , R.toPairs
          , R.map(([publisher_id, values]) => ({
              publisher_id
            , ...get_breakdown_stats(values)
            , sub_ids: R.pipe(
                  R.groupBy(x => x.sub_id)
                , R.toPairs
                , R.map(([sub_id, values]) => ({
                      sub_id
                    , ...get_breakdown_stats(values)
                  }))
                , R.sortBy(x => x.sales * -1)
              )(values)
            }))
          , R.sortBy(x => x.sales * -1)
        )
        , props.traffic_breakdown
      )

      const sub_ids = publishers.length == 0
        ? []
        : R.pipe(
            R.filter(x => x.publisher_id == state.publisher_id)
          , R.chain(x => x.sub_ids)
        )(publishers)

      return {publishers, sub_ids}
    }

    const try_fetch_traffic_breakdown = (state) => {
      if(!!state.country_code && !!state.affiliate_name && !!state.date_from && !!state.date_to) {
        props.fetch_traffic_breakdown(state.date_from, state.date_to, get_filter_string(state, false))
      }
    }
  

  return <Control { ...props } get_filter_string={ get_filter_string } get_publishers={ get_publishers } try_fetch_traffic_breakdown={ try_fetch_traffic_breakdown } />

}

const ControlWithFilterParams = (Control) => (props : ControlsInstanceProps) => {

  const {params, countries} = props

  const filter_params = R.pipe(
      R.split(',')
    , R.map(R.split('='))
    , R.fromPairs
  )(params.filter)

  const get_all_props = state => prop => R.pipe(
      R.chain(R.prop(prop))
    , R.uniq
    , R.sortBy(x => x)
  )(countries)

  const get_country_prop = state => prop => R.pipe(
      R.find(x => x.country_code == state.country_code)
    , R.prop(prop)
  )(countries)

  return <Control { ...props } filter_params={ filter_params } get_all_props={ get_all_props } get_country_prop = { get_country_prop } />

}

export default {
    ControlWithFilterParams
  , ControlWithPublishers
  , ControlsInstance
}