import {Service, ServiceResources} from "@/lib/fluent-api/toolset";
import Excel from '@/lib/fluent-api/add-ons/excel';

export default class AddOns extends Service implements ServiceResources<'excel'>  {
    protected name = 'add-ons';

    excel() { return new Excel(this.name); }

}
