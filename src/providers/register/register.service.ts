import { Injectable } from '@angular/core';
import { SQLiteObject } from '../../../node_modules/@ionic-native/sqlite';
import { SqliteHelperService } from '../sqlite-helper/sqlite-helper.service';
import { Register } from '../../models/Register.model';
import { TimeSheet } from '../../models/TimeSheet.model';

@Injectable()
export class RegisterService {

  private db: SQLiteObject;
  private isFirstCall: boolean = true;

  constructor(
    public sqliteHelperService: SqliteHelperService
  ) { }


  public getDb():Promise<SQLiteObject>{
    if(this.isFirstCall){
      
      this.isFirstCall = false;

      return this.sqliteHelperService.getDb()
        .then((db: SQLiteObject)=>{
          this.db = db;

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS timeSheet(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            position INTEGER, 
            hour TEXT);`, {})
            .then(success=> console.log('TimeSheet table created successfully!', success))
            .catch((error: Error) => console.log('Error creating TimeSheet table.', error));

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS register(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            currentDate TEXT, 
            lunch INTEGER, 
            _timeSheet INTEGER NOT NULL, 
            FOREIGN KEY (_timeSheet) REFERENCES timeSheet(id);`, {})
            .then(success=> console.log('Register table created successfully!', success))
            .catch((error: Error) => console.log('Error creating Register table.', error));

          return this.db;
        })
    }
    return this.sqliteHelperService.getDb();
  }

  getAll(orderBy?: String): Promise<Register[]>{
    return this.getDb()
      .then((db: SQLiteObject) => {

        return this.db.executeSql(`SELECT * FROM Register ORDER BY ${orderBy || 'DESC'}`)
          .then(resultSet => {
            
            let list: Register[] = [];

            for(let i = 0; i < resultSet.rows.length; i++){
              list.push(resultSet.rows.item(i));
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }

  createTimeSheet(timeSheet: TimeSheet): Promise<TimeSheet>{
    return this.db.executeSql('INSERT INTO timeSheet (id, position, hour) VALUES (?, ?, ?)', [timeSheet.id, timeSheet.position, timeSheet.hour])
      .then(resultSet => {
        timeSheet.id = resultSet.insertId;
        return timeSheet;
      }).catch((error: Error) => {
        let errorMsg: string = `Error to create timeSheet ${timeSheet.position}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  
  updateTimeSheet(timeSheet: TimeSheet): Promise<boolean>{
    return this.db.executeSql('UPDATE Register SET position=?, hour=?, WHERE id=?', [timeSheet.position, timeSheet.hour, timeSheet.id])
      .then(resultSet => resultSet.rowsAffected >= 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error to update TimeSheet ${timeSheet.hour}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  deleteTimeSheet(id: number): Promise<boolean>{
    return this.db.executeSql('DELETE timeSheet WHERE id=?', [id])
      .then(resultSet => resultSet.rowsAffected > 0)
      .catch((error: Error) => {
        let errorMsg: string = `Error deleting TimeSheet with id ${id}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }

  create(Register: Register, timeSheetId: number): Promise<Register>{
    return this.db.executeSql('INSERT INTO Register (id, currentDate, timeSheet, lunch) VALUES (?, ?, ?, ?)', [Register.id, Register.currentDate, timeSheetId, Register.lunch])
      .then(resultSet => {
        Register.id = resultSet.insertId;
        return Register;
      }).catch((error: Error) => {
        let errorMsg: string = `Error to create Register ${Register.currentDate}!` + error;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
  }
    
  getById(id: number): Promise<Register>{
    return this.db.executeSql('SELECT * FROM Register where id=?', [id])
    .then(resultSet => resultSet.rows.item(0))
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching Register with id ${id}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }

  getExistsId(id: number): Promise<boolean>{
    return this.db.executeSql('SELECT * FROM Register where id=?', [id])
    .then(resultSet => resultSet.rows > 0)
    .catch((error: Error) => {
      let errorMsg: string = `Error fetching Register with id ${id}!` + error;
      console.log(errorMsg);
      return Promise.reject(errorMsg);
    });
  }
}
