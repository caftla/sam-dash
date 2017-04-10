// @flow

export const saveState = <T>(state: T) : void => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem('state', serializedState)
  } catch (err) {
    console.warn(err)
  }
}

export const loadState = <T>() : ?T => {
  try {
    const serializedState = localStorage.getItem('state')
    if (!serializedState) {
      return undefined
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}
