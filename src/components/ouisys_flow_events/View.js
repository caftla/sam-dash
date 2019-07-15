import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./View.css"
import Tooltip from "./Tooltip";
import parseFlowEvents from "./parse-flow-events";
import "./styles.styl"
const d3 = require('d3-format')

export default ({ data, affiliates_mapping }) => {
  if(!data || data.length == 0)
    return <div>Empty</div>

  const displayData = parseFlowEvents(data)

  const {min, max} = R.pipe(
    R.chain(x => x.events),
    R.pipe(
      R.map((x: any) => x.relative_time),
      R.filter((x: any) => typeof x == "number"),
      filterOutliers,
      (xs: any) =>
        R.merge(stats(xs), {
          max: R.reduce(R.max, -Infinity, xs),
          median: R.median(xs),
          min: R.reduce(R.min, Infinity, xs)
        })
    )
  )(displayData)

  // return <pre>{JSON.stringify(parseFlowEvents(data, null, 2))}</pre>

  return <ViewEventsData data={R.take(100, displayData)} min={min} max={max} />
}


function ViewEventsData({ data, max }) {
  return (
    <>
      {data.map((d, i) => {
        const msisdn = d.events.find(d => !!d.args && !!d.args.msisdn);
        return (
          <div
            key={i.toString()}
            data-has-sale={d.events.some(
              d => !!d.args && d.label === "pin-submission-success"
            )}
          >
            <div className="events-timeline">
              <span className="date">{d.date_created.split(".")[0]}</span>
              <span className="ip">{d.ip}</span>
              <Tooltip
                hideArrow={false}
                placement="right"
                tooltip={<pre>{JSON.stringify(d.errors, null, 2)}</pre>}
                className={`msisdn ${
                  d.has_msisdn_submission_failure
                    ? "has_msisdn_submission_failure"
                    : d.has_msisdn_submission_success
                    ? "has_msisdn_submission_success"
                    : ""
                }`}
              >
                {R.view(R.lensPath(["args", "msisdn"]), msisdn)}
              </Tooltip>
              {R.range(1, Math.ceil(max / (1 * 5))).map(i => {
                const from = (i - 1) * 1 * 5;
                const to = i * 1 * 5;
                const events = d.events.filter(
                  e => e.relative_time >= from && e.relative_time <= to
                );
                return (
                  <Tooltip
                    hideArrow={false}
                    placement="top"
                    tooltip={<pre>{JSON.stringify(events, null, 2)}</pre>}
                    className={`event ${events
                      .map(x => x.category)
                      .join(" ")} ${events
                      .map(x => x.action)
                      .join(" ")} ${events.map(x => x.label).join(" ")}`}
                    key={i.toString()}
                  >
                    {events.length > 0 ? events.length : ""}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

const stats = data =>
  data.reduce(
    ({ count, sum, mean, vari }, x) => {
      const k = 1 / (count + 1);
      const mean_ = mean + k * (x - mean);
      const ssr_ = (count - 1) * vari + k * count * (x - mean) * (x - mean);
      return {
        count: count + 1,
        sum: sum + x,
        mean: mean_,
        vari: ssr_ / Math.max(1, count)
      };
    },
    { count: 0, sum: 0, mean: 0, vari: 0 }
  );

  function filterOutliers(someArray) {
    // Copy the values, rather than operating on references to existing values
    var values = someArray.concat();
  
    // Then sort
    values.sort(function(a, b) {
      return a > b ? 1 : a === b ? 0 : -1;
    });
  
    /* Then find a generous IQR. This is generous because if (values.length / 4)
     * is not an int, then really you should average the two elements on either
     * side to find q1.
     */
  
    var q1 = values[Math.floor(values.length / 4)];
    // Likewise for q3.
    var q3 = values[Math.ceil(values.length * (3 / 4))];
    var iqr = q3 - q1;
  
    // Then find min and max values
    var maxValue = q3 + iqr * 1.5;
    var minValue = q1 - iqr * 1.5;
  
    // Then filter anything beyond or beneath these values.
    var filteredValues = values.filter(function(x) {
      return x <= maxValue && x >= minValue;
    });
  
    // Then return
    return filteredValues;
  }
  