import { Component } from '@angular/core';
import { AlertController, AlertOptions, ItemSliding, NavController, Loading, LoadingController } from 'ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';

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

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public registerService: RegisterService
    ) {}

  ionViewDidLoad() {
    this.registerService.getAllTimeSheet(new Date())
      .then((timeSheet: TimeSheet[])=>{
        this.timeSheet = timeSheet;
        console.log('buscou as timesheets');
        
      });
  }

  /**
   * Cria uma nova jornada de trabalho e vincula ela a 'uma jornada', onde as marcacoes serao feitas
   * apos criar a jornada deve habilitar a criacao de marcacoes
   */
  createRegister() {
    this.register = new Register(new Date().toDateString());
    this.registerService.create(this.register)
      .then((register: Register)=> {
        this.register = register;
        console.log('crou um novo registro com id: '+this.register.id);        
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

  onCreate(){
    let loading: Loading = this.showLoading(`Saving ${this.newDate} time...`);
    console.log("settime: "+this.newDate);
    let newTimeSheet: TimeSheet = new TimeSheet(this.timeSheet.length, this.newDate.toString(), this.register.id);
    this.registerService.createTimeSheet(newTimeSheet)
      .then((result:TimeSheet)=> {
        this.timeSheet.push(result);
        loading.dismiss();
      });
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
                contextTimeSheet = new TimeSheet(this.timeSheet.length, data.newHour, this.register.id);
                this.registerService.createTimeSheet(contextTimeSheet)
                .then((result:TimeSheet)=> {
                  this.timeSheet.unshift(result);
                  loading.dismiss();
                });
                break;
              case 'update':
                options.timeSheet.hour = data.newHour;
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
      alertOptions.inputs[0]['value'] = options.timeSheet.hour; 
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
}
