// @flow

// Convert bandwidth (in Byte) to human readable string
export const bandwidthFormatter = (b: number, digits?: number = 2): string => {
  if (b < 1024) {
    return b + ' B';
  }
  else if (b < 1024 * 1024) {
    return (b / 1024).toFixed(digits) + ' KB';
  }
  else if (b < 1024 * 1024 * 1024) {
    return (b / 1024 / 1024).toFixed(digits) + ' MB';
  }
  else {
    return (b / 1024 / 1024 / 1024).toFixed(digits) + ' GB';
  }
};
