// @flow

function match_<A,B>(matcher: A): (match: (matcher: A) => B) => B {
  return match => match(matcher)
}


// The algebraic data type.
// This is the type that we use for entity values and function arguments.

export type FetchState<U> = <T>(_: FetchStateMatcher<T, U>) => T

// Type constructed by functions that match against the `FetchState` type.
// This is the type that describes what an entity actually looks like.
// The matcher type does not necessarily have to be exported.

type FetchStateMatcher<T, U> = {
  Nothing:   ()       => T,
  Loading:   ()                  => T,
  Loaded:    (_:  U)    => T,
  Error:     (_: any) => T
}

export const isNothing = <U>(fs: FetchState<U>) : boolean => match_({
      Nothing: () => true
    , Loading: () => false
    , Error: (error) => false
    , Loaded: (data) => false
  })(fs)

export const map = <T, V, U, O>(f: U => O, fs: FetchState<U>) : FetchState<V> => match_({
      Nothing: () => Nothing()
    , Loading: () => Loading()
    , Error: (error) => Error(error)
    , Loaded: (data : U) => Loaded(f(data))
  })(fs)

export const toEq = <U>(fs: FetchState<U>) : string | U => match_({
      Nothing: () => 'Nothing'
    , Loading: () => 'Loading'
    , Error: (error) => 'Error'
    , Loaded: (data) => data
  })(fs)

// Value constructors for the type `FetchState`

export const Nothing = <U>(props: *) : FetchState<U> =>
  <T>(matcher: FetchStateMatcher<T, U>): T => matcher.Nothing(props)

export const Loaded = <U>(props: *): FetchState<U> =>
  <T>(matcher: FetchStateMatcher<T, U>): T => matcher.Loaded(props)

export const Loading = <U>(props: *): FetchState<U> =>
  <T>(matcher: FetchStateMatcher<T, U>): T => matcher.Loading(props)

export const Error = <U>(props: *): FetchState<U> =>
  <T>(matcher: FetchStateMatcher<T, U>): T => matcher.Error(props)
