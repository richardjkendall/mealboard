import moment from "moment";

export const GetThisMonday = () => {
  var now = new Date();
  var currentDay = now.getDay() === 0 ? 6 : now.getDay() -1;
  var mondayDate = moment().subtract(currentDay, 'days').format("YYYY-MM-DD");
  return mondayDate;
}

export const GetRelativeWeek = (weekStartDate) => {
  let thisMonday = GetThisMonday();
  let daysDiff = moment(weekStartDate).diff(moment(thisMonday), 'days');
  console.log("GetRelativeWeek(): days diff", daysDiff);
  let weekDiff = daysDiff / 7;
  console.log("GetRelativeWeek(): weeks diff", weekDiff);
  if(weekDiff === 0) {
    return "This week";
  } else if(weekDiff === 1) {
    return "Next week";
  } else if(weekDiff === -1) {
    return "Last week";
  } else {
    return `${Math.abs(weekDiff)} weeks ${weekDiff > 0 ? "time" : "ago"} (${moment(weekStartDate).format("DD MMM")})`;
  }
}
