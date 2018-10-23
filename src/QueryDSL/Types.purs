module Query.Types where
import Data.Either
import Data.Eq

import Data.Argonaut ((:=), (~>))
import Data.Argonaut.Core as J
import Data.Array as A
import Data.Bifunctor (bimap)
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Eq (genericEq)
import Data.Generic.Rep.Ord (class GenericOrd, genericCompare)
import Data.Generic.Rep.Show (genericShow)
import Data.Int (toNumber)
import Data.JSDate (JSDate)
import Data.JSDate as JSD
import Data.List (List(..), filter, intercalate, (:))
import Data.List as L
import Data.Map (Map)
import Data.Map as SM
import Data.Maybe (Maybe(Nothing, Just), fromMaybe, maybe)
import Data.Monoid (mempty)
import Data.Ord (Ordering(..), abs, compare)
import Data.String as S
import Data.Traversable (foldrDefault, sequence, traverse)
import Data.Tuple (Tuple(..))
import Effect.Unsafe (unsafePerformEffect)
import Foreign (F, Foreign, readBoolean, readNullOrUndefined, readNumber, readString, unsafeFromForeign)
import Foreign.Index ((!))
import Foreign.Object as Obj
import Prelude (class Ord, class Ring, class Semiring, class Show, append, bind, map, negate, not, pure, show, zero, ($), (*), (<$>), (<<<), (<>), (==), (>), (>=), (>>=), ($>))

type StrMap a = Map String a
type SqlColMap a = Map SqlCol a

id :: forall x. x -> x
id x = x

--

class ToQueryPathString a where
  toQueryPathString :: a -> String
   
--

data SqlCol = SqlColNormal String | SqlColJSON {colName :: String, jsonField :: String}
derive instance genericSqlCol :: Generic SqlCol _
instance showSqlCol :: Show SqlCol where
  show = genericShow
instance eqSqlCol :: Eq SqlCol where
  eq = genericEq
instance ordSqlCol :: Ord SqlCol where
  compare (SqlColNormal a) (SqlColNormal b) = compare a b
  compare (SqlColNormal a) (SqlColJSON b) = compare a (b.colName <> b.jsonField)
  compare (SqlColJSON a) (SqlColJSON b) = compare (a.colName <> a.jsonField) (b.colName <> b.jsonField)
  compare a b = compare b a



strMapToQueryPathString :: forall a. (a -> String) -> StrMap a -> String 
strMapToQueryPathString f = 
  A.intercalate "," 
  <<< A.reverse
  <<< A.fromFoldable 
  <<< SM.foldSubmap Nothing Nothing (\key val -> L.singleton (key `appif` f val))
  where
  appif a b = if S.length b > 0 then a <> ":" <> b else a

sqlColMapToQueryPathString :: forall a. (a -> String) -> SqlColMap a -> String 
sqlColMapToQueryPathString f = 
  A.intercalate "," 
  <<< A.reverse
  <<< A.fromFoldable 
  <<< SM.foldSubmap Nothing Nothing (\key val -> L.singleton (key `appif` f val))
  where
  appif a b = 
    if S.length b > 0 then  a' <> ":" <> b else a' where
    a' = case a of
      SqlColNormal c -> c
      SqlColJSON c -> c.colName <> "." <> c.jsonField

sqlColListToQueryPathString :: forall a. (a -> String) -> List (Tuple SqlCol a) -> String 
sqlColListToQueryPathString f = 
  A.intercalate "," 
  <<< A.fromFoldable 
  <<< map (\(Tuple key val) -> key `appif` f val)
  where
  appif a b = 
    if S.length b > 0 then  a' <> ":" <> b else a' where
    a' = case a of
      SqlColNormal c -> c
      SqlColJSON c -> c.colName <> "." <> c.jsonField

prependToAll :: forall a. a -> List a -> List a
prependToAll sep (x : xs) = sep : x : prependToAll sep xs
prependToAll _   _     = mempty

intersperse :: forall a. a -> List a -> List a
intersperse sep (x : xs)  = x : prependToAll sep xs
intersperse _   _      = mempty


