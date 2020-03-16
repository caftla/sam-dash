// @flow

const {format} = require('d3-format')
const {timeFormat} = require('d3-time-format')
import moment from 'moment'

export default (affiliates: Object, timezone: number, ouisys_campaigns) => (interval: string) => (value: string) =>
    interval == 'hour' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD HH')
  : interval == 'day' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD')
  : interval == 'week' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD')
  : interval == 'month' ? moment(value).utcOffset(timezone).format('YYYY-MM')
  : interval == 'affiliate_id' ? affiliates[value] || value
  : interval == 'ouisys_campaigns' && !!ouisys_campaigns ? ouisys_campaigns[value] || value
  : interval == 'landing_page' ? 
    (value || '').startsWith('o:')
      ? (value || '')
      : (value || '').substring(7)
  : value