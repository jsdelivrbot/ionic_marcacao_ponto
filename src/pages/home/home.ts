import { Component } from '@angular/core';
import { AlertController, AlertOptions, ItemSliding, NavController, Loading, LoadingController, ToastController } from 'ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  /**
   * Cada Register eh uma Jornada
   * Cada Jornada tem ateh 4 marcacoes, que sao as TimeSheets
   * Ao iniciar jornada cria um Register na base de dados e deixa a jornada em aberto
   * Vai inserindo as TimeSheets referenciando esse Register
   * Ao fechar Jornada, calcula o tempo de almoco e limpa tela para proximo dia 
   */
  
  newDate: Date;
  register: Register; //uma jornada
  timeSheet: TimeSheet[] = []; //maximo de 4 marcacoes
  lunchTime: number;
  newRegisterDate: Date;
  getActualHour: boolean = true;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public datePipe: DatePipe,
    public navCtrl: NavController,
    public registerService: RegisterService,
    private toastCtrl: ToastController
    ) {}

  ionViewDidLoad() {

    this.registerService.getByDate(new Date())
      .then((result: Register)=>{
        this.register = result;
      });

    if(this.register != null){
      this.loadTimeSheets(this.register.id);
    }
  }

  loadTimeSheets(registerId){
    this.registerService.getAllTimeSheet(registerId)
    .then((timeSheet: TimeSheet[])=>{
      console.log('buscou as timesheets :: '+timeSheet.length);
      this.timeSheet = timeSheet;
      
    });
  }

  /**
   * Cria uma nova jornada de trabalho e vincula ela a 'uma jornada', onde as marcacoes serao feitas
   * apos criar a jornada deve habilitar a criacao de marcacoes
   */
  createRegister() {
    if (this.newRegisterDate == null) {
      this.newRegisterDate = new Date();      
    }
    
    console.log("DATA: "+this.newRegisterDate.toString());
    this.register = new Register(new Date(this.newRegisterDate), "0");
    this.registerService.create(this.register)
      .then((register: Register)=> {
        this.register = register;
        console.log('crou um novo registro com id: '+this.register.id);        
      });
  }

  onSetTime(){
    let loading: Loading = this.showLoading(`Saving ${this.newDate} time...`);
    if(this.newDate == null){
      this.newDate = new Date();
    }
    console.log("settime: "+this.newDate); 

    let newTimeSheet: TimeSheet = new TimeSheet(this.timeSheet.length, this.newDate, this.register.id);
    this.registerService.createTimeSheet(newTimeSheet)
      .then((result:TimeSheet)=> {
        console.log('inseriu a timesheet: '+result.id);
        
        //need to do that to solve a bug, but I need to think in a better solution for this:
        if(!this.getActualHour){
          let hoursSplit = result.hour.toString().split(':');
          let dateTest = new Date();
          dateTest.setHours(parseInt(hoursSplit[0]));
          dateTest.setMinutes(parseInt(hoursSplit[1]));
          result.hour = dateTest;
        }

        this.timeSheet.push(result);
        loading.dismiss();
      });
  }

  //Returns the lunch time in minutes
  calculateLunchTime(initial:Date, final:Date) : number {
    /*calculateLunchTime(){
      let initial = new Date(2018, 8, null, 11, 0);
      let final = new Date(2018, 8, null, 12, 40);
    */
      let initialDate = this.datePipe.transform(initial, 'H:m').split(':');
      let finalDate = this.datePipe.transform(final, 'H:m').split(':');
  
      let initialHour = parseInt(initialDate[0]);
      let initialMinute = parseInt(initialDate[1]);
      let finalHour = parseInt(finalDate[0]);
      let finalMinute = parseInt(finalDate[1]);

      if(initialHour == 0){
        initialHour = 12;
      }
      if(finalHour == 0){
        finalHour = 12;
      }
  
      let differenceMinutes, differenceHours = 0;
      
      if (finalHour == initialHour){
        
        differenceMinutes = finalMinute - initialMinute;
      } else if((finalHour - initialHour) == 1 && initialMinute > finalMinute){
        //eg.: 11:50 ate 12:40
        let minutosFaltantesParaFecharUmaHora = 60 - initialMinute; // 10
        differenceMinutes = minutosFaltantesParaFecharUmaHora + finalMinute; // 50
      } else if(initialMinute > finalMinute) {
        //eg.: 11:50 ate 12:40
        let minutosFaltantesParaFecharUmaHora = 60 - initialMinute; // 10
        differenceMinutes = minutosFaltantesParaFecharUmaHora + finalMinute; // 40
        differenceHours = finalHour - initialHour - 1;
      } else {
        differenceHours = finalHour - initialHour;
        differenceMinutes = finalMinute - initialMinute;
      }
      
      //  console.log('Difference Minutes: '+differenceMinutes);
      //  console.log('Difference Hours: '+differenceHours);
      
      return (differenceHours * 60) + differenceMinutes;
  }

  //Calcula as horas trabalhadas
  calculateHoursWorked(initial:Date, final:Date) {
    console.log(initial);
    console.log(final);
    

      let initialDate = this.datePipe.transform(initial, 'H:m').split(':');
      let finalDate =  this.datePipe.transform(final, 'H:m').split(':');
  
      let initialHour = parseInt(initialDate[0]);
      let initialMinute = parseInt(initialDate[1]);
      let finalHour = parseInt(finalDate[0]);
      let finalMinute = parseInt(finalDate[1]);

     if(initialHour == 0){
       initialHour = 12;
     }
     if(finalHour == 0){
       finalHour = 12;
     }
  
      let hoursWorked = 0.0;
      
      if (finalHour == initialHour){
        hoursWorked = (finalMinute - initialMinute) / 100; //se for 30 minutos tem que guardar 0.3
      } else if((finalHour - initialHour) == 1 && initialMinute > finalMinute){
        //eg.: 11:50 ate 12:40
        let minutosFaltantesParaFecharUmaHora = 60 - initialMinute; // 10
        hoursWorked = (minutosFaltantesParaFecharUmaHora + finalMinute) / 100; // 0.50
      } else if(initialMinute > finalMinute) {
        //eg.: 11:50 ate 12:40
        let minutosFaltantesParaFecharUmaHora = 60 - initialMinute; // 10
        hoursWorked = (minutosFaltantesParaFecharUmaHora + finalMinute) / 100; // 0.40
        hoursWorked += finalHour - initialHour - 1;
      } else {
        hoursWorked = finalHour - initialHour;
        hoursWorked += (finalMinute - initialMinute) / 100;
      }
      
        console.log('Hours Worked: '+hoursWorked);
      
      return hoursWorked;//(differenceHours * 60) + differenceMinutes;
  }
    
  //Message on the bottom to informe users that the register was created successfully
  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      showCloseButton: true,
      position: 'bottom'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
  
    toast.present();
  }

  renewVariables() {
    this.newDate = null;
    this.register = null;
    this.timeSheet = []; 
    this.lunchTime = 0;
    this.newRegisterDate = null;
  }

  onEndJourney() {
    let lunchTime = this.lunchTime;   
    let hoursWorked = 0;

    if (this.timeSheet.length == 2 && this.lunchTime == null) {
      this.showMessage("Ops!", "Need to informe the lunch time.");
      return;
    }
    if (this.timeSheet.length == 3){
      this.showMessage("Ops!", "Need to informe 2 or 4 timesheet a day.");
      return;
    }
    
    if (this.timeSheet.length == 2) {
      lunchTime = this.lunchTime;
      hoursWorked = this.calculateHoursWorked(new Date(this.timeSheet[0].hour), new Date(this.timeSheet[1].hour));
    } if (this.timeSheet.length > 2) {
      lunchTime = this.calculateLunchTime(new Date(this.timeSheet[1].hour), new Date(this.timeSheet[2].hour));
      hoursWorked = this.calculateHoursWorked(new Date(this.timeSheet[0].hour), new Date(this.timeSheet[3].hour));
    }    

    //lunchtime esta sempre em minutos
    this.register.lunch = lunchTime;

    //calculate how much time worked today
    hoursWorked -= (lunchTime / 100); //20 minutos devem ser removidos como 0.2

    this.register.hoursWorked = hoursWorked.toString();

    this.registerService.update(this.register).then((result)=> {
      if (result) {
        this.presentToast('Timesheet was added successfully!');
      }

      this.renewVariables();
    });
  }

  onSave(type: string, item?: ItemSliding, timeSheet?: TimeSheet):void{
    let title: string = type.charAt(0).toUpperCase() + type.substr(1);

    this.showAlert({
      itemSliding: item,
      title: `${title} hour`,
      type: type,
      timeSheet: timeSheet
    });
  }

  onDelete(timeSheet: TimeSheet):void{
    this.alertCtrl.create({
      title: `Do you want to delete '${timeSheet.hour}' hour?`,
      buttons:[
        {
          text: 'Yes',
          handler: () => {
            let loading: Loading = this.showLoading(`Deleting hour ${timeSheet.hour}...`);

            this.registerService.deleteTimeSheet(timeSheet.id)
            .then((deleted: boolean)=>{
              if(deleted){
                this.timeSheet.splice(this.timeSheet.indexOf(timeSheet), 1);
              }
              loading.dismiss();
            });
          }
        },
        'No'
      ]
    }).present();
  } 

  private showAlert(options: {itemSliding?: ItemSliding, title: string, type: string, timeSheet?: TimeSheet}):void{
    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          name: 'newHour',
          placeholder: 'New hour'
        }
      ],
      buttons: [
        'Cancel',
        {
          text: 'Save',
          handler: (data) => {

            let loading: Loading = this.showLoading(`Saving ${data.newHour} time...`);
            let contextTimeSheet: TimeSheet;
            switch (options.type) {
              case 'create':
                contextTimeSheet = new TimeSheet(this.timeSheet.length, new Date(data.newHour), this.register.id);
                this.registerService.createTimeSheet(contextTimeSheet)
                .then((result:TimeSheet)=> {
                  this.timeSheet.unshift(result);
                  loading.dismiss();
                });
                break;
              case 'update':
                options.timeSheet.hour = new Date(data.newHour);
                contextTimeSheet = options.timeSheet;
                this.registerService.updateTimeSheet(contextTimeSheet)
                .then((result: boolean)=>{
                  if(result) {
                  //TODO: check if it is necessary to refresh the list  
                  }
                  loading.dismiss();
                });
                break;
            }
            if(options.itemSliding){
              options.itemSliding.close();
            }
          }
        }
      ]
    };

    if(options.type === 'update'){
      alertOptions.inputs[0]['value'] = options.timeSheet.hour.toString(); 
    }

    this.alertCtrl.create(alertOptions).present();
  }

  private showLoading(message?:string): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: message || 'Please wait...'
    });

    loading.present();
    return loading;
  }

  showMessage(title, subTitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
  }
}