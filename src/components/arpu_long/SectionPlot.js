const R = require('ramda')
import React from 'react'
import moment from 'moment'
import { debug, debuglog } from 'util';

const aKeys = [
  "week_1",
  "week_2",
  "month_1",
  "month_2",
  "month_3",
  "month_4",
  "month_5",
  "month_6",
  "month_7",
  "month_8",
  "month_9",
  "month_10",
  "month_11",
  "month_12"
]

const arpuKeys = aKeys.map(x => `arpu_${x}`)
const revenueKeys = aKeys.map(x => `revenue_${x}`)
const salesKeys = aKeys.map(x => `sales_${x}`)

const toMyData = R.pipe(
  R.map(d => ({
    row: d.row,
    arpus: R.pipe(
      R.map(a => [d[`revenue_${a}`], d[`sales_${a}`]])
      , R.addIndex(R.map)(([r, s], i) => [i < 2 ? i + 1 : (i - 1) * 4.36, r / s, s])
      , R.filter(([i, a, s]) => s != null)
      , as => {
        const avgSales = R.pipe(R.map(a => a[2]), R.mean)(as)
        return R.filter(
          a => a[2] >= avgSales * 0.1
        )(as)
      }
    )(aKeys),
    sales: d.sales,
    ecpa: d.cost / d.sales
  }))
);

class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.data = props.data || []


    this.draw = (isUpdating) => {

      const Plotly = window.Plotly
      const d3 = Plotly.d3


      this.isVisible = this.refs.el.offsetWidth != 0
      if(!this.isVisible)
        return

      const myData = toMyData(this.data)
      console.log(myData)
      if (!myData)
        return
      
      var chartData = R.pipe(
        R.sortBy(x => new Date(x.row).valueOf()),
        R.map(y =>
          R.merge(y, {
            arpus: R.reduce(
              ({ arpus, prev }, a) =>
                a[1] != null && a[1] > prev
                  ? { arpus: arpus.concat([a]), prev: a[1] }
                  : { arpus, prev },
              { arpus: [], prev: 0 }
            )(y.arpus).arpus
          })
        )
      )(myData);

      const color = d3.scale.linear().domain([1, chartData.length])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

      // debugger

      var arpuChartData = R.addIndex(R.map)(({ row, arpus }, i) => ({
        x: arpus.map(a => {
          return moment(row).add((a[0] - 1) * 7, 'day').format('YYYY-MM-DD')
        }), // arpus.map(a => a[0] + i * 4.36)
        y: arpus.map(a => a[1]),
        type: "scatter",
        xaxis: "x2",
        yaxis: "y2",
        name: moment(row).format("YYYY-MM-DD"),
        line: {
          width: 3,
          color: color(i)
        },
        xaxis: "x1",
        showlegend: false
      }))(chartData);

      var salesChartData = {
        x: chartData.map((d, i) => d.row),
        y: chartData.map(d => d.sales),
        type: "scatter",
        fill: "tozeroy",
        fillcolor: "#ddd",
        mode: 'lines',
        line: {
          color: "#ddd"
        },
        xaxis: "x1",
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
          color: "green",
          dash: 'dash',
          width: 6
        },
        xaxis: 'x1',
        yaxis: 'y2',
        name: 'eCPA'
      };

      var data = [salesChartData, ecpaChartData].concat(arpuChartData); //[trace2, trace1]

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
        xaxis2: { anchor: "y2" },
        xaxis: { anchor: "y1" },
        legend: { orientation: "h" },
        plot_bgcolor: "transparent",
        paper_bgcolor: "white",
        font: {
          color: "#333"
        },
        margin: { t: 40, r: 80, l: 80, b: 0 },
        xaxis: {
          gridcolor: "transparent"
        },
        yaxis: {
          gridcolor: "transparent",
          side: "right",
          title: "Sales", ...yaxisf
        },
        xaxis2: {
          gridcolor: "#666",
          side: "top"
        },
        yaxis2: {
          gridcolor: "#666",
          hoverformat: '.1f',
          title: "ARPU / eCPA", ...yaxisf
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
      this.draw()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.data)
      return true
    if (!nextProps.data)
      return true
    return !this.isVisible || JSON.stringify(this.data) != JSON.stringify(nextProps.data)
  }

  render() {
    return <div ref='el' />
  }

}

export default class StatefulPlot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPlot: false
    }
  }

  render(){
    return this.state.showPlot 
      ? <div>
        <div onClick={() => this.setState({ showPlot: false })}>
          <i className="fa fa-window-close" aria-hidden="true" style={{ cursor: 'pointer' }} />
        </div>
        <Chart data={this.props.data} />
      </div>
      : <button style={{float: 'left'}} onClick={() => this.setState({ showPlot: true })}>Plot</button>
  }
}