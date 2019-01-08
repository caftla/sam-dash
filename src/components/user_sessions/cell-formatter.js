// @flow

const {format} = require('d3-format')
const {timeFormat} = require('d3-time-format')
import moment from 'moment'

export default (affiliates: Object, timezone: number) => (interval: string) => (value: string) =>
    interval == 'hour' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD HH')
  : interval == 'day' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD')
  : interval == 'week' ? moment(value).utcOffset(timezone).format('YYYY-MM-DD')
  : interval == 'month' ? moment(value).utcOffset(timezone).format('YYYY-MM')
  : interval == 'affiliate_id' ? affiliates[value] || value
  : interval == 'landing_page' ? (() => {
    try {
      const pageMatch = /page=([\w\-\d\_]+)/gm.exec(value)
      const countryMatch = /country=([\w\-\d\_]+)/gm.exec(value)
      if(value.indexOf('c1') > -1 && !!pageMatch && !!countryMatch) {
        const [, page] = pageMatch
        const [, country] = countryMatch
        return `*${country}:${page}`
      } else {
        return (value || '').substring(7)
      }
    } catch(ex) {
      console.warn(ex)
      return (value || '').substring(7)
    }
  })()
  : value