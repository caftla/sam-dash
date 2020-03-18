import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css";
import { dimensions, mkArbitraryDimension, mkIntMetric, mkIntervalMetric, mkPercentMetric } from "./ColumnMakers";

const d3 = require('d3-format')

export default ({ data, affiliates_mapping }) => {
  if(!data || data.length == 0) {
    return <div>No data found for the given parameters.</div>
  } 
  
  const dimensionKeys = R.pipe(
    R.keys,
    R.filter(k => k.indexOf('d_') == 0)
  )(data[0])


  const k = R.pipe(
    R.groupBy(x => x.d_day)
    , R.map(
      R.pipe(
        R.map(
        x => ([x.label, x.users]),   // TODO: Add category
        ),
        R.fromPairs
      )
    )
    , R.toPairs
    , R.map(x => ({ d_day: x[0], ...x[1]}))
  )(data)

  const keys = R.keys(k[0])
  
  return ( <ReactTable
    data={k}
    pageSize={50}
    showPagination={false}
    columns={[
      {
        Header: "Dimensions",
        columns: dimensionKeys.map(k => (dimensions[k] || mkArbitraryDimension(k))({affiliates_mapping})) //[dimensions.d_day, dimensions.d_affiliate_id]
      },
      {
        Header: "CR%",
        columns: [          
          mkPercentMetric(
            "CR",
            "cr_rate",
            "sales",
            "impressions"
          )]
      },
      {
        Header: 'Flow events',
        columns: keys.map((w, i) => ({Header: w, accessor: w}))
      }
    ]}        
    pivotBy={dimensionKeys}
    defaultSorted={[
      { id: "d_day", desc: false },
    ]}
    collapseOnSortingChange={false}
    defaultPageSize={5}
    className="-striped -highlight"
  />
  )
}