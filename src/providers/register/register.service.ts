import { Injectable } from '@angular/core';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { SQLiteObject } from '@ionic-native/sqlite';

import { TimeSheet } from '../../models/TimeSheet.model';
import { Register } from '../../models/Register.model';

@Injectable()
export class RegisterService {

  private db: SQLiteObject;
  private isFirstCall: boolean = true;

  constructor(
    public sqliteHelperService: SqliteHelperService
  ) {}

  public getDb():Promise<SQLiteObject>{
    if(this.isFirstCall){
      
      this.isFirstCall = false;

      return this.sqliteHelperService.getDb()
        .then((db: SQLiteObject)=>{
          this.db = db;

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS timeSheet(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            registerId INTEGER,
            position INTEGER, 
            hour TEXT);`, [])
            .then(success=> console.log('TimeSheet table created successfully!', success))
            .catch((error: Error) => console.log('Error creating TimeSheet table.', error));

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS register(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            currentDate TEXT, 
            lunch INTEGER);`, [])
            .then(success=> console.log('Register table created successfully!', success))
            .catch((error: Error) => console.log('Error creating Register table.', error));

          return this.db;
        })
    }
    return this.sqliteHelperService.getDb();
  }

  getAllTimeSheet(data?: Date, orderBy?: String): Promise<TimeSheet[]>{
    return this.getDb()
      .then((db: SQLiteObject) => {
        //let where = `WHERE hour >= date('now');`;
        return this.db.executeSql(`SELECT * FROM timeSheet ORDER BY ${orderBy || 'DESC'}`)
          .then(resultSet => {
            
            let list: TimeSheet[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              list.push(resultSet.rows.item(i));
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error.message;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  createTimeSheet(timeSheet: TimeSheet): Promise<TimeSheet>{
    return this.db.executeSql('INSERT INTO timeSheet (position, registerId, hour) VALUES (?, ?, ?)', [timeSheet.position, timeSheet.registerId, timeSheet.hour])
      .then(resultSet => {
        timeSheet.id = resultSet.insertId;
        return timeSheet;
      }).catch((error: Error) => {
        let errorMsg: string = `Error to create timeSheet ${timeSheet.position}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  
  updateTimeSheet(timeSheet: TimeSheet): Promise<boolean>{
    return this.db.executeSql('UPDATE timeSheet SET position=?, hour=? WHERE id=?', [timeSheet.position, timeSheet.hour, timeSheet.id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update TimeSheet ${timeSheet.hour}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  deleteTimeSheet(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE FROM timeSheet WHERE id=?', [id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting TimeSheet with id ${id}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  getAll(orderBy?: String): Promise<Register[]>{
    return this.getDb()
      .then((db: SQLiteObject) => {

        return this.db.executeSql(`SELECT * FROM register ORDER BY ${orderBy || 'DESC'}`)
          .then(resultSet => {
            
            let list: Register[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              list.push(resultSet.rows.item(i));
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error.message;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  create(register: Register): Promise<Register>{
    return this.db.executeSql('INSERT INTO register (currentDate) VALUES (?)', [register.currentDate])
      .then(resultSet => {
        register.id = resultSet.insertId;
        return register;
      }).catch((error: Error) => {
        let errorMsg: string = `Error to create Register ${register.currentDate}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  update(register: Register): Promise<boolean>{
    return this.db.executeSql('UPDATE register SET lunch=? WHERE id=?', [register.lunch,register.id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update Register ${register.id}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }
    
  // getById(id: number): Promise<Register>{
  //   return this.db.executeSql('SELECT * FROM Register where id=?', [id])
  //   .then(resultSet => resultSet.rows.item(0))
  //   .catch((error: Error) => {
  //     let errorMsg: string = `Error fetching Register with id ${id}!` + error.message;
  //     console.log(errorMsg);
  //     return Promise.reject(errorMsg);
  //   });
  // }

  // getExistsId(id: number): Promise<boolean>{
  //   return this.db.executeSql('SELECT * FROM Register where id=?', [id])
  //   .then(resultSet => resultSet.rows > 0)
  //   .catch((error: Error) => {
  //     let errorMsg: string = `Error fetching Register with id ${id}!` + error.message;
  //     console.log(errorMsg);
  //     return Promise.reject(errorMsg);
  //   });
  // }
}
