module Server.QueryTemplateParser 
where
import Control.Alt ((<|>))
import Effect.Aff as Aff
import Data.Array as A
import Data.Either (Either(..))
import Data.Foldable (class Foldable, foldMap)
import Data.Generic.Rep (class Generic)
import Data.Generic.Rep.Show (genericShow)
import Data.Identity (Identity)
import Data.Int (toNumber)
import Data.List (List(..), head, (:))
import Data.Map (Map, fromFoldable, lookup, empty)
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.String as S
import Data.Tuple (Tuple(..))
import Effect (Effect)
import Effect.Console (log)
import Prelude (class Functor, class Monad, class Show, Unit, bind, const, map, pure, show, ($), ($>), (*>), (<$>), (<*), (<*>), (<<<), (<>), (=<<), (==), (>>=), (||))
import Query.Parser.UrlQueryParser (breakdownP, filtersP)
import Query.Parser.Utils (betweenLax, lax, propTuple, queryParser)
import Query.Types (class ToSqlDateStr, LMapType(..), QueryOptions(..), QueryParams(..), breakdownToSqlCommaSep, breakdownToSqlSelect, filtersToSqlConds, filtersToSqlWhere, joinDimensionsToSqlJoin, toSqlDateStr, QueryEngine (..))
import Text.Parsing.Parser (ParseError, ParserT, fail, runParser)
import Text.Parsing.Parser.Combinators (between, lookAhead, manyTill, try)
import Text.Parsing.Parser.String (class StringLike, anyChar, eof, string, whiteSpace)

data Lang = 
    LBool Boolean
  | LString String
  | LMap (Map String LMapType)

instance showLang :: Show Lang where
  show (LBool b) = "LBool " <> show b
  show (LString s) = "LString " <> show s
  show (LMap m) = "LMap " <> show m

langBool :: Lang -> Maybe Boolean
langBool (LBool b) = Just b
langBool _ = Nothing

langString :: Lang -> Maybe String
langString (LString b) = Just b
langString _ = Nothing

langMap :: Lang -> Maybe (Map String LMapType)
langMap (LMap b) = Just b
langMap _ = Nothing

laxBraces :: forall a s m. Monad m => StringLike s => ParserT s m a -> ParserT s m a
laxBraces ps = betweenLax (string "{") (string "}") ps

laxParens :: forall a s m. Monad m => StringLike s => ParserT s m a -> ParserT s m a
laxParens ps = betweenLax (string "(") (string ")") ps


jsonP :: ParserT String Identity (Map String Lang)
jsonP = fromFoldable <$> laxBraces ps where
  ps = queryParser.commaSep (propTuple queryParser.identifier ((LString <$> stringP) <|> boolP <|> mapP))

squoteP :: forall t2 t3. StringLike t3 => Monad t2 => ParserT t3 t2 String
squoteP = string "'"

dquoteP :: forall t2 t3. StringLike t3 => Monad t2 => ParserT t3 t2 String
dquoteP = string "\""

stringP :: ParserT String Identity String
stringP = between squoteP squoteP queryParser.identifier <|> between dquoteP dquoteP queryParser.identifier

anyStringP :: forall t556 t557. Monad t557 => StringLike t556 => ParserT t556 t557 String
anyStringP = between dquoteP dquoteP (toString <$> manyTill anyChar (lookAhead dquoteP ))

boolP :: forall m s. Functor m => Monad m => StringLike s => ParserT s m Lang
boolP = LBool <$> ((string "false" *> pure false) <|> (string "true" *> pure true))

mapP :: ParserT String Identity Lang
mapP = LMap <<< fromFoldable <$> laxBraces ps where
  ps = queryParser.commaSep oneTuple
  oneTuple =
    propTuple 
      key
      (  Simple <$> stringP 
      <|> Expr <$>  (string "E" *> anyStringP)
      )
  key = stringP <|> queryParser.identifier

queryOptionsFromLang :: forall s m. Monad m => Map String Lang -> ParserT s m QueryOptions
queryOptionsFromLang lang = do
  noTimezone <- opt' "Boolean" (LBool false) langBool "noTimezone"
  tableAlias <- mand "String" langString "tableAlias" 
  timeColName <- opt' "String" (LString "timestamp") langString "timeColName" 
  fieldMap <- opt' "Map String" (LMap (empty :: Map String LMapType)) langMap "fieldMap"
  casted <- opt' "Boolean" (LBool false) langBool "casted"
  engine <-  (\e -> if e == "Redshift" then Redshift else PostgreSql) <$> opt' "String" (LString "engine") langString "engine"
  pure $ QueryOptions { noTimezone, tableAlias, timeColName, fieldMap, casted, engine }
  
  where
    lookup' c = maybe (fail $ c <> " field is mandatory") pure (lookup c lang)

    opt' :: forall a. String -> Lang -> (Lang -> Maybe a) -> String -> ParserT s m a
    opt' = opt lang

    mand ty un c = toErr ("Expected " <> ty <> " for " <> c) un =<< lookup' c

