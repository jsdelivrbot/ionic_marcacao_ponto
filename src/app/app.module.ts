import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { ReportPage } from '../pages/report/report';

import { StatusBar } from '@ionic-native/status-bar';
import { SQLite } from '@ionic-native/sqlite';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SqliteHelperService } from '../providers/sqlite-helper/sqlite-helper.service';
import { RegisterService } from '../providers/register/register.service';

@NgModule({
  declarations: [
    MyApp,
    ReportPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      mode: "md"
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ReportPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SqliteHelperService,
    SQLite,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    RegisterService,
  ]
})
export class AppModule {}
