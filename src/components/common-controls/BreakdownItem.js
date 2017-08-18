import React from 'react'
import R from 'ramda'
import type { QueryParams } from 'my-types'
import { Submit, DateField, NumberField, FormTitle, FormRow, FormLabel, FormContainer, FormSection, FormSectionButtons, FilterFormSection, Select } from '../Styled'
import { Input, LabelledInput, InputSelect } from './FormElementsUtils'

type ControlsProps = {
    breakdownList : Array<string>
  , breakDownLevel: string
  , onChange: string => any
  , breakDownLevelName: string
  , sorter: any
  , label: string
}

export default class BreakdownItem extends React.Component  {
  constructor(props) {
    super(props)
    this.state= {
      showExtra: false
    }
  }
  render() {

    const toBreakDownLevelName = v => v == this.props.breakDownLevel ? this.props.breakDownLevelName : v
    const fromBreakDownLevelName = n => n == this.props.breakDownLevelName ? this.props.breakDownLevel : n

    const onSorterChange = hash =>
      this.props.onChange({ sorter: R.over(R.lensProp('field'), fromBreakDownLevelName, R.merge(this.props.sorter, hash)) })

    return <div style={ this.state.showExtra ? { borderBottom: 'solid 1px silver', marginBottom: '1em', paddingBottom: '1em' } : {} }>
      
      <InputSelect options={ this.props.breakdownList }
          name={ <span onClick={ () => this.setState(s => R.merge(s, {showExtra: !s.showExtra})) }>{ !this.state.showExtra ? '▼' : '▲' }
            &nbsp; { this.props.label } 
            </span> } 
          value={ this.props.breakDownLevelName } 
          onChange={ val => this.props.onChange({ 'breakDownLevel': val }) } />

      <div ref="extra" style={ { display: this.state.showExtra ? 'block' : 'none' } }>
        <InputSelect options={[this.props.breakDownLevelName, 'views', 'sales', 'cost']} name="Sort By" 
          onChange={ field => 
            onSorterChange({ field })
          } 
          value={ toBreakDownLevelName(this.props.sorter.field) }
        />
         
        <InputSelect options={['ASC', 'DESC']} name="Order" onChange={ val =>
            onSorterChange({ order: 'ASC' == val ? 1 : -1 })
          } 
          value={ this.props.sorter.order == 1 ? 'ASC' : 'DESC' }
         />
        <LabelledInput name="Views">
          <NumberField value={ this.props.sorter.minViews } type="number" onChange={ e => 
              onSorterChange({ minViews: parseInt(e.target.value) })
            }
            value={ this.props.sorter.minViews }
          />
        </LabelledInput>
        <LabelledInput name="Sales">
          <NumberField value={ this.props.sorter.minSales } type="number" onChange={ e => 
              onSorterChange({ minSales: parseInt(e.target.value) })
            }
            value={ this.props.sorter.minSales }
          />
        </LabelledInput>
      </div>
    </div>
  }
}