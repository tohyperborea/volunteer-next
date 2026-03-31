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

export const getListByDate = <T>(items: T[], getDate: (item: T) => Date): Record<string, T[]> => {
  const sortedItems = [...items].sort((a, b) => getDate(a).getTime() - getDate(b).getTime());
  return sortedItems.reduce(
    (acc, item) => {
      const date = getDate(item).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
};