data SortOrder = ASC | DESC
derive instance genericSortOrder :: Generic SortOrder _
instance showSortOrder :: Show SortOrder where
  show = genericShow

instance toJsonSortOrder :: ToJSON SortOrder where
  toJson ASC = J.fromString "ASC"
  toJson DESC = J.fromString "DESC"

data Sort = Sort {
  by :: String,
  order :: SortOrder
}
derive instance genericSort :: Generic Sort _
instance showSort :: Show Sort where
  show = genericShow

instance toJsonSort :: ToJSON Sort where
  toJson (Sort s) = J.fromObject $ Obj.fromFoldable [Tuple "by" (J.fromString s.by), Tuple "order" (toJson s.order)]

type ValuesFilter = StrMap Int

data BreakdownDetails = BreakdownDetails {
  sort :: Maybe Sort,
  valuesFilter :: Maybe ValuesFilter
}
derive instance genericBreakdownDetails :: Generic BreakdownDetails _
instance showBreakdownDetails :: Show BreakdownDetails where
  show = genericShow

-- |
-- > toJson $ BreakdownDetails { sort : Just (Sort { by: "sales", order: DESC }), valuesFilter: Just $  SM.fromFoldable [Tuple "sales" 100] }
-- > {"sort":{"by":"sales","order":"DESC"},"valuesFilter":{"sales":100}}
instance toJsonBreakdownDetails :: ToJSON BreakdownDetails where
  toJson (BreakdownDetails b) = J.fromObject $ Obj.fromFoldable [
      Tuple "sort" (maybe J.jsonNull toJson b.sort)
    , Tuple "valuesFilter" (maybe J.jsonNull strMapToJson b.valuesFilter)
    ]

emptyBreakdownDetails :: BreakdownDetails
emptyBreakdownDetails = BreakdownDetails { sort: Nothing, valuesFilter: Nothing }

type Breakdown = List (Tuple SqlCol BreakdownDetails)

breakdownToQueryStringPath :: Breakdown -> String
breakdownToQueryStringPath = toQueryPathString

instance toQueryPathStringBreakdown :: ToQueryPathString (List (Tuple SqlCol BreakdownDetails)) where
  toQueryPathString = sqlColListToQueryPathString breakdownToStr
    where
      breakdownToStr :: BreakdownDetails -> String
      breakdownToStr (BreakdownDetails det) = 
        let s = sortToStr <$> det.sort
            f = valuesFilterToStr <$> det.valuesFilter
        in intercalate "" $ surround "(" ")" $ intersperse "," $ map (fromMaybe "") $ filter (\x -> not (x == Nothing)) (s : f : mempty)

      surround l r (a:as) = (l : a : as) `append` (r : mempty)
      surround _ _ _ = mempty

      
      sortToStr :: Sort -> String
      sortToStr (Sort s) = s.by <> ":" <> orderToStr s.order

      orderToStr ASC = "A"
      orderToStr DESC = "D"

      valuesFilterToStr :: ValuesFilter -> String
      valuesFilterToStr = strMapToQueryPathString show

data LikePosition = LikeBefore | LikeAfter | LikeBoth
derive instance genericLikePosition :: Generic LikePosition _
instance showLikePosition :: Show LikePosition where
  show = genericShow

data FilterVal = FilterValStr String | FilterValLike LikePosition String | FilterValUnquotedInt Int | FilterValUnquotedNumber Number
derive instance genericFilterVal :: Generic FilterVal _
instance showFilterVal :: Show FilterVal where
  show = genericShow

data FilterLang = 
    FilterIn (List FilterVal) 
  | FilterEq FilterVal
  | FilterRange FilterVal FilterVal

derive instance genericFilterLang :: Generic FilterLang _
instance showFilterLang :: Show FilterLang where
  show = genericShow


type Filters = Map SqlCol FilterLang

filtersToQueryStringPath :: Filters -> String
filtersToQueryStringPath = toQueryPathString

