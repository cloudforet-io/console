import {
    LabelBullet,
} from '@amcharts/amcharts4/charts';
import { DynamicField } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const getLabelBullet = (nameOptions: DynamicField, valueOptions: DynamicField): LabelBullet => {
    const labelBullet = new LabelBullet();
    labelBullet.locationY = 0.5;
    labelBullet.locationX = 0.5;
    labelBullet.label.text = `[font-size: 1rem; bold]{${nameOptions.key}}[/]
[font-size: 1.125rem; text-align: center]{${valueOptions.key}}`;

    return labelBullet;
};
