import { TimeSheet } from "./TimeSheet.model";

export class Register {

    constructor(
        public currentDate: string,
        public hoursWorked: string, //horas trabalhadas neste dia
        public lunch?: number, //time for lunch
        //public timeSheet?: number,//TimeSheet,
        public id?: number,
    ){}

}