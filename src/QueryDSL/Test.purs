module Test where

import Prelude

import Data.Enum (class BoundedEnum, class Enum, upFromIncluding)
import Data.Generic.Rep as G
import Data.Generic.Rep.Bounded as GBounded
import Data.Generic.Rep.Enum as GEnum
import Data.Generic.Rep.Eq as GEq
import Data.Generic.Rep.Ord as GOrd
import Data.Generic.Rep.Show as GShow



data Option a = None | Some a
derive instance genericOption :: G.Generic (Option a) _
instance eqOption :: Eq a => Eq (Option a) where
  eq x y = GEq.genericEq x y
instance ordOption :: Ord a => Ord (Option a) where
  compare x y = GOrd.genericCompare x y
instance showOption :: Show a => Show (Option a) where
  show x = GShow.genericShow x
instance boundedOption :: Bounded a => Bounded (Option a) where
  bottom = GBounded.genericBottom
  top = GBounded.genericTop
instance enumOption :: (Bounded a, Enum a) => Enum (Option a) where
  pred = GEnum.genericPred
  succ = GEnum.genericSucc
instance boundedEnumOption :: BoundedEnum a => BoundedEnum (Option a) where
  cardinality = GEnum.genericCardinality
  toEnum = GEnum.genericToEnum
  fromEnum = GEnum.genericFromEnum


data Colors = Red | Blue | Green
derive instance genericColors :: G.Generic Colors _
instance eqColors :: Eq Colors where
  eq x y = GEq.genericEq x y
instance ordColors :: Ord Colors where
  compare x y = GOrd.genericCompare x y
instance showColors ::  Show Colors where
  show x = GShow.genericShow x
instance boundedColors :: Bounded Colors where
  bottom = GBounded.genericBottom
  top = GBounded.genericTop
instance enumColors ::  Enum Colors where
  pred = GEnum.genericPred
  succ = GEnum.genericSucc
instance boundedEnumColors :: BoundedEnum Colors where
  cardinality = GEnum.genericCardinality
  toEnum = GEnum.genericToEnum
  fromEnum = GEnum.genericFromEnum

main = upFromIncluding (bottom  :: Option Colors) :: Array (Option Colors)