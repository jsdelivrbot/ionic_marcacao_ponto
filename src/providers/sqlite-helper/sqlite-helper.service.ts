import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

@Injectable()
export class SqliteHelperService {

  private db: SQLiteObject

  constructor(
    public platform: Platform,
    public sqlite: SQLite) {
  }

  
  private createDatabase(dbName?:string): Promise<SQLiteObject> {
    return this.platform.ready()
      .then((readySource: string) => {
        return this.sqlite.create({ 
          name: dbName || 'ks.db',
          location: 'default'
        }).then((db: SQLiteObject) => {
          this.db = db;
          return this.db;
        }).catch((error: Error) => {
          console.log('Error on open or create database: ', error);
          return Promise.reject(error.message || error);
        });  
      });  
  }

  getDb(dbName?:string, newOpen?:boolean): Promise<SQLiteObject>{
    if (newOpen) return this.createDatabase(dbName);
    return (this.db) ? Promise.resolve(this.db) : this.createDatabase(dbName);
  }  

}
