import R from 'ramda';

const parseFlowEvents = R.map(R.pipe(
  x => R.merge(x, {
      args: JSON.parse(`[${x.args}]`).map(y => ({args: y}))
    , categories: JSON.parse(`[${x.categories}]`).map(y => ({category: y}))
    , actions: JSON.parse(`[${x.actions}]`).map(y => ({action: y}))
    , labels: JSON.parse(`[${x.labels}]`).map(y => ({label: y}))
    , relative_times: JSON.parse(`[${x.relative_times}]`).map(y => ({relative_time: y}))
  })
, x => R.merge(x, {
    events: R.sortBy(e => e.relative_time, 
        R.zipWith(R.merge, 
          R.zipWith(R.merge, 
            R.zipWith(R.merge, 
              R.zipWith(R.merge, x.categories, x.actions)
            , x.labels)
          , x.relative_times)
        , x.args)
    )
  })
, R.omit(['categories', 'actions', 'labels', 'relative_times', 'args'])
, x => R.merge({
    has_msisdn_submission_failure: x.events.some(
      d => !!d.args && d.label === "msisdn-submission-failure"
    ),
    has_msisdn_submission_success: x.events.some(
      d => !!d.args && d.label === "msisdn-submission-success"
    ),
    errors: x.events
      .filter(d => d.action === "recede")
      .map(d => ({ label: d.label, args: d.args }))
  }, x)
))

export default parseFlowEvents