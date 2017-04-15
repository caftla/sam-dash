//@flow
import React from 'react'
import R from 'ramda'
import Section from './Section'

const Page = ({page, sales, data}) =>
  <div>
    <h4 style={ { paddingLeft: '1em' } }>{page}</h4>
    { data.map((x,i) => <Section key={i} data={x} />) }
  </div>


  export default class Tabs extends React.Component {
    constructor(props) {
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
            <Page key={i} {...x} />
          </div>
          } ) }
      </div>
    }
  }
