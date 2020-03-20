// @flow
import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css";
import { dimensions, mkArbitraryDimension, mkIntMetric, mkIntervalMetric, mkPercentMetric } from "./ColumnMakers";

const show_desired_metrics = (props) => {
  const essential_columns = [
    
    mkIntMetric("Sales", "sales", ",", false),
    
    mkPercentMetric(
      "CQ",
      "cq_rate",
      "firstbillings",
      "sales"
    ), 

    mkIntMetric("Week 1 Revenue", "week1_revenue", ",.0f", true),

    mkIntMetric("Cost", "cost", ",.0f", false),    
    
    mkPercentMetric(
      "Pixels",
      "pixels_events",
      "pixels",
      "sales"
    ),

    mkIntMetric("Revenue", "revenue", ",.0f", false),

    mkIntMetric("Successful Billings", "successful_billings", ",.0f", false)
  ]

  const additional_columns = [mkIntMetric("Revenue in Local Currency",  "local_currency_revenue", ",.0f", false)]
  const is_country_diemension = [props.filter, props.breakdown].some(string => string.indexOf('country_code') > -1)
  console.log(props.filter, props.breakdown, is_country_diemension)

  if(!!is_country_diemension) {
    console.log(essential_columns.concat(additional_columns))
    return essential_columns.concat(additional_columns)
  } else {
    return essential_columns
  }

}

export const View = ({ data, affiliates_mapping, props }) => {
  if(!data || data.length == 0)
    return <div>No data found.</div>

  const dimensionKeys = R.pipe(
    R.keys,
    R.filter(k => k.indexOf('d_') == 0),
  )(data[0])

  return ( <ReactTable
    data={data}
    pageSize={50}
    showPagination={false}
    columns={[
      {
        Header: "Dimensions",
        columns: dimensionKeys.map(k => (dimensions[k] || mkArbitraryDimension(k))({affiliates_mapping, props})) //[dimensions.d_day, dimensions.d_affiliate_id]
      },
      {
        Header: "Metrics",
        columns: show_desired_metrics(props)
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