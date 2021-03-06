import {CONST_EXPR, isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {
  Map,
  MapWrapper,
  List,
  ListWrapper,
  isListLikeIterable
} from 'angular2/src/facade/collection';

function paramParser(rawParams: string = ''): Map<string, List<string>> {
  var map: Map<string, List<string>> = new Map();
  if (rawParams.length > 0) {
    var params: List<string> = StringWrapper.split(rawParams, new RegExp('&'));
    ListWrapper.forEach(params, (param: string) => {
      var split: List<string> = StringWrapper.split(param, new RegExp('='));
      var key = ListWrapper.get(split, 0);
      var val = ListWrapper.get(split, 1);
      var list = isPresent(map.get(key)) ? map.get(key) : [];
      list.push(val);
      map.set(key, list);
    });
  }
  return map;
}

// TODO(caitp): This really should not be needed. Issue with ts2dart.
export const URLSearchParamsUnionFixer: string = CONST_EXPR("UnionFixer");

/**
 * Map-like representation of url search parameters, based on
 * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard,
 * with several extensions for merging URLSearchParams objects:
 *   - setAll()
 *   - appendAll()
 *   - replaceAll()
 */
export class URLSearchParams {
  paramsMap: Map<string, List<string>>;
  constructor(public rawParams: string = '') { this.paramsMap = paramParser(rawParams); }

  clone(): URLSearchParams {
    var clone = new URLSearchParams();
    clone.appendAll(this);
    return clone;
  }

  has(param: string): boolean { return this.paramsMap.has(param); }

  get(param: string): string {
    var storedParam = this.paramsMap.get(param);
    if (isListLikeIterable(storedParam)) {
      return ListWrapper.first(storedParam);
    } else {
      return null;
    }
  }

  getAll(param: string): List<string> {
    var mapParam = this.paramsMap.get(param);
    return isPresent(mapParam) ? mapParam : [];
  }

  set(param: string, val: string) {
    var mapParam = this.paramsMap.get(param);
    var list = isPresent(mapParam) ? mapParam : [];
    ListWrapper.clear(list);
    list.push(val);
    this.paramsMap.set(param, list);
  }

  // A merge operation
  // For each name-values pair in `searchParams`, perform `set(name, values[0])`
  //
  // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  setAll(searchParams: URLSearchParams) {
    MapWrapper.forEach(searchParams.paramsMap, (value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      ListWrapper.clear(list);
      list.push(value[0]);
      this.paramsMap.set(param, list);
    });
  }

  append(param: string, val: string): void {
    var mapParam = this.paramsMap.get(param);
    var list = isPresent(mapParam) ? mapParam : [];
    list.push(val);
    this.paramsMap.set(param, list);
  }

  // A merge operation
  // For each name-values pair in `searchParams`, perform `append(name, value)`
  // for each value in `values`.
  //
  // E.g: "a=[1,2], c=[8]" + "a=[3,4], b=[7]" = "a=[1,2,3,4], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  appendAll(searchParams: URLSearchParams) {
    MapWrapper.forEach(searchParams.paramsMap, (value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      for (var i = 0; i < value.length; ++i) {
        list.push(value[i]);
      }
      this.paramsMap.set(param, list);
    });
  }


  // A merge operation
  // For each name-values pair in `searchParams`, perform `delete(name)`,
  // followed by `set(name, values)`
  //
  // E.g: "a=[1,2,3], c=[8]" + "a=[4,5,6], b=[7]" = "a=[4,5,6], c=[8], b=[7]"
  //
  // TODO(@caitp): document this better
  replaceAll(searchParams: URLSearchParams) {
    MapWrapper.forEach(searchParams.paramsMap, (value, param) => {
      var mapParam = this.paramsMap.get(param);
      var list = isPresent(mapParam) ? mapParam : [];
      ListWrapper.clear(list);
      for (var i = 0; i < value.length; ++i) {
        list.push(value[i]);
      }
      this.paramsMap.set(param, list);
    });
  }

  toString(): string {
    var paramsList = [];
    MapWrapper.forEach(this.paramsMap, (values, k) => {
      ListWrapper.forEach(values, v => { paramsList.push(k + '=' + v); });
    });
    return ListWrapper.join(paramsList, '&');
  }

  delete (param: string): void { MapWrapper.delete(this.paramsMap, param); }
}
