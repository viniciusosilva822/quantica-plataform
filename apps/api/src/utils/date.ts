import dayjs from 'dayjs';

export const dayKey = (d: Date | string) => dayjs(d).startOf('day').toDate();
export const todayKey = () => dayjs().startOf('day').toDate();
export const isoDay = (d: Date | string) => dayjs(d).format('YYYY-MM-DD');
