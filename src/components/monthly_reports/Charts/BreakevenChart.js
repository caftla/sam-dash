import React from 'react'
import * as R from 'ramda'

const toMyData = R.pipe(
  R.map(d => ({
    ...d,
    row: new Date(d.d_month),
    arpus: d.arpus.map(a => R.merge({ row: new Date(a.date) }, a)),
    breakeven: R.pipe(R.filter(a => a.breakeven), R.head, x => !!x ? x.days : null)(d.arpus),
    sales: d.sales,
    ecpa: d.cost / d.sales,
    cq: d.firstbillings / d.sales
  }))
  , R.sortBy(d => d.row.valueOf())
);

export default class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.data || []


    this.draw = (isUpdating) => {

      const Plotly = window.Plotly
      const d3 = Plotly.d3


      this.isVisible = this.refs.el.offsetWidth != 0
      if (!this.isVisible)
        return

      const myData = toMyData(this.data)

      if (!myData)
        return

      var chartData = R.pipe(
        R.sortBy(x => x.row.valueOf()),
      )(myData);


      var breakevenChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.breakeven),
        type: "scatter",
        // mode: 'lines',
        line: {
          color: "green",
          width: 3
        },
        // xaxis: 'x1',
        yaxis: 'y1',
        showlegend: true,
        name: 'Breakeven'
      };

      var cqChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.sales > 100 ? d.cq : d.cq),
        type: "scatter",
        mode: 'lines',
        line: {
          color: "blue",
          dash: 'line',
          width: 2
        },
        // xaxis: 'x1',
        yaxis: 'y2',
        name: 'CQ'
      };

      var data = [ breakevenChartData]

      const yaxisf = {
        titlefont: {
          size: 14,
          color: '#7f7f7f'
        }
      }

      var layout = {
        legend: { "orientation": "h" },
        plot_bgcolor: "transparent",
        paper_bgcolor: "white",
        font: {
          color: "#333"
        },
        margin: { t: 15, r: 80, l: 80, b: 60 },
        xaxis: {
          anchor: "y1",
          type: 'date',
          gridcolor: "#aaa",
          zerolinecolor: "#aaa",
          tickformat: '%Y %b'
        },
        yaxis: {
          domain: [0, 1],
          gridcolor: "#aaa",
          zerolinecolor: "#aaa",
          side: "left",
          title: "Days", ...yaxisf
        },
        yaxis2: {
          domain: [0, 1],
          gridcolor: "#aaa",
          zerolinecolor: "#aaa",
          side: "right",
          title: "CQ", ...yaxisf,
          gridcolor: "transparent",
          zerolinecolor: "transparent",
          tickformat: '%'
        },
        height: 230
      };

      // return

      if (isUpdating) {
        this.refs.el.innerHTML = '';
      }

      Plotly.newPlot(this.refs.el, data, layout, {
        displayModeBar: false,
      });
    }
  }

  componentWillUpdate(nextProps) {
    if (this.data == null) {
      this.data = nextProps.data
      this.draw()
    } else {
      this.data = nextProps.data
      this.draw(true)
    }
  }

  componentDidMount() {
    if (!!this.data)
      this.draw()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.data)
      return true
    if (!nextProps.data)
      return true
    return !this.isVisible || JSON.stringify(this.data) !== JSON.stringify(nextProps.data)
  }

  render() {
    return <div style={{ width: '1200px', height: '230px' }} ref='el' />
  }

}