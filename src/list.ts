import { composeComparers, equal, isObj, keyComparer, negate } from './helpers';

class List<T> {
  // tslint:disable-next-line: variable-name
  protected _elements: T[];

  /**
   * Defaults the elements of the list
   */
  constructor(elements: T[] = []) {
    this._elements = elements;
  }

  /**
   * Adds an object to the end of the List<T>.
   */
  public add(element: T): void {
    this._elements.push(element);
  }

  /**
   * Adds the elements of the specified collection to the end of the List<T>.
   */
  public addRange(elements: T[]): void {
    this._elements.push(...elements);
  }

  /**
   * Applies an accumulator function over a sequence.
   */
  public aggregate<U>(
    accumulator: (accum: U, value?: T, index?: number, list?: T[]) => any,
    initialValue?: U
  ): any {
    return this._elements.reduce(accumulator, initialValue);
  }

  /**
   * Determines whether all elements of a sequence satisfy a condition.
   */
  public all(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): boolean {
    return this._elements.every(predicate);
  }

  /**
   * Determines whether a sequence contains any elements.
   */
  // tslint:disable-next-line: no-reserved-keywords
  public any(): boolean;
  // tslint:disable-next-line: no-reserved-keywords
  public any(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): boolean;
  // tslint:disable-next-line: no-reserved-keywords
  public any(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): boolean {
    return predicate
      ? this._elements.some(predicate)
      : this._elements.length > 0;
  }

  /**
   * Computes the average of a sequence of number values that are obtained by invoking
   * a transform function on each element of the input sequence.
   */
  public average(): number;
  public average(
    transform: (value?: T, index?: number, list?: T[]) => any
  ): number;
  public average(
    transform?: (value?: T, index?: number, list?: T[]) => any
  ): number {
    return this.sum(transform) / this.count(transform);
  }

  /**
   * Casts the elements of a sequence to the specified type.
   */
  public cast<U>(): List<U> {
    return new List<U>(<any>this._elements);
  }

  /**
   * Concatenates two sequences.
   */
  public concat(list: List<T>): List<T> {
    return new List<T>(this._elements.concat(list.toArray()));
  }

  /**
   * Determines whether an element is in the List<T>.
   */
  public contains(element: T): boolean {
    return this._elements.some(x => x === element);
  }

  /**
   * Returns the number of elements in a sequence.
   */
  public count(): number;
  public count(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): number;
  public count(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): number {
    return predicate ? this.where(predicate).count() : this._elements.length;
  }

  /**
   * Returns the elements of the specified sequence or the type parameter's default value
   * in a singleton collection if the sequence is empty.
   */
  public defaultIfEmpty(defaultValue?: T): List<T> {
    return this.count() ? this : new List<T>([defaultValue]);
  }

  /**
   * Returns distinct elements from a sequence by using the default equality comparer to compare values.
   */
  public distinct(): List<T> {
    return this.where(
      (value, index, iter) =>
        (isObj(value)
          ? iter.findIndex(obj => equal(obj, value))
          : iter.indexOf(value)) === index
    );
  }

  /**
   * Returns distinct elements from a sequence according to specified key selector.
   */
  public distinctBy(keySelector: (key: T) => string | number): List<T> {
    const groups = this.groupBy(keySelector);

    return Object.keys(groups).reduce((res, key) => {
      res.add(groups[key][0]);

      return res;
    },                                new List<T>());
  }

  /**
   * Returns the element at a specified index in a sequence.
   */
  public elementAt(index: number): T {
    if (index < this.count()) {
      return this._elements[index];
    } else {
      const MSG =
        'ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.';
      throw new Error(MSG);
    }
  }

  /**
   * Returns the element at a specified index in a sequence or a default value if the index is out of range.
   */
  public elementAtOrDefault(index: number): T {
    return this.elementAt(index) || undefined;
  }

  /**
   * Produces the set difference of two sequences by using the default equality comparer to compare values.
   */
  public except(source: List<T>): List<T> {
    return this.where(x => !source.contains(x));
  }

