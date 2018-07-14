module Server.QueryServer where

import Control.Promise as Promise
import Data.Either (either)
import Data.Map as M
import Data.Maybe (Maybe(..))
import Database.Postgres as PG
import Effect (Effect)
import Effect.Aff as Aff
import Effect.Aff.Class (liftAff)
import Effect.Console as Console
import Effect.Exception (throw)
import Effect.Ref (Ref, new)
import Foreign (Foreign)
import Node.Process (lookupEnv)
import Prelude (bind, discard, mempty, pure, show, ($), (<>), (>>=))
import Server.Query (GetQueryState, KillQuery, QueryCache, QueryState(..), RunDbQueryAsync, RunDbQuerySync, getQueryState, killQuery, queryAsync, querySync)
import Server.Utils.TTLCache as Cache

newtype AppState = AppState {
    queryCache :: Ref QueryCache
  , queryAsync :: RunDbQueryAsync 
  , querySync :: RunDbQuerySync
  , getQueryState :: GetQueryState  
  , killQuery :: KillQuery 
}

main ::  Effect AppState 
main = do
  connStr <- lookupEnv "jewel_connection_string" >>= \ m -> case m of
    Just a -> pure a
    Nothing -> throw "Expected jewel_connection_string ENV variable."

  connect connStr

connect :: String → Effect AppState
connect connStr = do
  Console.log "connecting ..."
  
  let connectionInfo = PG.connectionInfoFromString connStr

  cache <- new M.empty
  pool <- PG.mkPool connectionInfo

  let queryAsync' = queryAsync cache pool 
  let querySync' = querySync cache pool 
  let getQueryState' = getQueryState cache
  let killQuery' = killQuery cache

  let state = AppState { 
          queryCache: cache
        , queryAsync: queryAsync'
        , getQueryState: getQueryState'  
        , killQuery: killQuery'
        , querySync: querySync'
        }

  Console.log "pool created"  

  pure state



sayHelloAsync :: String -> Aff.Aff String
sayHelloAsync a = pure $ "hello async " <> a

-- runMyAff left right = Aff.runAff_ (
--         either left right
--     )

    
fromAff :: forall a. Aff.Aff a -> Effect (Promise.Promise a)
fromAff = Promise.fromAff