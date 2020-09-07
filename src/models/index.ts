/* eslint-disable camelcase */
export interface Tags {
    [key: string]: string|number|boolean;
}

export interface TimeStamp {
    seconds: string;
    nanos?: number;
}
