import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';
import { RegisterService } from '../../providers/register/register.service';

@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {

  register: Register[] = []; //jornadas
  timeSheet: TimeSheet[] = []; //maximo de 4 marcacoes
  
  constructor(
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
}
