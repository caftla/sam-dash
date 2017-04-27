// @flow

// Helper function for matching against an ADT.
export default function match<A,B>(matcher: A): (match: (matcher: A) => B) => B {
  return match => match(matcher)
}
