export type ChannelState = 'ENABLED' | 'DISABLED';

export type ChannelScheduleDayOfWeek = 'MON'|'TUE'|'WED'|'THU'|'FRI'|'SAT'|'SUN';
export type ChannelSchedule = {
    day_of_week?: ChannelScheduleDayOfWeek[];
    start_hour?: number;
    end_hour?: number;
};
