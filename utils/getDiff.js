module.exports = function getDiff(oldData, newData) {
  const diff = {};

  for (let key in newData) {
    if (oldData[key] !== newData[key]) {
      diff[key] = { old: oldData[key], new: newData[key] };
    }
  }

  return diff;
};
