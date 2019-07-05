import React, { Component } from "react";
import Modal from "../modal";
export default ({data, close})=>{
  return(
    <Modal
      customClass="bouncedModal"
      close={()=>close()}
      custom={()=>{
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
          <div>
            <div>
              <label>
                Strategy:
              </label>
              <div>
                {env.strategy}
              </div>
            </div>
            <div>
              <table
                border="1px"
                width="100%"
                bordercolor="#eee"
              >
                <thead>
                  <tr>
                    <th>Flow</th>
                    <th>Scenario</th>
                    <th>Service</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    scenariosService.map((obj, index)=>{
                      if(Object.keys(env).includes(obj.scenarioKey))
                      return(
                        <tr>
                          <td>
                            {obj.label}
                          </td>
                          <td>
                            {env[obj.scenarioKey]}
                          </td>
                          <td>
                            {env[obj.serviceKey]}
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
            </table>
            <pre id="json">
              {JSON.stringify(JSON.parse(data.env_dump) , undefined, 2)}
            </pre>
            </div>
          </div>
        )
      }}
    /> 
  )
}