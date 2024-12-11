import { ref } from 'vue';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    describe, it, expect, vi,
} from 'vitest';

import { useTimezoneDate } from '@/common/composables/timezone-date';

// Configure dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Mock userStore
vi.mock('@/store/user/user-store', () => ({
    useUserStore: () => ({
        state: {
            timezone: 'Asia/Seoul',
        },
    }),
}));

describe('useTimezoneDate', () => {
    it('should return the correct timezone date when date is provided', () => {
        const dateRef = ref('2024-12-09T00:00:00Z');
        const { timezoneDate, getTimezoneDate } = useTimezoneDate({ date: dateRef });

        // Validate: getTimezoneDate function
        const expectedDate = dayjs.utc(dateRef.value).tz('Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
        expect(getTimezoneDate(dateRef.value)).toBe(expectedDate);

        // Validate: computed timezoneDate
        expect(timezoneDate?.value).toBe(expectedDate);
    });

    it('should return undefined for timezoneDate when date is not provided', () => {
        const { timezoneDate, getTimezoneDate } = useTimezoneDate();

        // Validate: timezoneDate should be undefined
        expect(timezoneDate).toBeUndefined();

        // Validate: getTimezoneDate should still work
        const inputDate = '2024-12-09T00:00:00Z';
        const expectedDate = dayjs.utc(inputDate).tz('Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
        expect(getTimezoneDate(inputDate)).toBe(expectedDate);
    });

    it('should update timezoneDate when date value changes', async () => {
        const dateRef = ref('2024-12-09T00:00:00Z');
        const { timezoneDate } = useTimezoneDate({ date: dateRef });

        // Validate initial value
        const initialExpectedDate = dayjs.utc(dateRef.value).tz('Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
        expect(timezoneDate?.value).toBe(initialExpectedDate);

        // Change the date value
        dateRef.value = '2024-12-10T12:00:00Z';

        // Validate updated value
        const updatedExpectedDate = dayjs.utc(dateRef.value).tz('Asia/Seoul').format('YYYY/MM/DD HH:mm:ss');
        expect(timezoneDate?.value).toBe(updatedExpectedDate);
    });
});
