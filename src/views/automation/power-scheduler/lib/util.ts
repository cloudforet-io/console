import dayjs from 'dayjs';
import {
    Rule, RoutineRule, TicketRule, RULE_TYPE,
} from '@/views/automation/power-scheduler/type';


export const changeTimezoneToUTC = (rule: RoutineRule[] | TicketRule[], ruleType: RULE_TYPE, timezone: string) => {
    let tmpRule = {} as Rule;
    const newRule = [] as RoutineRule[] | TicketRule[];
    if (ruleType === RULE_TYPE.routine) {
        tmpRule = {
            sun: [],
            mon: [],
            tue: [],
            wed: [],
            thu: [],
            fri: [],
            sat: [],
        };
        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        let offsetHours = 0;
        if (timezone !== 'UTC') offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
        rule.forEach((r) => {
            r.times.forEach((time) => {
                let newTime = time - offsetHours;
                if (newTime > 0) {
                    tmpRule[r.day].push(newTime);
                } else {
                    newTime += 24;
                    const weekIdx = weekdays.indexOf(r.day);
                    if (weekIdx === 0) {
                        tmpRule[weekdays[6]].push(newTime);
                    } else {
                        tmpRule[weekdays[weekIdx - 1]].push(newTime);
                    }
                }
            });
        });
        Object.entries(tmpRule).forEach(([day, times]) => {
            newRule.push({ day, times });
        });
    } else if (ruleType === RULE_TYPE.ticket) {
        rule.forEach((r) => {
            r.times.forEach((time) => {
                let utcRawDate;
                if (timezone === 'UTC') {
                    utcRawDate = dayjs(`${r.date} ${time}:00`);
                } else {
                    utcRawDate = dayjs(`${r.date} ${time}:00`).utc();
                }
                const utcDate = utcRawDate.format('YYYY-MM-DD');
                const utcHour = Number(utcRawDate.format('H'));
                if (utcDate in tmpRule) {
                    tmpRule[utcDate].push(utcHour);
                } else {
                    tmpRule[utcDate] = [utcHour];
                }
            });
        });
        Object.entries(tmpRule).forEach(([date, times]) => {
            newRule.push({ date, times });
        });
    }
    return newRule;
};

export const changeTimezoneToLocal = (rule: RoutineRule[] | TicketRule[], ruleType: RULE_TYPE, timezone: string) => {
    if (timezone === 'UTC') return rule;

    let tmpRule = {} as Rule;
    const newRule = [] as RoutineRule[] | TicketRule[];
    if (ruleType === RULE_TYPE.routine) {
        tmpRule = {
            sun: [],
            mon: [],
            tue: [],
            wed: [],
            thu: [],
            fri: [],
            sat: [],
        };
        const offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        rule.forEach((r) => {
            if (r.times) {
                r.times.forEach((time) => {
                    let newTime = time + offsetHours;
                    if (newTime < 24) {
                        tmpRule[r.day].push(newTime);
                    } else {
                        newTime -= 24;
                        const weekIdx = weekdays.indexOf(r.day);
                        if (weekIdx === 6) {
                            tmpRule[weekdays[0]].push(newTime);
                        } else {
                            tmpRule[weekdays[weekIdx + 1]].push(newTime);
                        }
                    }
                });
            }
        });
        Object.entries(tmpRule).forEach(([day, times]) => {
            newRule.push({ day, times });
        });
    } else if (ruleType === RULE_TYPE.ticket) {
        rule.forEach((r) => {
            r.times.forEach((time) => {
                const utcDate = dayjs.utc(`${r.date} ${time}:00`);
                const localDate = utcDate.tz(timezone).format('YYYY-MM-DD');
                const localHour = Number(utcDate.tz(timezone).format('H'));
                if (localDate in tmpRule) {
                    tmpRule[localDate].push(localHour);
                } else {
                    tmpRule[localDate] = [localHour];
                }
            });
        });
        Object.entries(tmpRule).forEach(([date, times]) => {
            newRule.push({ date, times });
        });
    }

    return newRule;
};
