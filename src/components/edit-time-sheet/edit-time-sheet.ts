import { Component } from '@angular/core';
import { NavParams, AlertController, LoadingController, ViewController, Loading } from 'ionic-angular';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';

@Component({
  selector: 'edit-time-sheet',
  templateUrl: 'edit-time-sheet.html'
})
export class EditTimeSheetComponent {

  title: string;
  timeSheet: TimeSheet;
  dateTimeSheet: Date;
  registerId: number;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController, 
    public registerService: RegisterService,
    public navParams: NavParams) {

      console.log('chegou');
      

    this.title = this.navParams.get("title");
    this.timeSheet = this.navParams.get("timeSheet");
    this.dateTimeSheet = this.timeSheet.hour;
    
    this.registerId = this.timeSheet.registerId;
    console.log("HOUR:::> "+ this.timeSheet.registerId);
  }

  onSave(): void {
    console.log("saving: "+this.dateTimeSheet);
    
    let loading = this.showLoading('Saving!');

    let hours = this.dateTimeSheet.toString().split(':')[0];
    let minutes = this.dateTimeSheet.toString().split(':')[1];
    let newDateTimeSheet = new Date(this.timeSheet.hour.getFullYear(), this.timeSheet.hour.getMonth(), this.timeSheet.hour.getDate(), parseInt(hours), parseInt(minutes));

    this.timeSheet.hour = newDateTimeSheet;
    this.registerService.updateTimeSheet(this.timeSheet)
      .then((result: boolean)=>{
        if(result) {
        //TODO: check if it is necessary to refresh the list  
        }
        loading.dismiss();
        this.voltar();
      });
  }

  onDelete(): void {
    this.alertCtrl.create({
      title: `Do you want to delete this timesheet?`,
      buttons:[
        {
          text: 'Yes',
          handler: () => {
            let loading: Loading = this.showLoading(`Deleting hour ${new Date(this.timeSheet.hour)}...`);
            this.registerService.deleteTimeSheet(this.timeSheet.id)
            .then((deleted: boolean)=> {
              if(deleted) {
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
    this.navParams.get('parentPage').loadTimeSheets(this.registerId);
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
