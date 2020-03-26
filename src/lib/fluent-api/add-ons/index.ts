import Excel from '@/lib/fluent-api/add-ons/excel';
import {Service} from "@/lib/fluent-api";

export default class AddOns extends Service {
    protected name = 'add-ons'

    excel() { return new Excel(this.name); }

}
