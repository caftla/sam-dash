//@flow
import React from 'react'
const d3 = require('d3-format')
import R from 'ramda'
import {TD, TH, TABLE} from '../plottables/table'
import type { QueryParams } from 'my-types'
import type { SorterState } from '../reducers/sort.js'
import { Submit } from '../Styled'
import moment from 'moment'
import { isAbsolute } from 'path';
import BreakdownItem from './BreakdownItem'


const change_sign = (change) => {
  const r = Math.round(Math.abs(change) - 1.5)
  const sign = r > 0 ? R.repeat(change > 0 ? '+' : '-', r).join('') : ''
  return sign.substr(0, 4)
}

export default function({columns_maker, cell_formatter, try_merge_body_and_footer, footer}) {

  const Section = ({data, params, onSort, sort, affiliates, is_summary, controls, make_url, showTooltip} : { data : any, params : QueryParams, onSort: (string, number) => void, sort: SorterState, affiliates: Object }) => {

    const show_label = (row_or_section) => (name, key = null) => {
      const sort_field = key == null ? name : key
      const sname = name == 'country_code' ? 'country' : name
      const sorter = sort[row_or_section == 'row' ? 'rowSorter' : 'sectionSorter']
      return sort_field == sorter.field && sname != '-'
        ? `${sname} ` + (sorter.order > 0 ? '▲' : '▼')
        : sname
    }
    const show_label_row = show_label('row') 
    const show_label_section = show_label('section') 
    const formatter = cell_formatter(affiliates, params.timezone)

    const column = (label, onClick, value, footer, more = {}) => {
      const to_f = (p, x) => typeof p == 'function' ? p(x) : p || {}
      const val = R.pipe(value, x => x == '-' ? '' : x)
      return {
        label: label
      , th: <TH {...more} value={ label == '-' ? '' : label } onClick={ onClick } />
        , td: (x, i) => <TD className={ !!showTooltip && i <= 1 ? 'hasTooltip' : '' } {...more} data-is-empty={ value(x) == '' } style={ to_f(more.style, x) } value={ val(x) } 
          onMouseEnter={ () => 
            [...document.getElementsByClassName('fpsr_table')].map(table => 
              table.classList.add(`highlight-${i+1}`)
            )
          } 
          onMouseLeave={ () => 
            [...document.getElementsByClassName('fpsr_table')].map(table => 
              table.classList.remove(`highlight-${i+1}`)
            )
          } 
        onClick={(e) =>  {

          if (!showTooltip)
            return;

          const find_all_affiliate_ids = (function () {
            const affiliate_ids = R.pipe(
              R.toPairs
              , R.map(([id, name]) => ({ id, name }))
              , R.groupBy(x => x.name)
              , R.map(R.map(x => x.id))
              , R.pipe(R.toPairs, R.map(([name, ids]) => ({ name, ids })))
            )(affiliates)

            return affid => R.pipe(
              R.filter(a => a.ids.some(i => i == affid))
              , R.chain(x => x.ids)
            )(affiliate_ids)
          })()

          const filter_params = R.pipe(
            R.split(',')
            , R.map(R.split('='))
            , R.fromPairs
          )

          const to_filter_query = R.pipe(
            R.toPairs
            , R.reject(([key, value]) => !value || value == '-')
            , R.map(R.join('='))
            , R.join(',')
            , x => !x ? '-' : x
            , y => y.replace(/\//g, '%2F')
          )

          const add_filter = (controls, field, value) => R.merge(controls, {
            filter:
              to_filter_query(
                R.merge(
                  filter_params(controls.filter)
                  , R.fromPairs([[field, field != 'affiliate_id' ? value : find_all_affiliate_ids(value).join(';')]])
                )
              )
          })


          const pivot_in = (controls, x, level, breakdown) => controls[level] == 'day'
            ? R.merge(controls, R.merge({
                date_from: formatter(controls[level])(x[level])
              , date_to: formatter(controls[level])(moment(x[level]).add(1, 'days').toJSON())
            }, R.fromPairs([[level, breakdown]])))
            : R.merge(
                add_filter(controls, controls[level], x[level])
              , R.fromPairs([[level, breakdown]])
            )

          const level = ['section', 'row'][i]
          if(!!level) {
            // const breakdown = prompt('Breakdown?')
            showTooltip(e.target, level, formatter(controls[level])(x[level]), 
              (breakdown, sorter) =>
                make_url(pivot_in(controls, x, level, breakdown))
            )
            // const breakdown = 'day'
            // console.log(">>> ", x, make_url(pivot_in(controls, x, level, breakdown)))
          }        
        }}
        />
      , tf: (data) => <TD {...more} style={ R.merge(to_f(more.style, data), { 'font-weight': 'bold' }) } value={ footer(data, is_summary) } />
      }
    }

    const pcolumn = (label, onClick, value, footer, more = {}) => column(label, onClick, value, footer, {...more, className: 'percent'})
    const tcolumn = (label, onClick, value, footer, more = {}) => column(label, onClick, value, footer, {...more, className: 'times'})

    const width = p => 
      p == '-' ? 10
      : p == 'country_code' ? 80
      : p == 'day' ? 120
      : p == 'hour' ? 220
      : 170

    const columns = R.pipe(
      cs => is_summary 
        ? [0, 1].map(i => ({label: cs[i].label, th: <TH/>, td: () => <TD />})).concat(R.drop(2, cs))
        : cs
    )(columns_maker({params, data, pcolumn, tcolumn, column, show_label_section, show_label_row, width, formatter, onSort}))

    const ldata = data.data // R.take(10, data.data)
    const tableId = `table-${Math.round(Math.random() * 100000)}`
    return <TABLE width={1400} data-id={ tableId } className={`section fpsr_table${ is_summary ? ' summary' : '' }`} style={ { minWidth: '1200px', marginTop: '1em' } }>
      { columns.map((c, i) => (<colgroup key={i}>
          <col span="1" style={ { width: c.label == '-' ? '1%' : c.label == 'Transactions' || c.label == 'Views' ? '7%' : (i < 2 ? '7%' : '5%') } } />
        </colgroup>))
      } 
      <caption align="bottom"  className='clipboard-hover' onClick={ () => {
        const caption = document.querySelectorAll(`table[data-id="${ tableId }"] caption`)[0]
        const html = caption.innerHTML
        caption.innerHTML = `<div style='text-align: left'><a href='${document.location.href}'>Report</a></div>`
        caption.setAttribute('align', 'bottom')
        window.clipboard.copy({"text/html": document.querySelectorAll(`table[data-id="${ tableId }"]`)[0].outerHTML})
        caption.innerHTML = html
        caption.setAttribute('align', 'top')

      } }>
      </caption>
      <thead>
        { columns.map((c, i) => c.th) } 
      </thead>
      <tbody>
        { !!try_merge_body_and_footer && ldata.length == 1 ? '' : ldata.map((x, i) => { 
          return <tr data-row={ x.row } key={i}
            onMouseEnter={ () => 
              [...document.querySelectorAll(`tr[data-row="${x.row}"]`)].map(tr => 
                tr.classList.add(`highlight`)
              )
            } 
            onMouseLeave={ () => 
              [...document.querySelectorAll(`tr[data-row="${x.row}"]`)].map(tr => 
                tr.classList.remove(`highlight`)
              )
            } 
          >
            { columns.map((c, i) => c.td(x, i)) }
          </tr> })
        } 
        <tr>
          { is_summary ? '' : columns.map((c, i) => c.tf(ldata.length == 1 && !!try_merge_body_and_footer ? try_merge_body_and_footer(data, ldata[0]) : data)) }
        </tr>
      </tbody>
      {
        !!footer && !is_summary ? (<tfoot>
            <tr>
              <td colSpan={ columns.length  }>{footer(data)}</td>
            </tr>
          </tfoot>) : ''
      }
    </TABLE>
  }

  const makeLens = p => 
    R.lens(R.prop(p), (a, s) => typeof a != 'undefined' && a != null ? R.merge(s, R.assoc(p)(a, s)) : s)
  const overState = (p, val) =>
    R.over(makeLens(p), R.always(val))

  class SectionWrapper extends React.Component {
    constructor(props) {
      super(props)
      this.state = { 
          showTooltip: false
        , top: 0
        , left: 0 
        , level: null
        , current_value: null
        , breakdown: null
        , sorter: this.props.controls.tabSorter
        , make_url: () => ''
      }
    }
    componentWillUnmount() {
      if(!!this.hideHandler)
        document.body.removeEventListener('mousedown', this.hideHandler)
    }
    showTooltip(target, level, current_value, make_url) {
      const self = this
      const is_in = e => !e ? false : (e.classList.contains('tooltip') || e.classList.contains('tether-element') || is_in(e.offsetParent))
      this.hideHandler = (e) => { 
        if(!is_in(e.target))
          self.setState({ showTooltip: false }) 
      }
      document.body.addEventListener('mousedown', this.hideHandler)
      this.setState({
          showTooltip: true
        , top: target.offsetTop 
        , left: target.offsetLeft
        , level, current_value
        , sorter: level == 'page' ? this.props.controls.tabSorter : this.props.controls[level + 'Sorter']
        , breakdown: null
        , make_url
      })
    }
    render() {
      const isLandingPage = this.props.params[this.state.level] == "landing_page"
      
      const tooltip = () => {
        if (!this.props.breakdown_list)
          return ''
        return (<div className='tooltip' style={{
          display: !!this.state.showTooltip ? 'block' : 'none'
          , top: this.state.top + 10 + 'px'
          , left: this.state.left + 80 + 'px'
        }}>
          <div>Filtering on {
             isLandingPage 
              ? <a href={ `http://${this.state.current_value}?offer=1` } target="_blank">{this.state.current_value}</a>
              : this.state.current_value
            }</div>
          <BreakdownItem
            label={this.state.level}
            breakdownList={this.props.breakdown_list}
            onChange={({ breakDownLevel, sorter }) =>
              this.setState(R.compose(overState('breakdown', breakDownLevel), overState('sorter', sorter)))
            }
            breakDownLevel={this.state.level}
            breakDownLevelName={this.state.breakdown}
            sorter={this.state.sorter}
            showExtra={true}
          />
          <Submit disabled={!this.state.breakdown || this.state.breakdown == '-'} onClick={_ => window.open(this.state.make_url(this.state.breakdown, this.state.sorter))}>Pivot In</Submit>
        </div>)
      }
      return <div className='section'>
        { tooltip() }
        { Section(R.merge({ showTooltip: !this.props.breakdown_list ? null : this.showTooltip.bind(this) }, this.props)) }
      </div>
    }
  }
  return (params) => (<SectionWrapper {...params} />) // parmas => <SectionWrapper {...params} />
}