instance toQueryPathStringFilters :: ToQueryPathString (Map SqlCol FilterLang) where
  toQueryPathString = sqlColMapToQueryPathString langToStr
    where
    langToStr (FilterEq l) = toStr l
    langToStr (FilterIn l) = "(" <> A.intercalate "," (A.fromFoldable $ map toStr l) <> ")"
    langToStr (FilterRange l r) = "R(" <> toStr l <> "," <> toStr r <> ")"

    toStr (FilterValStr s) = s
    toStr (FilterValLike lk s) = 
      case lk of 
        LikeAfter -> s <> "*"
        LikeBefore -> "*" <> s
        LikeBoth -> "*" <> s <> "*"
    toStr (FilterValUnquotedInt s) = toSignedNum s
    toStr (FilterValUnquotedNumber s) = toSignedNum s

    toSignedNum :: ∀ r. Ord r ⇒ Semiring r ⇒ Show r ⇒ Ring r ⇒ r → String
    toSignedNum i = (if i >= zero then "+" else "-") <> show (abs i)


newtype QueryParams d = QueryParams {
  timezone :: Number,
  dateFrom :: d,
  dateTo :: d,
  breakdown :: Breakdown,
  filters :: Filters
}

class ToSqlDateStr v where
  toSqlDateStr :: v -> String

instance stringToSqlDateStr :: ToSqlDateStr String where
  toSqlDateStr = toSqlDateStr <<< unsafePerformEffect <<< JSD.parse

instance jsDateTimeToSqlDateStr :: ToSqlDateStr JSDate where
  toSqlDateStr = unsafePerformEffect <<< JSD.toISOString

readQueryParams :: Foreign -> F (QueryParams String)
readQueryParams value = do
  timezone <- fromMaybe (toNumber 0) <$> (value ! "timezone" ?>>= readNumber)
  dateFrom <- value ! "dateFrom" >>= readString --unsafePerformEffect (JD.toISOString  =<< JD.parse "2018-11-02")
  dateTo <- value ! "dateTo" >>= readString
  breakdown <- unsafeFromForeign <$> (value ! "breakdown")
  filters <- unsafeFromForeign <$> (value ! "filters")
  pure $ QueryParams { timezone, dateFrom, dateTo, breakdown, filters }


---  Sql Template

data LMapType = Simple String | Expr String
instance showLMapType :: Show LMapType where
  show (Simple s) = s
  show (Expr s) = show s

data QueryEngine = PostgreSql | Redshift
derive instance genericQueryEngine :: Generic QueryEngine _
instance showQueryEngine :: Show QueryEngine where
  show = genericShow


newtype QueryOptions = QueryOptions {
  noTimezone :: Boolean,
  tableAlias :: String,
  timeColName :: String,
  fieldMap :: StrMap LMapType,
  casted :: Boolean,
  engine :: QueryEngine
}
derive instance genericQueryOptions :: Generic QueryOptions _
instance showQueryOptions :: Show QueryOptions where
  show = genericShow

readQueryOptions :: Foreign -> F QueryOptions
readQueryOptions value = do
  noTimezone <- fromMaybe false <$> (value ! "noTimezone" ?>>= readBoolean)
  tableAlias <- value ! "tableAlias" >>= readString
  timeColName <- value ! "timeColName" >>= readString
  fieldMap <- unsafeFromForeign <$> (value ! "fieldMap" )
  casted <- fromMaybe false <$> (value ! "casted" ?>>= readBoolean)
  engine <- (\e -> if e == "Redshift" then Redshift else PostgreSql) <$> (value ! "engine" >>= readString)
  pure $ QueryOptions { noTimezone, tableAlias, timeColName, fieldMap, casted, engine }


