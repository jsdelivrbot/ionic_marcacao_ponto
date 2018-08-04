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
  
  newDate: Date;
  timeSheet: TimeSheet[] = [
    new TimeSheet(1, 1, "10:00")
  ];
  register: Register[] = [
    new Register(1, "04/08/18 10:00", new TimeSheet(1, 1, "10:00"), 20)
  ];

  timeForLunch: number;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public registerService: RegisterService
    ) { }

  onCreate(){
    console.log("settime: "+this.newDate);
    
  }

  private showAlert(options: {itemSliding?: ItemSliding, title: string, type: string, timeSheet?: TimeSheet}){
    let alertOptions: AlertOptions = {
      title: options.title,
      inputs: [
        {
          newHour: 'hour',
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
                contextTimeSheet = new TimeSheet(1, 1, data.newHour);
                this.movieService.createTimeSheet(contextTimeSheet)
                .then((result:TimeSheet)=> {
                  this.timeSheet.unshift(result);
                  loading.dismiss();
                });
                break;
              case 'update':
                options.timeSheet.hour = data.newHour;
                contextTimeSheet = options.timeSheet;
                this.movieService.updateTimeSheet(contextTimeSheet);
                break;
            }
            if(options.itemSliding){
              options.itemSliding.close();
            }
          }
        }
      ]
    }
  }

  private showLoading(message?:string): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: message || 'Please wait...'
    });

    loading.present();
    return loading;
  }
}
