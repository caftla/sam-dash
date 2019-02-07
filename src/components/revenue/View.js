// @flow
import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css";
import { dimensions, mkArbitraryDimension, mkIntMetric, mkIntervalMetric, mkPercentMetric } from "./ColumnMakers";

export const View = ({ data, affiliates_mapping }) => {
  if(!data || data.length == 0)
    return <div>No data found.</div>

  const dimensionKeys = R.pipe(
    R.keys,
    R.filter(k => k.indexOf('d_') == 0)
  )(data[0])

  return ( <ReactTable
    data={data}
    pageSize={50}
    showPagination={false}
    columns={[
      {
        Header: "Dimensions",
        columns: dimensionKeys.map(k => (dimensions[k] || mkArbitraryDimension(k))({affiliates_mapping})) //[dimensions.d_day, dimensions.d_affiliate_id]
      },
      {
        Header: "Metrics",
        columns: [
          mkIntMetric("Sales", "sales", ","),
          
          mkPercentMetric(
            "CQ",
            "cq_rate",
            "firstbillings",
            "sales"
          ), 

          mkIntMetric("Week 1 Revenue", "week1_revenue", ",.0f"),

          mkPercentMetric(
            "Pixels",
            "pixels_events",
            "pixels",
            "sales"
          ),

          mkIntMetric("Cost", "cost", ",.0f"),    
          
          mkIntMetric("Revenue", "revenue", ",.0f"),

          mkIntMetric("Revenue in Local Currency", "local_currency_revenue", ",.0f"),

        ]
      }      
  ]}
    
    pivotBy={dimensionKeys}
    defaultSorted={[
      { id: "d_country_code", desc: false },
      { id: "d_day", desc: true },
      { id: "d_hour", desc: true },
      { id: "d_week", desc: true },
      { id: "d_month", desc: true },
      { id: "revenue", desc: true },
    ]}
    collapseOnSortingChange={false}
    defaultPageSize={70}
    // SubComponent={row => {
    //   return <pre>{JSON.stringify(row, null, 2)}</pre>;
    // }}
    className="-striped -highlight"
  />
  )
}