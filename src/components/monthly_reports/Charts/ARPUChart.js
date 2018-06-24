import React from 'react'
import moment from 'moment'
import * as R from 'ramda'

const toMyData = R.pipe(
  R.map(d => ({
    row: new Date(d.d_month),
    arpus: d.arpus.map(a => R.merge({row: new Date(a.date)}, a)),
    sales: d.sales,
    ecpa: d.cost / d.sales
  }))
, R.sortBy(d => d.row.valueOf())
);

class Chart extends React.Component {
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

      var chartData = R.map(d =>
        R.merge(d, { arpus: d.arpus.filter(a => a.base > 100 && a.row <= R.last(myData).row) })
      )(myData);


      const color = d3.scale.linear().domain([1, chartData.length])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#007AFF"), d3.rgb('#46ff00')]);

      // debugger

      var arpuChartData = R.addIndex(R.map)(({ row, arpus }, i) => ({
        x: arpus.map(a => a.row),
        y: arpus.map(a => a.arpu),
        type: "scatter",
        mode: 'lines',
        line: {
          // width: 3,
          color: color(i)
        },
        // xaxis: "x1",
        yaxis: "y2",
        showlegend: false,
        name: moment(row).format("YYYY-MM-DD"),
      }))(chartData);

      var salesChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.sales),
        type: "scatter",
        fill: "tozeroy",
        fillcolor: "#ddd",
        mode: 'lines',
        line: {
          color: "#ddd",
          shape: 'hvh'
        },
        // xaxis: "x1",
        yaxis: "y1",
        showlegend: false,
        name: 'Sales'
      };

      var ecpaChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.ecpa),
        type: "scatter",
        mode: 'lines',
        line: {
          color: "orange",
          dash: 'dash',
          width: 4
        },
        // xaxis: 'x1',
        yaxis: 'y2',
        name: 'eCPA'
      };

      var data = [salesChartData, ecpaChartData].concat(arpuChartData); 

      const yaxisf = {
        titlefont: {
          size: 14,
          color: '#7f7f7f'
        }
      }

      var layout = {
        yaxis: { domain: [0, 1] },
        yaxis2: { domain: [0, 1] },
        yaxis3: { domain: [0, 1] },
        // xaxis2: { anchor: "y2" },
        xaxis: { anchor: "y1" },
        legend: { orientation: "h" },
        plot_bgcolor: "transparent",
        paper_bgcolor: "white",
        font: {
          color: "#333"
        },
        margin: { t: 40, r: 80, l: 80, b: 60 },
        xaxis: {
          type: 'date',
          gridcolor: "#666",
          tickformat: '%Y %b'
        },
        yaxis: {
          gridcolor: "transparent",
          zerolinecolor: "transparent",
          side: "right",
          title: "Sales", ...yaxisf
        },
        // xaxis2: {
        //   gridcolor: "#666",
        //   side: "top"
        // },
        yaxis2: {
          gridcolor: "#666",
          hoverformat: '.1f',
          title: "ARPU / eCPA", ...yaxisf
        },
        yaxis3: {
          gridcolor: "transparent",
          zerolinecolor: "transparent"
        },
        height: 400
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
      this.draw(false)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.data)
      return true
    if (!nextProps.data)
      return true
    return !this.isVisible || JSON.stringify(this.data) != JSON.stringify(nextProps.data)
  }

  render() {
    return <div style={ { width: '1200px', height: '400px' } } ref='el' />
  }

}

export default Chart // d => <div>D</div>