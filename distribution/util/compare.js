const compare = (a, b) => {
    if (a.freq > b.freq) {
      return -1;
    } else if (a.freq < b.freq) {
      return 1;
    } else {
      return 0;
    }
};

module.exports = {compare};