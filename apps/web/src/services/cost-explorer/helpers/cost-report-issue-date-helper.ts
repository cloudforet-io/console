import dayjs from 'dayjs';

export const getUpcomingIssueDate = (enableLastDay: boolean, _issueDay?: number): string => {
    const today = dayjs.utc();
    const __issueDay: number = enableLastDay ? today.endOf('month').date() : _issueDay ?? 10;

    // 1. case for today(2024-01-15) is before issue day(31) -> 2024-01-31
    if (Number(today.format('D')) < __issueDay) {
        return today.date(__issueDay).format('YYYY-MM-DD');
    }

    // 2. case for next month(2024-02) has less days than issue day(31) -> 2024-02-29
    const nextMonth = today.add(1, 'month');
    if (nextMonth.endOf('month').date() < __issueDay) {
        return nextMonth.endOf('month').format('YYYY-MM-DD');
    }

    // 3. case for next month(2024-02) has equal or more days than issue day(10) -> 2024-02-10
    return nextMonth.date(__issueDay).format('YYYY-MM-DD');
};


export const getUpcomingConfirmationDate = (enableAdjustments: boolean, upcomingReportDate: string, adjustmentPeriod: number): string => {
    if (!enableAdjustments || !upcomingReportDate) return '-';
    const reportDate = dayjs.utc(upcomingReportDate);
    const confirmDate = reportDate.add(adjustmentPeriod, 'day');
    return confirmDate.format('YYYY-MM-DD');
};
