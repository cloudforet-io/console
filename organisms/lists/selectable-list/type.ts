import { ThemeType } from '@/components/molecules/selectable-item/type';

export type MapperKeyType = string | ((key: string) => string);
interface MapperType {
    key?: MapperKeyType;
    iconUrl?: MapperKeyType;
    title?: MapperKeyType;
    color?: MapperKeyType;
}

export interface SelectableListProps<item=any> {
    items: item[];
    mapper: MapperType;
    multiSelectable?: boolean;
    mustSelect?: boolean;
    defaultIcon?: string;
    loading?: boolean;
    theme: ThemeType;
    selectedIndexes: number[];
    disabledIndexes: number[];
}