toErr :: forall i a s m. Monad m => String -> (i -> Maybe a) -> i -> ParserT s m a
toErr err f v = maybe (fail err) pure  (f v)

opt :: forall m s a i. Monad m => Map String i -> String -> i -> (i -> Maybe a) -> String -> ParserT s m a
opt lang ty def un c = toErr ("Expected " <> ty <> " for " <> c) un $ fromMaybe def (lookup c lang)

data FuncCall args = FuncCall String (List args)
derive instance genericFuncCall :: Generic (FuncCall args) _
instance showFuncCall :: Show args => Show (FuncCall args)where
  show = genericShow

funcCallP :: ParserT String Identity (FuncCall QueryOptions)
funcCallP = FuncCall <$> lax queryParser.identifier <*> args where
  args = map (const Nil) (string "()") <|> laxParens (queryParser.commaSep (jsonP >>= queryOptionsFromLang))

data TemplateFunc = Select QueryOptions | DateFrom | DateTo | Where QueryOptions | Filters QueryOptions | GroupBy | OrderBy (Maybe QueryOptions) | JoinDimensions QueryOptions QueryOptions
derive instance genericTemplateFunc :: Generic TemplateFunc _
instance showTemplateFunc :: Show TemplateFunc where
  show = genericShow


toTemplateFunc :: forall s m. Monad m => FuncCall QueryOptions -> ParserT s m TemplateFunc
toTemplateFunc = go where
  go o@(FuncCall "select" _) = handleArgs1 Select o
  go o@(FuncCall "dateFrom" Nil) = pure DateFrom 
  go o@(FuncCall "dateTo" Nil) = pure DateTo 
  go o@(FuncCall "where" _) = handleArgs1 Where o
  go (FuncCall "groupBy" Nil) = pure GroupBy
  go (FuncCall "orderBy" mArgs) = pure $ OrderBy (head mArgs)
  go o@(FuncCall "joinDimensions" _) = handleArgs2 JoinDimensions o
  go o@(FuncCall "filters" _) = handleArgs1 Filters o
  go (FuncCall name args) = fail $ "Either this function does not exist (" <> name <> ") or its arguments are invalid."

  handleArgs1 f (FuncCall name margs) = case margs of
    Nil -> fail $ "Expected one argument to " <> name <> " function"
    (a:Nil) -> pure $ f a
    _ -> fail $ "Expected one argument to " <> name <> " function but got more"

  handleArgs2 f (FuncCall name margs) = case margs of
    Nil -> fail $ "Expected two argument to " <> name <> " function"
    (a:b:Nil) -> pure $ f a b
    _ -> fail $ "Expected two argument to " <> name <> " function but got more"


parseTemplateFunction :: String -> Either ParseError TemplateFunc
parseTemplateFunction str = runParser str (funcCallP >>= toTemplateFunc)

---

data TemplateToken = TextToken String | FuncToken TemplateFunc
derive instance genericTemplateToken :: Generic TemplateToken _
instance showTemplateToken :: Show TemplateToken where
  show = genericShow

