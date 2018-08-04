import { TimeSheet } from "./TimeSheet.model";

export class Register {

    constructor(
        public id: number,
        public currentDate: string,
        public timeSheet: TimeSheet,
        public lunch: number //time for lunch
    ){}

}