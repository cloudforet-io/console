import dayjs from 'dayjs';

export const timezoneToUtcFormatter = (hour, timezone) => {
    let offsetHours = 0;
    if (timezone !== 'UTC') offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
    const newTime = hour - offsetHours;
    if (newTime >= 24) return newTime - 24;
    if (newTime < 0) return newTime + 24;

    return newTime;
};

export const utcToTimezoneFormatter = (hour, timezone) => {
    let offsetHours = 0;
    if (timezone !== 'UTC') offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
    const newTime = hour + offsetHours;
    if (newTime >= 24) return newTime - 24;
    if (newTime < 0) return newTime + 24;

    return newTime;
};
