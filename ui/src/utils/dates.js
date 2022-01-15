import moment from "moment";

export const GetThisMonday = () => {
  var now = new Date();
  var currentDay = now.getDay() === 0 ? 6 : now.getDay() -1;
  var mondayDate = moment().subtract(currentDay, 'days').format("YYYY-MM-DD");
  return mondayDate;
}