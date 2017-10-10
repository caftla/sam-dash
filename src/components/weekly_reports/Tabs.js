//@flow
import React from 'react'
import R from 'ramda'
import Section from './Section'
import cell_formatter from './cell-formatter'
import Tabs from '../common-controls/page_section_rows_tabs'

// exporting to excel
const exportToExcel = (formatter, params, pages) => {
  const data = R.pipe(
      R.map(x => R.merge(x, {
        data: R.chain(y => y.data.map(r => R.merge(r, {
            page: formatter(params.page)(r.page)
          , section: formatter(params.section)(r.section)
          , row: formatter(params.row)(r.row)
        })) )(x.data)
      }))
    , sheets => sheets.map(s => ({ name: s.page, page: s.page, data: s.data }))
    , R.map(sheet => ({
          name: sheet.name 
        , data: R.concat([R.pipe(
                R.keys
              , R.reject(x => x == 'section_sales_ratio')
              , R.map(x => ({
                    v: x
                  , s: { 
                    fill: {fgColor: { rgb: 'FFEDEDED'} },
                    border: { bottom: { style: 'medium', color: { rgb: "FF666666"}} }}
                }))
            )(sheet.data[0])], 
            R.map(
              R.compose(R.map(x => {
                const [k, v] = x
                return ['cr'].some(y => y == k) ? { v: v, t: 'n', s: { numFmt: "0.0%" } }
                : ['pixels_ratio', 'cq',	'active24', 'resubs'].some(y => y == k) ? { v: v, t: 'n', s: { numFmt: "0%" } }
                : ['views',	'leads',	'sales',	'pixels',	'paid_sales',	'firstbillings',	'optouts',	'optout_24',	'cost'].some(y => y == k) ? { v: v, t: 'n', s: { numFmt: "0" } }
                : k == 'ecpa' ? { v: v, t: 'n', s: { numFmt: "0.0" } }
                : v
              })
              , R.reject(x => x[0] == 'section_sales_ratio')
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
                            XLSX.utils.encode_cell({c: j, r: i})
                          , !!c && c.hasOwnProperty('v') ? c : {v: c}
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

export default Tabs({
  Section: Section
, cell_formatter: cell_formatter
, exportToExcel: exportToExcel
})
