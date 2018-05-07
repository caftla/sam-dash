//@flow
import React from 'react'
import Section from './Section'
import cell_formatter from './cell-formatter'
import R from 'ramda'
import Tabs from '../common-controls/page_section_rows_tabs'

// exporting to excel
const exportToExcel = (formatter, params, pages) => {
  const data = R.pipe(
    R.map(x => R.merge(x, {
      data: R.chain(y => y.data.map(r => R.merge(r, {
        page: formatter(params.page)(r.page)
        , section: formatter(params.section)(r.section)
        , row: formatter(params.row)(r.row)
      })))(x.data)
    }))
    , sheets => [ // flatten
      {
        name: 'data',
        page: 'data',
        data: R.chain(x => x)(sheets.map(x => x.data))
      }
    ]
    , R.map(sheet => ({
      name: 'data' // after flatteing sheet name is irrelevant formatter(params.page)(sheet.page)
      , data: R.concat([R.pipe(
        R.keys
        , R.reject(x => x == 'section_total_ratio')
        , R.map(x => ({
          v: x
          , s: {
            fill: { fgColor: { rgb: 'FFEDEDED' } },
            border: { bottom: { style: 'medium', color: { rgb: "FF666666" } } }
          }
        }))
      )(sheet.data[0])],
        R.map(
          R.compose(R.map(x => {
            const [k, v] = x
            return ['delivered_rate', 'failed_rate', 'pending_rate'].some(y => y == k) ? { v: v, t: 'n', s: { numFmt: "0.0%" } }
            : ['pending', 'delivered', 'refunded', 'failed', 'unknown', 'total'].some(y => y == k) ? { v: v, t: 'n', s: { numFmt: "0" } }
            : v
          })
            , R.reject(x => x[0] == 'section_total_ratio')
            , R.toPairs)
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
                XLSX.utils.encode_cell({ c: j, r: i })
                , !!c && c.hasOwnProperty('v') ? c : { v: c }
              ])(r)
            )
            , R.chain(x => x)
            , R.fromPairs
            , sheet => R.merge({
              '!ref': `A1:${XLSX.utils.encode_cell({ c: s.data[0].length + 1, r: s.data.length + 1 })}`
              , "!printHeader": [1, 1]
              , '!freeze': { xSplit: "1", ySplit: "1", topLeftCell: "B2", activePane: "bottomRight", state: "frozen" }
            }, sheet)
          )(s.data)
        ])
        , R.fromPairs
      )
    })
  )(pages)

  var workbook = data
  var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };

  var wbout = XLSX.write(workbook, wopts);

  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  /* the saveAs call downloads a file on the local machine */
  saveAs(new Blob([s2ab(wbout)], { type: "" }), `${params.page}-${params.section}-${params.row}-${params.date_from}-${params.date_to}-${params.filter}.xlsx`)
}

export default Tabs({
  Section: Section
, cell_formatter: cell_formatter
, exportToExcel: exportToExcel
})

