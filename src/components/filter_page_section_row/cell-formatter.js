// @flow

const {format} = require('d3-format')
const {timeFormat} = require('d3-time-format')
import moment from 'moment'

export default (affiliates: Object, timezone: number) => (interval: string) => (value: string) =>
    interval == 'hour' ? moment(value).utcOffset(timezone).format('Y-m-d HH')
  : interval == 'day' ? moment(value).utcOffset(timezone).format('Y-m-d')
  : interval == 'week' ? moment(value).utcOffset(timezone).format('Y-m-d')
  : interval == 'month' ? moment(value).utcOffset(timezone).format('Y-m')
  : interval == 'affiliate_id' ? affiliates[value] 
  : value