/* eslint-disable no-undef */
window.matchMedia =
  window.matchMedia ||
  (() => {
    return { matches: false, addListener: () => {}, removeListener: () => {} };
  });