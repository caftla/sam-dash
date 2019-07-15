{-
Welcome to a Spago project!
You can edit this file as you like.
-}
{ name =
    "my-project"
, dependencies =
    [ "aff"
    , "aff-promise"
    , "argonaut"
    , "argonaut-core"
    , "console"
    , "effect"
    , "foreign"
    , "foreign-generic"
    , "js-date"
    , "js-timers"
    , "node-postgres"
    , "node-process"
    , "now"
    , "numbers"
    , "ordered-collections"
    , "parsing"
    , "psci-support"
    , "refs"
    , "simple-json"
    ]
, packages =
    ./packages.dhall
, sources =
    [ "src/**/*.purs", "server/**/*.purs", "test/**/*.purs" ]
}
