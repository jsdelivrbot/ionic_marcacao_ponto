import { TimeSheet } from "./TimeSheet.model";

export class Register {

    constructor(
        public currentDate: string,
        public lunch?: number, //time for lunch
        public timeSheet?: TimeSheet,
        public id?: number,
    ){}

}