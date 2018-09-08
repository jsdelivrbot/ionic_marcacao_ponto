export class TimeSheet{

    constructor(
        public position: number, //First, Second, Third, Fourth for one day at work
        public hour: Date,
        public registerId?: number, //id do registro a que esse timesheet esta vinculado
        public id?: number,
    ){}

}