  /**
   * Returns the first element of a sequence.
   */
  public first(): T;
  public first(predicate: (value?: T, index?: number, list?: T[]) => boolean): T;
  public first(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.count()) {
      return predicate ? this.where(predicate).first() : this._elements[0];
    } else {
      throw new Error(
        'InvalidOperationException: The source sequence is empty.'
      );
    }
  }

  /**
   * Returns the first element of a sequence, or a default value if the sequence contains no elements.
   */
  public firstOrDefault(): T;
  public firstOrDefault(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): T;
  public firstOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.count(predicate) ? this.first(predicate) : undefined;
  }

  /**
   * Performs the specified action on each element of the List<T>.
   */
  public forEach(action: (value?: T, index?: number, list?: T[]) => any): void {
    this._elements.forEach(action);
  }

  /**
   * Groups the elements of a sequence according to a specified key selector function.
   */
  public groupBy<TResult = T>(
    grouper: (key: T) => string | number,
    mapper: (element: T) => TResult = val => <TResult>(<any>val)
  ): { [key: string]: TResult[] } {
    const initialValue: { [key: string]: TResult[] } = {};

    return this.aggregate((ac, v) => {
      const key = grouper(v);
      const existingGroup = ac[key];
      const mappedValue = mapper(v);
      if (existingGroup) {
        existingGroup.push(mappedValue);
      } else {
        ac[key] = [mappedValue];
      }

      return ac;
    },                    initialValue);
  }

  /**
   * Correlates the elements of two sequences based on equality of keys and groups the results.
   * The default equality comparer is used to compare keys.
   */
  public groupJoin<U>(
    list: List<U>,
    key1: (k: T) => any,
    key2: (k: U) => any,
    result: (first: T, second: List<U>) => any
  ): List<any> {
    return this.select((x, y) =>
      result(x, list.where(z => key1(x) === key2(z)))
    );
  }

  /**
   * Returns the index of the first occurence of an element in the List.
   */
  public indexOf(element: T): number {
    return this._elements.indexOf(element);
  }

  /**
   * Inserts an element into the List<T> at the specified index.
   */
  public insert(index: number, element: T): void | Error {
    if (index < 0 || index > this._elements.length) {
      throw new Error('Index is out of range.');
    }

    this._elements.splice(index, 0, element);
  }

  /**
   * Produces the set intersection of two sequences by using the default equality comparer to compare values.
   */
  public intersect(source: List<T>): List<T> {
    return this.where(x => source.contains(x));
  }

  /**
   * Correlates the elements of two sequences based on matching keys. The default equality comparer is used to compare keys.
   */
  public join<U>(
    list: List<U>,
    key1: (key: T) => any,
    key2: (key: U) => any,
    result: (first: T, second: U) => any
  ): List<any> {
    return this.selectMany(x =>
      list.where(y => key2(y) === key1(x)).select(z => result(x, z))
    );
  }

  /**
   * Returns the last element of a sequence.
   */
  public last(): T;
  public last(predicate: (value?: T, index?: number, list?: T[]) => boolean): T;
  public last(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.count()) {
      return predicate
        ? this.where(predicate).last()
        : this._elements[this.count() - 1];
    } else {
      throw Error('InvalidOperationException: The source sequence is empty.');
    }
  }

  /**
   * Returns the last element of a sequence, or a default value if the sequence contains no elements.
   */
  public lastOrDefault(): T;
  public lastOrDefault(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): T;
  public lastOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.count(predicate) ? this.last(predicate) : undefined;
  }

  /**
   * Returns the maximum value in a generic sequence.
   */
  public max(): number;
  public max(selector: (value: T, index: number, array: T[]) => number): number;
  public max(
    selector?: (value: T, index: number, array: T[]) => number
  ): number {
    const id = x => x;

    return Math.max(...this._elements.map(selector || id));
  }

  /**
   * Returns the minimum value in a generic sequence.
   */
  public min(): number;
  public min(selector: (value: T, index: number, array: T[]) => number): number;
  public min(
    selector?: (value: T, index: number, array: T[]) => number
  ): number {
    const id = x => x;

    return Math.min(...this._elements.map(selector || id));
  }

  /**
   * Filters the elements of a sequence based on a specified type.
   */
  public ofType<U>($type: any): List<U> {
    let typeName;
    switch ($type) {
      case Number:
        typeName = typeof 0;
        break;
      case String:
        typeName = typeof '';
        break;
      case Boolean:
        typeName = typeof true;
        break;
      case Function:
        // tslint:disable-next-line: no-function-expression
        typeName = typeof function () { }; // tslint:disable-line no-empty
        break;
      default:
        typeName = undefined;
    }

    return typeName === undefined
      ? this.where(x => x instanceof $type).cast<U>()
      : this.where(x => typeof x === typeName).cast<U>();
  }

  /**
   * Sorts the elements of a sequence in ascending order according to a key.
   */
  public orderBy(
    keySelector: (key: T) => any,
    comparer = keyComparer(keySelector, false)
  ): List<T> {
    return new OrderedList<T>(this._elements, comparer);
  }

  /**
   * Sorts the elements of a sequence in descending order according to a key.
   */
  public orderByDescending(
    keySelector: (key: T) => any,
    comparer = keyComparer(keySelector, true)
  ): List<T> {
    return new OrderedList<T>(this._elements, comparer);
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   */
  public thenBy(keySelector: (key: T) => any): List<T> {
    return this.orderBy(keySelector);
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in descending order, according to a key.
   */
  public thenByDescending(keySelector: (key: T) => any): List<T> {
    return this.orderByDescending(keySelector);
  }

  /**
   * Removes the first occurrence of a specific object from the List<T>.
   */
  public remove(element: T): boolean {
    if (this.indexOf(element) !== -1) {
      this.removeAt(this.indexOf(element));

      return true;
    } else {
      return false;
    }
  }

  /**
   * Removes all the elements that match the conditions defined by the specified predicate.
   */
  public removeAll(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): List<T> {
    return this.where(negate(predicate));
  }

  /**
   * Removes the element at the specified index of the List<T>.
   */
  public removeAt(index: number): void {
    this._elements.splice(index, 1);
  }

  /**
   * Reverses the order of the elements in the entire List<T>.
   */
  public reverse(): List<T> {
    return new List<T>(this._elements.reverse());
  }

  /**
   * Projects each element of a sequence into a new form.
   */
  public select<TOut>(
    selector: (element: T, index: number) => TOut
  ): List<TOut> {
    return new List<TOut>(this._elements.map(selector));
  }

  /**
   * Projects each element of a sequence to a List<any> and flattens the resulting sequences into one sequence.
   */
  public selectMany<TOut extends List<any>>(
    selector: (element: T, index: number) => TOut
  ): TOut {
    return this.aggregate(
      (ac, v, i) => {
        ac.addRange(
          this.select(selector)
            .elementAt(i)
            .toArray()
        );

        return ac;
      },
      new List<TOut>()
    );
  }

  /**
   * Determines whether two sequences are equal by comparing the elements by using the default equality comparer for their type.
   */
  public sequenceEqual(list: List<T>): boolean {
    return !!this._elements.reduce(
      (x, y, z) => (list._elements[z] === y ? x : undefined)
    );
  }

  /**
   * Returns the only element of a sequence, and throws an exception if there is not exactly one element in the sequence.
   */
  public single(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    if (this.count(predicate) !== 1) {
      throw new Error('The collection does not contain exactly one element.');
    } else {
      return this.first(predicate);
    }
  }

  /**
   * Returns the only element of a sequence, or a default value if the sequence is empty;
   * this method throws an exception if there is more than one element in the sequence.
   */
  public singleOrDefault(
    predicate?: (value?: T, index?: number, list?: T[]) => boolean
  ): T {
    return this.count(predicate) ? this.single(predicate) : undefined;
  }

  /**
   * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
   */
  public skip(amount: number): List<T> {
    return new List<T>(this._elements.slice(Math.max(0, amount)));
  }

  /**
   * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
   */
  public skipWhile(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): List<T> {
    return this.skip(
      this.aggregate(
        (ac, val) => (predicate(this.elementAt(ac)) ? ++ac : ac),
        0
      )
    );
  }

  /**
   * Computes the sum of the sequence of number values that are obtained by invoking
   * a transform function on each element of the input sequence.
   */
  public sum(): number;
  public sum(
    transform: (value?: T, index?: number, list?: T[]) => number
  ): number;
  public sum(
    transform?: (value?: T, index?: number, list?: T[]) => number
  ): number {
    return transform
      ? this.select(transform).sum()
      : this.aggregate((ac, v) => (ac += +v), 0);
  }

  /**
   * Returns a specified number of contiguous elements from the start of a sequence.
   */
  public take(amount: number): List<T> {
    return new List<T>(this._elements.slice(0, Math.max(0, amount)));
  }

  /**
   * Returns elements from a sequence as long as a specified condition is true.
   */
  public takeWhile(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): List<T> {
    return this.take(
      this.aggregate(
        (ac, val) => (predicate(this.elementAt(ac)) ? ++ac : ac),
        0
      )
    );
  }

  /**
   * Copies the elements of the List<T> to a new array.
   */
  public toArray(): T[] {
    return this._elements;
  }

  /**
   * Creates a Dictionary<TKey, TValue> from a List<T> according to a specified key selector function.
   */
  public toDictionary<TKey>(
    key: (key: T) => TKey
  ): List<{ Key: TKey; Value: T }>;
  public toDictionary<TKey, TValue>(
    key: (key: T) => TKey,
    value: (value: T) => TValue
  ): List<{ Key: TKey; Value: T | TValue }>;
  public toDictionary<TKey, TValue>(
    key: (key: T) => TKey,
    value?: (value: T) => TValue
  ): List<{ Key: TKey; Value: T | TValue }> {
    return this.aggregate((dicc, v, i) => {
      dicc[
        this.select(key)
          .elementAt(i)
          .toString()
      ] = value ? this.select(value).elementAt(i) : v;
      dicc.add({
        Key: this.select(key).elementAt(i),
        Value: value ? this.select(value).elementAt(i) : v
      });

      return dicc;
    },                    new List<{ Key: TKey; Value: T | TValue }>());
  }

  /**
   * Creates a List<T> from an Enumerable.List<T>.
   */
  public toList(): List<T> {
    return this;
  }

  /**
   * Creates a Lookup<TKey, TElement> from an IEnumerable<T> according to specified key selector and element selector functions.
   */
  public toLookup<TResult>(
    keySelector: (key: T) => string | number,
    elementSelector: (element: T) => TResult
  ): { [key: string]: TResult[] } {
    return this.groupBy(keySelector, elementSelector);
  }

  /**
   * Produces the set union of two sequences by using the default equality comparer.
   */
  public union(list: List<T>): List<T> {
    return this.concat(list).distinct();
  }

  /**
   * Filters a sequence of values based on a predicate.
   */
  public where(
    predicate: (value?: T, index?: number, list?: T[]) => boolean
  ): List<T> {
    return new List<T>(this._elements.filter(predicate));
  }

  /**
   * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
   */
  public zip<U, TOut>(
    list: List<U>,
    result: (first: T, second: U) => TOut
  ): List<TOut> {
    return list.count() < this.count()
      ? list.select((x, y) => result(this.elementAt(y), x))
      : this.select((x, y) => result(x, list.elementAt(y)));
  }
}

/**
 * Represents a sorted sequence. The methods of this class are implemented by using deferred execution.
 * The immediate return value is an object that stores all the information that is required to perform the action.
 * The query represented by this method is not executed until the object is enumerated either by
 * calling its ToDictionary, ToLookup, ToList or ToArray methods
 */
class OrderedList<T> extends List<T> {
  constructor(elements: T[], private comparer: (a: T, b: T) => number) {
    super(elements);
    this._elements.sort(this.comparer);
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in ascending order according to a key.
   * @override
   */
  public thenBy(keySelector: (key: T) => any): List<T> {
    return new OrderedList(
      this._elements,
      composeComparers(this.comparer, keyComparer(keySelector, false))
    );
  }

  /**
   * Performs a subsequent ordering of the elements in a sequence in descending order, according to a key.
   * @override
   */
  public thenByDescending(keySelector: (key: T) => any): List<T> {
    return new OrderedList(
      this._elements,
      composeComparers(this.comparer, keyComparer(keySelector, true))
    );
  }
}

export default List;
