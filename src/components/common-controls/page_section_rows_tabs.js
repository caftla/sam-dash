//@flow
import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'

export default function ({ Section, cell_formatter, exportToExcel, no_summary }) {

  const Page = ({ page, sales, data, params, onSort, sort, affiliates, ouisys_campaigns, pageData, controls, make_url, breakdown_list} :
    { page: string, sales: number, data: Array<any>, params: QueryParams, onSort: (string, number) => void, sort: { field: string, order: number }, affiliates: Object }) =>
    { return <div>
      <h4 className='fpsr-tab-name'>{ page }</h4>
      {
        data.length > 365 ? <div style={ { color: 'red', padding: '1em' } }>There are { data.length } sections in this report. Showing the top 365 only</div> : ''
      }
      
      {
        no_summary ? '' : <Section controls={controls} make_url={make_url} breakdown_list={breakdown_list} is_summary={ true } affiliates={affiliates} ouisys_campaigns={ouisys_campaigns} data={ {data: [pageData] } } params={params} onSort={onSort} sort={sort} />
      }
      
      { 
        R.take(365, data).map((x, i) => <Section controls={controls} breakdown_list={breakdown_list} make_url={make_url} key={i} affiliates={affiliates} ouisys_campaigns={ouisys_campaigns} data={x} params={params} onSort={onSort} sort={sort} />) 
      }
    </div>}

  type TabsState = {
    selected_page : number
  }

  type TabsProps = {
      pages: Array<any>
    , params: QueryParams
    , onSort: (string, number) => void
    , sort: { field: string, order: number }
    , affiliates: Object
    , ouisys_campaigns: Object
    , controls: Object
  }

  class Tabs extends React.Component {

    state: TabsState
    props: TabsProps

    constructor(props : TabsProps) {
      super(props)
      this.state = {
        selected_page: 0
      }
      console.log('>> prps', this.props)
    }

    render() {
      const {selected_page} = this.state
      const formatter = cell_formatter(this.props.affiliates, this.props.params.timezone)
      return <div>
        <div style={ {
            display: 'flex'
          , justifyContent: 'flex-start'
          , overflow: 'auto'
          , '-webkit-overflow-scrolling': 'touch'
          , backgroundColor: '#eee'
          , alignItems: 'flex-end'
        } }>
        <div 
        style={ {padding: '0 12px'
              , cursor: 'pointer'
              , border: 'solid 5px #eee'
              , borderBottom: 'none'
              , padding: '1em 0.5em'
              , backgroundColor: '#eee'} }
        onClick={ () => exportToExcel(formatter, this.props.params, this.props.pages) }>🗒 Export</div>
        {
          R.take(32, this.props.pages).map((x, i) => {
            const selected = selected_page == i
            return <div onClick={ () => this.setState({selected_page: i}) } key={i}
              style={ {padding: '0 12px', fontWeight: selected ? 'bold': 'normal'
              , cursor: 'pointer'
              , border: 'solid 5px #eee'
              , borderBottom: 'none'
              , padding: '1em 0.5em'
              , backgroundColor: selected? 'white' : '#eee'} }>
              { formatter(this.props.params.page)(x.page) }
            </div>
          }) }
        </div>
        {
          this.props.pages.length > 32 ? <div style={ { color: 'red', padding: '1em' } }>There are { this.props.pages.length } tabs in this report. Showing the top 32 only</div> : ''
        }
        {R.take(32, this.props.pages).map((x, i) => {
          const seleted = selected_page == i
          return <div key={i} style={ {display: seleted ? 'block' : 'none'} }>
            <Page 
              key={i} 
              affiliates={ this.props.affiliates } 
              ouisys_campaigns={this.props.ouisys_campaigns}
              params={ this.props.params } {...x} 
              onSort={ this.props.onSort } sort={ this.props.sort } 
              page={ formatter(this.props.params.page)(x.page) }
              pageData={ x }
              controls={ this.props.controls }
              make_url={ this.props.make_url }
              breakdown_list={ this.props.breakdown_list }
            />
          </div>
          } ) }
      </div>
    }
  }

  return Tabs;
}