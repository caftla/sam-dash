import R from 'ramda'

const d3 = require('d3-format')

const safe_div = (x, y) => y == 0 && x == 0 ? 0
    : y == 0 ? Infinity
    : x / y

export const flatten_data = data =>
  R.pipe(
    R.chain(([_, data]) => data)
  , R.chain(([_, data]) => data)
  )(data)

const calculate_cpa = data =>
  R.compose(
    R.flatten
  , R.map(y =>
    [{  country: y.country_code
      , operator: y.operator_code
      , sales: d3.format(',')(y.pixels)
      , cpa: y.cpa
      // , cpa: safe_div(y.total, y.pixels)
      // , resubscribes: d3.format('.0%')(safe_div(y.resubscribes, y.sales))
      , total: y.total }]
    ))(data)

export const get_eu_breakdown = data =>
  R.pipe(
    R.reject(x => !x.pixels || x.pixels == 0 || x.total == 0 || x.timezone == 'Asia/Kuala_Lumpur')
  , calculate_cpa
  )(data)

export const get_apac_breakdown = data =>
  R.pipe(
    R.reject(x => !x.pixels || x.pixels == 0 || x.total == 0 || x.timezone == 'Europe/Amsterdam')
  , calculate_cpa
  )(data)

export const get_summary = (data, timezone) =>
  R.pipe(
    R.groupBy( x => x.country_code)
  , R.map(R.reduce(
      (acc, a) => ({
        views: acc.views + a.views
      , pixels: acc.pixels + a.pixels
      , resubscribes: acc.resubscribes + a.resubscribes
      , sales: acc.sales + a.sales
      , total: acc.total + a.total
      , timezone: a.timezone
      })
    , {
        timezone: 'Europe/Amsterdam'
      , views: 0
      , pixels: 0
      , additional_pixels: 0
      , additional_pixels_cpa: 0
      , resubscribes: 0
      , sales: 0
      , total: 0
    }
  ))
  , R.toPairs
  , R.map(([country, x]) => ({ country,
      pixels: d3.format(',')(x.pixels)
    , resubscribes: d3.format('.0%')(safe_div(x.resubscribes, x.sales))
    , epc: safe_div(x.total, x.views)
    , total: x.total
    , timezone: x.timezone
  })
)
  , R.reject(x => x.timezone == timezone || !x.pixels || x.pixels == 0)
  , R.map(x => R.omit(['timezone'], x))
  )(data)

export const get_additional_costs = (data, timezone) =>
  R.pipe(
    R.groupBy(x => x.additional_pixels_cpa)
  , R.map(R.reduce(
      (acc, a) => ({
        additional_pixels: a.additional_pixels
      , additional_pixels_cpa: a.additional_pixels_cpa
      , timezone: a.timezone
      , operator_code: a.operator_code
      })
    , {

      additional_pixels: 0
      , additional_pixels_cpa: 0
      , timezone: 'Europe/Amsterdam'
      , operator_code: 'operator code not found, please check addtional cost settings'
    }
  ))
  , R.toPairs
  , R.map(([_, x]) => ({
      additional_pixels: x.additional_pixels
    , additional_pixels_cpa: x.additional_pixels_cpa
    , timezone: x.timezone
    , operator_code: x.operator_code
  })
  )
  , R.reject(x => x.timezone == timezone || !x.additional_pixels || x.additional_pixels == 0)
  , R.map(x => R.omit(['timezone'], x))
  )(data)

export const get_total_cpa = data =>
  R.pipe(
    R.map(x => R.prop('total', x))
  , R.sum()
  )(data)

export const get_total_additional_cpa = data =>
  R.pipe(
    R.map(x => [R.prop('additional_pixels_cpa', x), R.prop('additional_pixels', x)])
    , R.map(([x, y]) => x * y)
    , R.sum()
  )(data)
