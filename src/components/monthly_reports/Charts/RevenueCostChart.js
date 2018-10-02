import React from 'react'
import * as R from 'ramda'


const toMyData = R.pipe(
  R.map(d => ({
    row: new Date(d.d_month), 
    cq: d.firstbillings / d.sales,
    ...d
  }))
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

      var revenueChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.revenue),
        type: "scatter",
        mode: 'lines',
        line: {
          color: "blue",
          width: 2,
          shape: 'hvh'
        },
        // xaxis: "x1",
        yaxis: "y1",
        showlegend: true,
        name: 'Revenue'
      };

      var costChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.cost),
        type: "scatter",
        mode: 'lines',
        line: {
          color: "orange",
          dash: 'dash',
          width: 2,
          shape: 'hvh'
        },
        // xaxis: 'x1',
        yaxis: 'y1',
        showlegend: true,
        name: 'Cost'
      };

      var data = [revenueChartData, costChartData]

      const yaxisf = {
        titlefont: {
          size: 14,
          color: '#7f7f7f'
        }
      }

      var layout = {
        // yaxis2: { domain: [0, 1] },
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
          title: "USD", ...yaxisf
        },
        height: 250
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
    return <div style={{ width: '1200px', height: '250px' }} ref='el' />
  }

}