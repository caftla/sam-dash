// @flow

const {format} = require('d3-format')
const {timeFormat} = require('d3-time-format')

export default (affiliates: Object) => (interval: string) => (value: string) =>
    interval == 'hour' ? timeFormat('%Y-%m-%d %H')(new Date(value))
  : interval == 'day' ? timeFormat('%Y-%m-%d')(new Date(value))
  : interval == 'week' ? timeFormat('%Y-%m-%d')(new Date(value))
  : interval == 'month' ? timeFormat('%Y-%m')(new Date(value))
  : interval == 'affiliate_id' ? affiliates[value] 
  : value