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
    key:"One Click"
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
        <ol style={{padding:0}}>
          {
            scenariosService.map((obj, index)=>{
              if(Object.keys(env).includes(obj.scenarioKey)){
                return(
                  <li style={{float:"none", listStyle:"none"}}>
                    {obj.label} 
                  </li>
                )
              }
            })
          }
        </ol>
        <button 
          onClick={()=>toggleShowMore()}
          className="more-btn"
        >
          More Info...
        </button>
      </div>
      }
    </div>
  )
}