import {CmsField} from 'netlify-cms-core';
import {ID_FIELD, NAME_FIELD, PUBLISHED_FIELD} from './common';
import {COLLECTIONS_FIELD} from './relations';
import {EXERCISES_FIELD} from './relations';

export const CATEGORY_FIELD: Array<CmsField> = [
  ID_FIELD,
  NAME_FIELD,
  PUBLISHED_FIELD,
  COLLECTIONS_FIELD,
  EXERCISES_FIELD,
];
