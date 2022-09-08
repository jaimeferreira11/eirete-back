const dayjs = require("dayjs");

const formatDate = (value = string) => {
  return dayjs(value).format("YYYY-MM-DD");
};

const toDate = (value = string) => {
  return dayjs(value).format();
};

module.exports = {
  formatDate,
  toDate,
};
