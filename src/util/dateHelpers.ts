export const areDatesInSameWeek = (date1: Date, date2: Date) => {
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek1 = date1.getDay();
  const dayOfWeek2 = date2.getDay();

  // Get the date of the month
  const dayOfMonth1 = date1.getDate();
  const dayOfMonth2 = date2.getDate();

  // Calculate the difference in days between the two dates
  const dayDiff = Math.abs(dayOfMonth1 - dayOfMonth2);

  // If the days are within a week and have the same day of the week, they are in the same week
  return (
    dayDiff <= 6 &&
    (dayOfWeek1 <= dayOfWeek2
      ? dayOfWeek1 + dayDiff >= dayOfWeek2
      : dayOfWeek2 + dayDiff >= dayOfWeek1)
  );
};

export const getFormattedDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
