import { Util } from '@/lib/global-util';

export const timestampFormatter = value => Util.methods.getDatefromTimeStamp(value.seconds, localStorage.getItem('timezone'));
