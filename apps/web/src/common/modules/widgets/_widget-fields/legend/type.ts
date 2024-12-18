export interface LegendValue {
    toggleValue: boolean;
    position?: 'right'|'bottom'|'top'|'left';
}

export interface LegendOptions { // toggle button
    default?: boolean;
    showPositionField?: boolean;
}
