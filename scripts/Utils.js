class Utils {
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
