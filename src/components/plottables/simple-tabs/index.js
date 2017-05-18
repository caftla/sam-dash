//@flow

import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import type { Children } from 'react';

type TabsState = {
  selected_page : number
}

type TabsProps = {
  children?: Children
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

    return <div>
      <div style={ {
          display: 'flex'
        , justifyContent: 'flex-start'
        , overflow: 'auto'
        , backgroundColor: '#eee'
        , alignItems: 'flex-end'
      } }>
        {React.Children.map(this.props.children, ((x, i) => {
          const selected = selected_page == i
          return <div onClick={ () => this.setState({selected_page: i}) } key={i}
            style={ {padding: '0 12px', fontWeight: selected ? 'bold': 'normal'
            , cursor: 'pointer'
            , border: 'solid 5px #eee'
            , borderBottom: 'none'
            , padding: '1em 0.5em'
            , backgroundColor: selected? 'white' : '#eee'} }>
            {x.props.name}
          </div>
        })) }
      </div>
      {React.Children.map(this.props.children, ((x, i) => {
        const seleted = selected_page == i
        return <div key={i} style={ {display: seleted ? 'block' : 'none'} }>
          { x }
        </div>
      } )) }
    </div>
  }
}
