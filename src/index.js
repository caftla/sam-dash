// @flow

import Offline from 'offline-plugin/runtime'
import React from 'react'
import { Provider } from 'react-redux'
import { render } from 'react-dom'
// import { BrowserRouter, Route } from 'react-router-dom'

import createHistory from 'history/createBrowserHistory'
import { Route } from 'react-router'

import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'

const history = createHistory()


import { store } from './store'

import Home from './components/Home'
import Dashboard from './components/Dashboard'
import Filter_Section_Row from './components/filter_section_row'
import { Body } from './components/Styled'

Offline.install()

export const Root = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Body>
        <Route exact path="/" component={Home} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route path="/filter_section_row/:date_from/:date_to/:filter/:section/:row" component={Filter_Section_Row} />
      </Body>
    </ConnectedRouter>
  </Provider>
)

if (!module.hot) render(<Root />, document.querySelector('react'))
