import React, { Component } from "react";
export default ({data, toggleShowMore})=>{
  const env = data.env_dump ? JSON.parse(data.env_dump) : {};
  const scenariosService = [{
    scenarioKey:"pinScenario",
    serviceKey:"pinService",
    label:"Pin"
  },{
    scenarioKey:"moScenario",
    serviceKey:"moService",
    label:"Mo"
  },{
    scenarioKey:"oneClickScenario",
    serviceKey:"oneClickService",
    label:"One-Click"
  },{
    scenarioKey:"click2smsScenario",
    serviceKey:"click2smsService",
    label:"Click2sms"
  },{
    scenarioKey:"moredirScenario",
    serviceKey:"moredirService",
    label:"Mo Redirect"
  }];

  return(
    <div className="strategy-cell">
      { data.strategy &&
      <div>
        {data.strategy}
        <button 
          onClick={()=>toggleShowMore()}
          className="more-btn"
        >
          <span>...</span>
        </button>
      </div>
      }
    </div>
  )
}