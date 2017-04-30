//@flow
import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'

type TabsState = {
  selected_page : number
}

type TabsProps = {
    pages: Array<any>
  , params: QueryParams
  , onSort: (string, number) => void
  , sort: { field: string, order: number }
  , page: any
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
    const Page = this.props.page
    return <div>
      <div style={ {
          display: 'flex'
        , justifyContent: 'flex-start'
        , overflow: 'auto'
        , backgroundColor: '#eee'
        , alignItems: 'flex-end'
      } }>
        {this.props.pages.map((x, i) => {
          const selected = selected_page == i
          return <div onClick={ () => this.setState({selected_page: i}) } key={i}
            style={ {padding: '0 12px', fontWeight: selected ? 'bold': 'normal'
            , cursor: 'pointer'
            , border: 'solid 5px #eee'
            , borderBottom: 'none'
            , padding: '1em 0.5em'
            , backgroundColor: selected? 'white' : '#eee'} }>
            {x.page}
          </div>
        }) }
      </div>
      {this.props.pages.map((x, i) => {
        const seleted = selected_page == i
        return <div key={i} style={ {display: seleted ? 'block' : 'none'} }>
          <Page key={i} params={ this.props.params } {...x} onSort={ this.props.onSort } sort={ this.props.sort } />
        </div>
        } ) }
    </div>
  }
}
