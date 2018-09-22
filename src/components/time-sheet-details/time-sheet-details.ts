import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController, Loading, LoadingController } from '../../../node_modules/ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';

@Component({
  selector: 'time-sheet-details',
  templateUrl: 'time-sheet-details.html'
})
export class TimeSheetDetailsComponent {

  title: string;
  register: Register;
  timeSheets: TimeSheet[];

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    public viewCtrl: ViewController, 
    public registerService: RegisterService) {
    this.title = this.navParams.get("title");
    this.register = this.navParams.get("register");

    this.timeSheets = this.navParams.get("timeSheets");

    console.log(this.timeSheets);
    
  }

  onDelete():void {
    this.alertCtrl.create({
      title: `Do you want to delete '${this.register.currentDate}' register?`,
      buttons:[
        {
          text: 'Yes',
          handler: () => {
            let loading: Loading = this.showLoading(`Deleting hour ${this.register.currentDate}...`);
            this.registerService.deleteRegister(this.register.id)
            .then((deleted: boolean)=>{
              if(deleted){
                this.voltar();
              }
              loading.dismiss();
            });
          }
        },
        'No'
      ]
    }).present();
  } 

  voltar(): void {
    this.viewCtrl.dismiss();
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
