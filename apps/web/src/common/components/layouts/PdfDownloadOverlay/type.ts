import type { Table } from 'pdfmake/interfaces';

type ItemType = 'data-table'|'image';


export interface Item {
    type?: ItemType; // default: 'image'
    element?: HTMLElement;
    tableData?: Pick<Table, 'body' | 'widths'>;
}
