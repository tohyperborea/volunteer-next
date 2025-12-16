export const getEventDateRangeDisplayText = ({ event }: { event: EventInfo }): string => {
  const startYear = String(event.startDate.getFullYear());
  const endYear = String(event.endDate.getFullYear());
  const startMonth = new Date(event.startDate).toLocaleString('default', { month: 'short' });
  const endMonth = new Date(event.endDate).toLocaleString('default', { month: 'short' });
  const startDay = event.startDate.getDate();
  const endDay = event.endDate.getDate();

  if (startYear === endYear && startMonth === endMonth)
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
  if (startYear === endYear)
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
};
