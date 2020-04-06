import pie, { PieTheme } from '@/components/organisms/charts/dynamic-chart/themes/pie-chart';
import bar, { BarTheme } from '@/components/organisms/charts/dynamic-chart/themes/bar-chart';
import line, { LineTheme } from './line-chart';

export interface ChartThemes {
    line: LineTheme;
    pie: PieTheme;
    bar: BarTheme;
    horizontalBar: BarTheme;
    doughnut: PieTheme;
}

export default {
    line,
    pie,
    bar,
    horizontalBar: bar,
    doughnut: pie,
} as ChartThemes;
