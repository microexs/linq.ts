import List from './list'

export default class Enumerable {
  /**
   * Generates a sequence of integral numbers within a specified range.
   */
  public static RANGE(start: number, count: number): List<number> {
    let result = new List<number>()
    while (count--) {
      result.add(start++)
    }
    return result
  }

  /**
   * Generates a sequence that contains one repeated value.
   */
  public static REPEAT<T>(element: T, count: number): List<T> {
    let result = new List<T>()
    while (count--) {
      result.add(element)
    }
    return result
  }
}
