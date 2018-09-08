import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';
import { TimeSheetDetailsComponent } from '../../components/time-sheet-details/time-sheet-details';

@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {

  register: Register[] = []; //jornadas
  timeSheet: TimeSheet[] = []; //maximo de 4 marcacoes
  filterInitialDate: Date;
  filterFinalDate: Date;
  
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public registerService: RegisterService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReportPage');

    this.onRefresh();
  }

  onRefresh() {
    this.registerService.getAll()
    .then((result:Register[]) => {
      this.register = result;
    });

    this.registerService.getAllTimeSheet()
      .then((result: TimeSheet[])=>{
        this.timeSheet = result;
      });
  }

  onFilter(){
    console.log(this.filterInitialDate);
    console.log(this.filterFinalDate);


    let actualDate = new Date();

    if(this.filterInitialDate == null){
      this.filterInitialDate = actualDate;
    } 
    if(this.filterFinalDate == null){
      this.filterFinalDate = actualDate;
    }

    this.registerService.getAll(new Date(this.filterInitialDate), new Date(this.filterFinalDate))
      .then((result) => {
        this.register = result;        
      });
  }

  onDetailTimeSheet(registerId){
    console.log('Chegou: '+ registerId);

    let register: Register = this.register.filter(x=> x.id == registerId)[0];

    let timeSheets: TimeSheet[];
    

    

    this.registerService.getAllTimeSheet(registerId).then((result: TimeSheet[])=> {
      timeSheets = result;      
      console.log(result);
      
    });

    this.presentResultModal("Timesheet Details", register, timeSheets);
    
  }

    /** Abre o modal de resultado */
  presentResultModal(title: string, register: Register, timeSheets: TimeSheet[]) {
    let resultModal = this.modalCtrl.create(TimeSheetDetailsComponent, 
      { 
        title: title,
        register: register,
        timeSheets: timeSheets
       });
       resultModal.onDidDismiss(data => {
      //console.log(data);
    });
    resultModal.present();
  }
}
