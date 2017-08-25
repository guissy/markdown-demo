module.exports = function (source) {
  return source.replace(/(:global\s+)?(\.ant-[\w-]+)(?!\))/g, ':global($2)');
};
