// @flow

import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import {createLogger} from "redux-logger";

// import throttle from 'lodash/throttle'

import rootReducer from './reducers'
import { saveState, loadState } from './helpers'

const log = createLogger({ diff: true, collapsed: true });

const middleware = [thunk];

// if (process.env.NODE_ENV === "development"){
//   middleware.push(log);
// }
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__  || compose

const initState = loadState() || undefined

export const store = createStore(rootReducer, initState,
  composeEnhancers(
    applyMiddleware(...middleware),
  ),
)
// store.subscribe(throttle(() => saveState(store.getState()), 1000))
// store.dispatch(loginWithToken(store.getState().user))
