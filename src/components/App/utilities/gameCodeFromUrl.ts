export const gameCodeFromUrl = () =>
  // strip off leading #
  window.location.hash.substring(1);
