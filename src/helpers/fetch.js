// @flow

import * as R from 'ramda'

export const post = async ({ url, body } : {url: string, body: mixed}) => {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return data
}

export const get = async ({ url } : { url : string }) => {
  const res = await fetch(url, {
    credentials: 'include'
  })
  const data = await res.json()
  return data
}

export const toQueryString = R.pipe(
      R.toPairs
    , R.map(([k, v]) => `${k}=${v}`)
    , R.join('&')
  )

export const fromQueryString = R.pipe(
      x => x.split('&')
    , R.map(x => x.split('='))
    , R.fromPairs
  )
