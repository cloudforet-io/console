export type ChannelState = 'ENABLED' | 'DISABLED';

export type ChannelSchedule = {
    day_of_week: 'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'|'SUN'[]
    start_hour: number
    end_hour: number
};
