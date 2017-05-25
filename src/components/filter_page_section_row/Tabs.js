//@flow
import React from 'react'
import R from 'ramda'
import Section from './Section'
import type { QueryParams } from 'my-types'
import cell_formatter from './cell-formatter'

const Page = ({page, sales, data, params, onSort, sort, affiliates} :
  { page: string, sales: number, data: Array<any>, params: QueryParams, onSort: (string, number) => void, sort: { field: string, order: number }, affiliates: Object }) =>
  <div>
    <h4 style={ { paddingLeft: '1em' } }>{ page }</h4>
    { 
      data.map((x,i) => <Section key={i} affiliates={affiliates} data={x} params={params} onSort={onSort} sort={sort} />) 
    }
  </div>

type TabsState = {
  selected_page : number
}

type TabsProps = {
    pages: Array<any>
  , params: QueryParams
  , onSort: (string, number) => void
  , sort: { field: string, order: number }
  , affiliates: Object
}

export default class Tabs extends React.Component {

  state: TabsState
  props: TabsProps

  constructor(props : TabsProps) {
    super(props)
    this.state = {
      selected_page: 0
    }
  }

  render() {
    const {selected_page} = this.state
    const formatter = cell_formatter(this.props.affiliates, this.props.params.timezone)
    return <div>
      <div style={ {
          display: 'flex'
        , justifyContent: 'flex-start'
        , overflow: 'auto'
        , backgroundColor: '#eee'
        , alignItems: 'flex-end'
      } }>
      {
        this.props.pages.map((x, i) => {
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
      {this.props.pages.map((x, i) => {
        const seleted = selected_page == i
        return <div key={i} style={ {display: seleted ? 'block' : 'none'} }>
          <Page 
            key={i} affiliates={ this.props.affiliates } params={ this.props.params } {...x} 
            onSort={ this.props.onSort } sort={ this.props.sort } 
            page={ formatter(this.props.params.page)(x.page) }
          />
        </div>
        } ) }
    </div>
  }
}
