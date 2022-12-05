import type { WidgetThemeOption } from '@/services/dashboards/dashboard-detail/lib/type';

const WIDGET_THEME = ['violet', 'blue', 'coral', 'yellow', 'gray', 'green', 'indigo', 'peacock'] as const;
const WIDGET_THEME_LEN = WIDGET_THEME.length;

// ['violet' | 'blue' | 'coral' ... | undefined]
export type WidgetThemeAssignedList = Array<typeof WIDGET_THEME[number] | undefined>;

// function for circular array
const circular = (n: number): number => (n % WIDGET_THEME_LEN + WIDGET_THEME_LEN) % WIDGET_THEME_LEN;

export const widgetThemeAssigner = (widgetThemeOptionList: Array<WidgetThemeOption>): WidgetThemeAssignedList => {
    let themeIndex = 0;
    const widgetThemeAssignedList: WidgetThemeAssignedList = [];

    widgetThemeOptionList.forEach((option: WidgetThemeOption) => {
        if (option.inherit && typeof option.inherit_count === 'number') {
            widgetThemeAssignedList.push(WIDGET_THEME[circular(themeIndex)]);
            themeIndex += option.inherit_count;
        }
        if (option.inherit && typeof option.inherit_count === 'undefined') {
            widgetThemeAssignedList.push(WIDGET_THEME[circular(themeIndex)]);
            themeIndex += 5;
        }
        if (!option.inherit) {
            widgetThemeAssignedList.push(undefined);
        }
    });

    return widgetThemeAssignedList;
};
