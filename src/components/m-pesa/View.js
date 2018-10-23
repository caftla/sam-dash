import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css"
const d3 = require('d3-format')

const mkArbitraryDimension = (field, {name} = {}) => () => ({
  Header: name || R.pipe(
    R.split('_')
  , R.drop(1)
  , R.join('_')
  )(field),
  id: field,
  accessor: d => d[field],
  filterable: !true,
  aggregate: values => R.uniq(values),
  width: 120,
  Aggregated: (d, rows) => {
    return (
      <span onClick={() => console.log(d, rows)}>
        {`Σ (${
          R.pipe(
            R.flatten,
            R.uniq
          )(d.value).length
          }) `}
      </span>
    );
  }
})

const dimensions = {
  d_day: () => ({
    Header: "Day",
    id: "d_day",
    width: 140,
    accessor: d => d.d_day.split("T")[0],
    aggregate: R.uniq,
    PivotValue: ({ value }) => <span>{value}</span>,
    Aggregated: d => {
      return `${
        R.pipe(
          R.flatten,
          R.uniq
        )(d.value).length
        }`;
    }
  }),
  d_hour: () => ({
    Header: "Hour",
    id: "d_hour",
    width: 2*140,
    accessor: d => d.d_hour,
    aggregate: R.uniq,
    PivotValue: ({ value }) => <span>{value}</span>,
    Aggregated: d => {
      return `${
        R.pipe(
          R.flatten,
          R.uniq
        )(d.value).length
        }`;
    }
  }),
  d_affiliate_id: ({affiliates_mapping}) => ({
    Header: "Affiliate",
    id: "d_affiliate_id",
    accessor: d => d.d_affiliate_id,
    filterable: !true,
    filterMethod: (filter, row) => {
      const dim = row.d_affiliate_id;
      if (!!dim.map) {
        return R.pipe(
          R.flatten,
          R.any(d => d.indexOf(filter.value) > -1)
        )(dim);
      } else {
        return dim.indexOf(filter.value) > -1;
      }
    },
    aggregate: values => R.uniq(values),
    PivotValue: ({ value }) => affiliates_mapping[value],
    Cell: ({ value }) => affiliates_mapping[value],
    width: 140,
    Aggregated: (d, rows) => {
      return (
        <span onClick={() => console.log(d, rows)}>
          {`Σ (${
            R.pipe(
              R.flatten,
              R.uniq
            )(d.value).length
            }) `}
        </span>
      );
    }
  }),
  d_page: () => ({
    Header: "Page",
    id: "d_page",
    accessor: d => d.d_page,
    filterable: !true,
    aggregate: values => R.uniq(values),
    width: 120,
    Aggregated: (d, rows) => {
      return (
        <span onClick={() => console.log(d, rows)}>
          {`Σ (${
            R.pipe(
              R.flatten,
              R.uniq
            )(d.value).length
            }) `}
        </span>
      );
    }
  })
};

const mkIntMetric = (name, accessor) => ({
  Header: name,
  accessor: accessor,
  Cell: cell => d3.format(",")(cell.value),
  aggregate: vals => R.sum(vals),
  filterable: !true,
  filterMethod: (filter, row) => {
    if (filter.value === "all") {
      return true;
    }
    return row[accessor] >= parseInt(filter.value);
  },
  Filter: ({ filter, onChange }) => (
    <select
      onChange={event => onChange(event.target.value)}
      style={{ width: "100%" }}
      value={filter ? filter.value : "all"}
    >
      <option value="0">Show All</option>
      {[1, 10, 50, 100, 1000, 2000, 5000].map(i => (
        <option value={i.toString()} key={i.toString()}>
          &gt;= {i}
        </option>
      ))}
    </select>
  )
});

const mkPercentMetric = (name, id, numerator, denomerator) => ({
  Header: name,
  id: id,
  Cell: cell => {
    return d3.format(".2%")(cell.value.n / cell.value.d);
  },
  accessor: x => ({ n: x[numerator], d: x[denomerator] }),
  aggregate: vals =>
    R.pipe(
      R.reduce(
        ({ n, d }, a) => ({
          n: n + a.n,
          d: d + a.d
        }),
        { n: 0, d: 0 }
      )
    )(vals)
});

const mkIntervalMetric = (name, id, numerator, denomerator) => ({
  Header: name,
  id: id,
  Cell: cell => {
    return d3.format(",.0f")(
      cell.value.count > 1 ? cell.value.nd / cell.value.d : cell.value.n
    );
  },
  accessor: x => ({ n: x[numerator], d: x[denomerator] }),
  aggregate: vals =>
    R.pipe(
      R.reduce(
        ({ n, d, nd, count }, a) => ({
          n: n + a.n,
          nd: nd + a.n * a.d,
          d: d + a.d,
          count: count + 1
        }),
        { n: 0, d: 0, nd: 0, count: 0 }
      )
    )(vals)
});

export default ({ data, affiliates_mapping }) => {
  if(!data || data.length == 0)
    return <div>Empty</div>

  const dimensionKeys = R.pipe(
    R.keys,
    R.filter(k => k.indexOf('d_') == 0)
  )(data[0])
  return <ReactTable
    data={data}
    pageSize={93}
    showPagination={!false}
    columns={[
      {
        Header: "Dimensions",
        columns: dimensionKeys.map(k => (dimensions[k] || mkArbitraryDimension(k))({affiliates_mapping})) //[dimensions.d_day, dimensions.d_affiliate_id]
      },
      {
        Header: "Metrics",
        columns: [
          {
            Header: "Views",
            accessor: "impressions",
            aggregate: vals => R.sum(vals),
            Cell: cell => d3.format(",")(cell.value)
          },
          mkPercentMetric(
            "Advance in Flow",
            "flow_advance_events_rate",
            "flow_advance_events",
            "impressions"
          ),
          mkPercentMetric("Leads", "leads_rate", "leads", "impressions"),
          mkIntMetric("Sales", "sales"),
          mkPercentMetric("CR", "cr_rate", "sales", "impressions"),
          mkIntMetric("Total Amount", "total_sale_amount"),
          mkPercentMetric("Re-Sales", "resales_rate", "resales", "sales"),
          mkIntervalMetric(
            "Seconds till Advance",
            "avg_mode_first_flow_advance_event_time",
            "mode_first_flow_advance_event_time",
            "flow_advance_events"
          ),
          mkIntervalMetric(
            "Seconds till callback",
            "avg_mode_avg_callback_time_for_sales",
            "mode_avg_callback_time",
            "leads"
          )
        ]
      }
    ]}
    pivotBy={dimensionKeys}
    defaultSorted={[
      { id: "d_day", desc: true },
      { id: "d_hour", desc: true },
      { id: "sales", desc: true }
    ]}
    collapseOnSortingChange={false}
    defaultPageSize={16}
    SubComponent={row => {
      return <pre>{JSON.stringify(row, null, 2)}</pre>;
    }}
    className="-striped -highlight"
  />
}