sqlTemplate :: ParserT String Identity (List TemplateToken)
sqlTemplate = (eof' $> (TextToken "" : Nil)) <|> go where
  go = do
    a <- (TextToken <<< toString <$>  manyTill anyChar (try $ string "{$" <|> eof'))
    b <- (eof $> Nothing) <|> ((Just <$> (funcCallP >>= toTemplateFunc)) <* (whiteSpace *> string "$}"))
    case b of
      Nothing -> pure (a : Nil)
      Just b' -> do
        rest <- sqlTemplate
        pure (a : FuncToken b' : rest)

eof' :: forall m s. Functor m  => Monad m => StringLike s => ParserT s m String
eof' = pure "" <$> eof

toString :: forall f. Foldable f => f Char -> String
toString = foldMap (S.singleton <<< S.codePointFromChar)

parseSqlTemplate :: String -> Either ParseError (List TemplateToken)
parseSqlTemplate str = runParser str sqlTemplate

formatSql :: QueryParams -> List TemplateToken -> String
formatSql qParams@(QueryParams params) tokens = go "" tokens where
  go _ Nil = ""
  go indent (t : rest) = 
    let (Tuple s i) = toStr indent t
    in s <> go i rest

  indentation = fromMaybe "" <<< map (S.takeWhile (\c -> c == S.codePointFromChar ' ' || c == S.codePointFromChar '\t')) <<< lastLine
  lastLine = A.last <<< S.split (S.Pattern "\n") 

  toStr :: String -> TemplateToken -> Tuple String String
  toStr _ (TextToken s) = Tuple s (indentation s)
  toStr indent (FuncToken ft) = Tuple (toSql indent ft) indent

  toSql :: String -> TemplateFunc -> String
  toSql indent (Select args) = "SELECT\n" <> indent <> breakdownToSqlSelect indent qParams args
  toSql _ GroupBy = "GROUP BY " <> breakdownToSqlCommaSep Nothing breakdown
  toSql _ (OrderBy args) = "ORDER BY " <> breakdownToSqlCommaSep args breakdown
  toSql _ DateFrom = inSQ $ toSqlDateStr params.dateFrom
  toSql _ DateTo = inSQ $ toSqlDateStr params.dateTo
  toSql indent (Where args) = "WHERE\n" <> indent <> filtersToSqlWhere indent qParams args
  toSql indent (Filters args) = filtersToSqlConds indent qParams args
  toSql indent (JoinDimensions argsL argsR) = joinDimensionsToSqlJoin indent qParams argsL argsR

  inSQ s = "'" <> s <> "'"

  breakdown = params.breakdown

{--}
-- Example: 

someSql :: String
someSql = """
With Views as (
  select
    {$ select({
      noTimezone: false,
      tableAlias: 'us',
      timeColName: 'creation_timestamp',
      fieldMap: { publisher_id: 'pubid' }
    }) $}
    , sum(case when us.impression > 0 or us.redirect > 0 then 1 else 0 end) :: float as views
    , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
    , sum(case when us.pixel > 0 or us.delayed_pixel > 0 then 1 else 0 end) :: float as pixels
    , sum(case when us.firstbilling > 0 then 1 else 0 end) :: float as firstbillings
  where
    {$ where({tableAlias: 'us', timeColName: 'creation_timestamp', fieldMap: {'publisher_id': 'pubid'}}) $}

  {$ groupBy() $}
)

SELECT select V.*, sum(S.cpa) as cost 
FROM Views as V
LEFT JOIN Sales as S ON
  {$ joinDimensions({tableAlias: 'V'}, {tableAlias: 'S'}) $}
{$ orderBy({tableAlias: 'V'}) $}
"""


-- main1 :: forall d. ToSqlDateStr d => QueryParams d -> String
-- main1 params  = case runParser someSql sqlTemplate of
--   Left e -> show e
--   Right ls -> formatSql params ls

main :: Effect Unit
main = 
  let filtersStr = "country_code:[ar,za,th,my,mx,om,qa],affiliate_id:POM*,publisher_id:[*1292*,122*],screen_width:(+200,+500),offer:+144,has_os:+1"
      breakdownStr = "affiliate_id:(sales:A),publisher_id,day:(views:A,[sales:10,views:100])"
  in case doTemplate 
    filtersStr
    breakdownStr
    (toNumber 2)
    "2018-03-01"
    "2018-04-01"
    someSql
  of
    Left e -> log $ show e
    Right sql -> log sql

-- /sessions/+2.0/2018-10-01/2018-10-15/country_code:(QA,OM),affiliate_id:POM/operator_code,day:(views:A,views:100,sales:10),country_code:(sales:A)
doTemplate :: String -> String -> Number -> String -> String -> String -> Either ParseError String
doTemplate filtersStr breakdownStr timezone dateFrom dateTo template = do
  breakdown <- runParser breakdownStr breakdownP
  filters <- runParser filtersStr filtersP
  let params = QueryParams { timezone: timezone, dateFrom: dateFrom, dateTo: dateTo, breakdown, filters }
  tokens <- runParser template sqlTemplate
  pure $ formatSql params tokens
--}

doTemplateStringDates :: String -> String -> Number -> String -> String -> String -> Aff.Aff String
doTemplateStringDates filtersStr breakdownStr timezone dateFrom dateTo template = 
  case doTemplate filtersStr breakdownStr timezone dateFrom dateTo template of
    Left e -> Aff.throwError (Aff.error $ show e)
    Right r -> pure r