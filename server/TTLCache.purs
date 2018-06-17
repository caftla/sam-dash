module Server.Utils.TTLCache where

import Prelude

import Effect.Aff (Aff, Milliseconds(Milliseconds), delay, forkAff, launchAff, launchAff_)
import Effect.Class (class MonadEffect, liftEffect)
-- import Effect.Now (NOW)
import Effect.Ref as R
import Effect.Timer as T
import Data.Int (toNumber)
import Data.JSDate as JSDate
import Data.Map as M
import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..), fst, snd)
import Effect (Effect)


type Cache a = M.Map String (Tuple Number a)

mkEmptyCache :: forall a. Effect (R.Ref (Cache a))
mkEmptyCache = R.new M.empty


withCachedItem_ cache key f = do
  mItem <- liftEffect ((M.lookup key) <$> R.read cache )
  case mItem of 
    Nothing -> do 
      pure unit
    Just item' -> f item'

withCachedItem cache key f = do
  mItem <- liftEffect ((M.lookup key) <$> R.read cache )
  case mItem of 
    Nothing -> pure Nothing
    Just item' -> Just <$> f item'

time = JSDate.getTime <$> JSDate.now

wait :: ∀ u. Number → Aff u → Aff u
wait n f = delay (Milliseconds n) *> f

wait' :: Int → Effect Unit → Effect T.TimeoutId
wait' n = T.setTimeout n

checkExpiry :: ∀ val. R.Ref (M.Map String (Tuple Number val)) → String → Effect Unit
checkExpiry cache key = 
  withCachedItem_ cache key (\ (Tuple exp _) -> do
    now <- time
    let b = now - exp
    if b >= (toNumber 0)
      then void $ R.modify (M.delete key) cache
      else void $ launchAff $ forkAff $ wait b (liftEffect $ checkExpiry cache key)
  )

extendCache :: ∀ val. R.Ref (M.Map String (Tuple Number val)) → String → Int → Effect Unit
extendCache cache key ttl = do 
  withCachedItem_ cache key (\ (Tuple exp val)  -> do
    void $ R.modify (M.insert key (Tuple (exp + toNumber ttl) val)) cache
    scheduleCleanup cache ttl key
  )

addCache :: ∀ val. R.Ref (M.Map String (Tuple Number val)) → Int → String → val → Effect Unit
addCache cache ttl key val = do
  now <- time
  let item = Tuple (now + (toNumber ttl)) val
  void $ R.modify (M.insert key item) cache
  scheduleCleanup cache ttl key


updateCache :: ∀ val. R.Ref (M.Map String (Tuple Number val)) → String → val → Effect Unit
updateCache cache key val = withCachedItem_ cache key (\ (Tuple exp v) ->
  void $ R.modify (M.update (const $ Just $ Tuple exp val) key) cache
)

getCache :: ∀ val m ttl. Bind m ⇒ MonadEffect m ⇒ R.Ref (M.Map String (Tuple ttl val)) → String → m (Maybe val)
getCache cache key = withCachedItem cache key (\ (Tuple exp val)  -> pure val)


scheduleCleanup :: ∀ val. R.Ref (M.Map String (Tuple Number val)) → Int → String → Effect Unit
scheduleCleanup cache ttl key =
  launchAff_ $ forkAff $ 
    void $ wait (toNumber $ ttl + 1000) $ do
      mItem <- liftEffect ((M.lookup key) <$> R.read cache )
      case mItem of 
        Nothing -> pure unit
        Just item' -> do
          now' <- liftEffect time
          let b = now' - fst item'
          if b >= (toNumber 0)
            then liftEffect $ void $ R.modify (M.delete key) cache
            else liftEffect $ pure unit


-- type WaitOnCache m e val = String → Number → (Maybe val → m Boolean) → m Unit

-- waitOnCache :: ∀ val e m. Monad m => MonadEffect e m => R.Ref (M.Map String (Tuple Number val)) → WaitOnCache m e val
-- waitOnCache :: ∀ t83 t94 t97 m. MonadEffect t83 m => R.Ref (M.Map String (Tuple t97 t94)) → String → Number → (Maybe t94 → m ( ref ∷ R.REF | t83 ) Boolean ) → m ( ref ∷ R.REF | t83 ) Unit
waitOnCache ::  forall val ttl. R.Ref (M.Map String (Tuple ttl val)) -> String -> Number -> (Maybe val -> Effect Boolean) -> Effect Unit
waitOnCache cache key interval callback = 
  launchAff_ $ forkAff $ void $ wait interval $ do
    mItem <- liftEffect ((M.lookup key) <$> R.read cache )
    b <- liftEffect $ callback (snd <$> mItem) 
    if b
      then pure unit
      else liftEffect $ waitOnCache cache key interval callback
