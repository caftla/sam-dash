const d3 = require('d3-format')

export const mkArbitraryDimension = (field, {name} = {}) => () => ({
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

export const dimensions = {
  d_day: () => ({
    Header: "Day",
    id: "d_day",
    width: 140,
    accessor: d => d.d_day,
    aggregate: R.uniq,
    PivotValue: ({ value }) => <span>{value.split('T')[0]}</span>,
    Aggregated: d => {
      return `${
        R.pipe(
          R.flatten,
          R.uniq
        )(d.value).length
        }`;
    }
  }),
  d_month: () => ({
    Header: "Month",
    id: "d_month",
    width: 140,
    accessor: d => d.d_month,
    aggregate: R.uniq,
    PivotValue: ({ value }) => <span>{value.split('T')[0]}</span>,
    Aggregated: d => {
      return `${
        R.pipe(
          R.flatten,
          R.uniq
        )(d.value).length
        }`;
    }
  }),
  d_week: () => ({
    Header: "Week",
    id: "d_week",
    width: 2*140,
    accessor: d => d.d_week,
    aggregate: R.uniq,
    PivotValue: ({ value }) => <span>{value.split('T')[0]}</span>,
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
  })
};


export const mkIntMetric = (name, accessor, format) => ({
  Header: name,
  accessor: accessor,
  Cell: cell => d3.format(format)(cell.value),
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
  ),
  show: true
});



export const mkPercentMetric = (name, id, numerator, denomerator) => ({
  Header: name,
  id: id,
  Cell: cell => {
    const result = (cell.value.n / cell.value.d)
    return isNaN(result)? 0 : d3.format(".2%")(result);
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

export const mkIntervalMetric = (name, id, numerator, denomerator) => ({
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