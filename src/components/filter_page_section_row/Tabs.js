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
      <div 
      style={ {padding: '0 12px'
            , cursor: 'pointer'
            , border: 'solid 5px #eee'
            , borderBottom: 'none'
            , padding: '1em 0.5em'
            , backgroundColor: '#eee'} }
      onClick={ () => exportToExcel(formatter, this.props.params, this.props.pages) }>🗒 Export</div>
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

const exportToExcel = (formatter, params, pages) => {
  const data = R.pipe(
      R.map(x => R.merge(x, {
        data: R.chain(y => y.data.map(r => R.merge(r, {
            page: formatter(params.page)(r.page)
          , section: formatter(params.section)(r.section)
          , row: formatter(params.row)(r.row)
        })) )(x.data)
      }))
    , R.map(sheet => ({
          name: formatter(params.page)(sheet.page)
        , data: R.concat([R.keys(sheet.data[0])], 
            R.map(
              R.compose(R.map(x => x[1]), R.toPairs)
          )(sheet.data))
        })
      )
    , R.applySpec({
          SheetNames: R.map(R.prop('name'))
        , Sheets: R.pipe(
              R.map(s => [
                  s.name
                , R.pipe(
                      R.addIndex(R.map)((r, i) => 
                        R.addIndex(R.map)((c, j) => [
                            XLSX.utils.encode_cell({c: j, r: i})
                          , {v: c}
                        ])(r)
                      )
                    , R.chain(x => x)
                    , R.fromPairs
                    , sheet => R.merge({
                          '!ref': `A1:${XLSX.utils.encode_cell({c: s.data[0].length+1, r: s.data.length+1})}`
                        , "!printHeader":[1,1]
                        , '!freeze':{ xSplit: "1", ySplit: "1", topLeftCell: "B2", activePane: "bottomRight", state: "frozen" }
                      }, sheet)
                  )(s.data)
              ])
            , R.fromPairs
          )
      })
  )(pages)

  var workbook = data
  var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };

  var wbout = XLSX.write(workbook,wopts);

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  /* the saveAs call downloads a file on the local machine */
  saveAs(new Blob([s2ab(wbout)],{type:""}), `${params.page}-${params.section}-${params.row}-${params.date_from}-${params.date_to}-${params.filter}.xlsx`)
}