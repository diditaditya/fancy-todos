let helper = {
  convertDate: function(oriDate) {
    let fullDate = new Date(oriDate);
    let year = fullDate.getFullYear();
    let month = fullDate.getMonth()+1;
    let date = fullDate.getDate();
    let hour = fullDate.getHours();
    let minute = fullDate.getMinutes();
    return {
      year: year,
      month: month,
      date: date,
      hour: hour,
      minute: minute
    };
  }
}

module.exports = helper;