breakdownToSqlSelect :: forall d. String -> QueryParams d -> QueryOptions -> String
breakdownToSqlSelect indent params@(QueryParams p) options@(QueryOptions q) = 
  "  " <> (intercalate newLine $ map (\(Tuple k _) -> (if q.casted then (alias' <<< dimension) else toSqlFieldIdentifier) k) $ p.breakdown)
  where
    alias' = alias options

    toSqlFieldIdentifier :: SqlCol -> String
    toSqlFieldIdentifier (SqlColNormal c) = defaultCast c
    toSqlFieldIdentifier col@(SqlColJSON c) = c.colName <> "->>" <> "'" <> c.jsonField <> "'" <> " as " <> dimension col

    defaultCast :: String -> String
    defaultCast c = as c $ go c where
      go "hour" = timeDim "hour"
      go "day" = timeDim "day"
      go "week" = timeDim "week"
      go "month" = timeDim "month"
      go "minute" = timeDim "minute"
      go col =
        case fromMaybe (Simple col) (SM.lookup col q.fieldMap) of
          Simple col' -> "coalesce(cast(" <> alias' col' <> " as varchar), 'Unknown')"
          Expr col' -> col'


      as col expr = expr <> " as " <> dimension' col

      dimension' c = "\"d_" <> c <> "\""
      --TODO: definition of timeDim must depend on configuration (context: redshift vs standard postgresql)
      timeDim dim = case q.engine of 
        Redshift   -> "date_trunc('" <> dim <> "', CONVERT_TIMEZONE('UTC', '" <> tz <> "', " <> alias' q.timeColName <> ")) :: timestamp AT TIME ZONE '" <> tz <> "'"
        PostgreSql -> "date_trunc('" <> dim <> "', timezone('" <> tz <> "', " <> alias' q.timeColName <> ")) "
      tz = show $ toNumber(-1) * p.timezone
      -- timezone conversion example:  date_trunc('day', CONVERT_TIMEZONE('UTC', '-8', e.timestamp)) :: timestamp AT TIME ZONE '-8' 

    newLine = "\n" <> indent <> ", "

breakdownToSqlCommaSep :: Maybe QueryOptions -> Breakdown -> String
breakdownToSqlCommaSep moptions = intercalate ", " <<< map (\(Tuple k _) -> alias' (dimension k))
  where
    alias' = case moptions of
      Just options -> alias options
      _ -> id

alias :: QueryOptions -> String -> String
alias (QueryOptions q) col = q.tableAlias <> "." <> col

joinDimensionsToSqlJoin :: forall d. String -> QueryParams d -> QueryOptions -> QueryOptions -> String
joinDimensionsToSqlJoin indent params@(QueryParams p) qLeft qRight = 
  "    " <> (intercalate newLine $ map (\(Tuple k _) -> (alias qLeft <<< dimension) k  <> " = " <> (alias qRight <<< dimension) k) $ p.breakdown)
  where
    newLine = "\n" <> indent <> "AND "

dimension :: SqlCol -> String
dimension col = "\"d_" <> go col <> "\"" where
  go (SqlColNormal c) = c
  go (SqlColJSON c) = c.colName <> "_" <> c.jsonField


filtersToSqlWhere :: forall d. ToSqlDateStr d => String -> QueryParams d -> QueryOptions -> String
filtersToSqlWhere indent params@(QueryParams p) options@(QueryOptions q) = intercalate (newLine <> "AND ") (timeStr:rest)
  where
    alias' col = 
        case fromMaybe (Simple col) (SM.lookup col q.fieldMap) of
          Simple col' -> alias options col'
          Expr col' -> col'

    --alias options
    rest = filtersToSqls params options
    timeStr = "    " <> alias' q.timeColName <> " >= " <> inSq (toSqlDateStr p.dateFrom) <> newLine <> "AND " <> alias' q.timeColName <> " < " <> inSq (toSqlDateStr p.dateTo)
    newLine = "\n" <> indent

filtersToSqlConds :: forall d. ToSqlDateStr d => String -> QueryParams d -> QueryOptions -> String
filtersToSqlConds indent params options = intercalate (newLine <> "AND ") $ filtersToSqls params options
  where
    newLine = "\n" <> indent

filtersToSqls :: forall d. ToSqlDateStr d => QueryParams d -> QueryOptions -> List String
filtersToSqls params@(QueryParams p) options@(QueryOptions q) = L.fromFoldable rest
  where
    alias' (SqlColJSON c) = c.colName <> "->>" <> "'" <> c.jsonField <> "'"
    alias' (SqlColNormal col) = 
        case fromMaybe (Simple col) (SM.lookup col q.fieldMap) of
          Simple col' -> alias options col'
          Expr col' -> col'
    rest = map (\x -> "(" <> x <> ")") $ map (\(Tuple k v) -> filterLangToStr' (alias' k) v) $ toAscArray $ p.filters

    filterLangToStr' :: String -> FilterLang -> String
    filterLangToStr' col (FilterIn vals) = intercalate " OR " $ map ((\v -> col <> v) <<< filterValToStr) vals 
    filterLangToStr' col (FilterEq val) =  col  <> filterValToStr val
    filterLangToStr' col (FilterRange a b) = col <> " >= "  <> filterValToRangeStr a <> " AND " <> col <> " < " <> filterValToRangeStr b

    filterValToStr :: FilterVal -> String
    filterValToStr (FilterValStr s) = " = " <> inSq s
    filterValToStr (FilterValLike lk s) = " LIKE " <> inSq (
        case lk of 
          LikeAfter -> s <> "%"
          LikeBefore -> "%" <> s
          LikeBoth -> "%" <> s <> "%"
        )
    filterValToStr (FilterValUnquotedInt i) = " = " <> show i
    filterValToStr (FilterValUnquotedNumber i) = " = " <> show i

    filterValToRangeStr :: FilterVal -> String
    filterValToRangeStr (FilterValUnquotedInt i) = show i
    filterValToRangeStr (FilterValUnquotedNumber i) = show i
    filterValToRangeStr x = " NOT SUPPORTED " <> show x


inSq :: String -> String
inSq s = "'" <> s <> "'"

tryParse :: forall a. F Foreign -> (Foreign -> F a) -> F (Maybe a)
tryParse v r = v >>= readNullOrUndefined >>= traverse r
infixl 4 tryParse as ?>>=

----
-- Helpers for JavaScript
-- TODO: move this section to its own module

toAscArray :: forall k v. SM.Map k v -> Array (Tuple k v)
toAscArray = SM.toUnfoldable

class ToJSON a where
  toJson :: a -> J.Json

strMapToJson :: ∀ a. ToJSON a ⇒ Map String a → J.Json
strMapToJson = J.fromObject <<< Obj.fromFoldable <<< map (\ (Tuple k v) -> Tuple k (toJson v)) <<< toAscArray

listToJson :: forall v. ToJSON v => List (Tuple SqlCol v) -> J.Json
listToJson = J.fromArray <<< A.fromFoldable <<< map (\(Tuple key value) -> 
    ("key" := sqlColToPath key) ~> 
    ("value" := toJson value) ~> 
    J.jsonEmptyObject
  )
  where
  sqlColToPath (SqlColNormal a) = a
  sqlColToPath (SqlColJSON a) = a.colName <> "." <> a.jsonField

breakdownToJson :: Breakdown -> J.Json
breakdownToJson = listToJson

-- filtersToJson :: Filters -> J.Json
-- filtersToJson = J.fromArray <<< map ?filterLangToJson <<< A.fromFoldable

instance toJsonInt :: ToJSON Int where 
  toJson = J.fromNumber <<< toNumber

continueEither :: forall a b c. (a -> c) -> (b -> c) -> Either a b -> c
continueEither  = either

bimapEither :: forall a b c d. (a -> c) -> (b -> d) -> Either a b -> Either c d
bimapEither  = bimap


partitionEithers :: forall a b. List (Either a b) -> Tuple (List a) (List b)
partitionEithers = foldrDefault (either left right) (Tuple mempty mempty)
 where
  left  a (Tuple l r) = Tuple (a:l) r
  right a (Tuple l r) = Tuple l (a:r)

-- |Turn a list of eithers into an either of lists
concatEithers :: forall a b. List (Either a b) -> Either (List a) (List b)
concatEithers xs =
    case partitionEithers xs of 
      Tuple Nil rs -> Right rs
      Tuple ls _ -> Left ls

arrayToList :: forall a. Array a -> List a
arrayToList = L.fromFoldable

listToArray :: forall a. List a -> Array a
listToArray = A.fromFoldable

sequenceEithers :: forall a b. Array (Either a b) -> Either a (Array b)
sequenceEithers = sequence