import { Component } from '@angular/core';
import { ViewController, NavParams } from '../../../node_modules/ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';

@Component({
  selector: 'time-sheet-details',
  templateUrl: 'time-sheet-details.html'
})
export class TimeSheetDetailsComponent {

  title: string;
  register: Register;
  timeSheets: TimeSheet[];

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.title = this.navParams.get("title");
    this.register = this.navParams.get("register");

    this.timeSheets = this.navParams.get("timeSheets");
  }

  voltar(): void {
    this.viewCtrl.dismiss();
  }

}
