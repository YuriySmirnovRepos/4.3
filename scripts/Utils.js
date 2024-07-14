/**
 * A utility class for debouncing functions.
 *
 * @class Utils
 */
class Utils {
  /**
   * Debounces a function.
   *
   * @static
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay in milliseconds.
   * @param {Object} [thisArg=null] - The value to use as `this` when calling the debounced function.
   * @return {Function} The debounced function.
   */
  static debounce(func, delay, thisArg = null) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        thisArg ? func.apply(thisArg, args) : func(...args);
      }, delay);
    };
  }
}

export default Utils;
