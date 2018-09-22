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

  public getDb():Promise<SQLiteObject> {
    if(this.isFirstCall){
      
      this.isFirstCall = false;

      return this.sqliteHelperService.getDb()
        .then((db: SQLiteObject)=> {
          this.db = db;

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS _timeSheet(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            registerId INTEGER,
            position INTEGER, 
            hour INTEGER);`, [])
            .then(success=> console.log('TimeSheet table created successfully!', success))
            .catch((error: Error) => console.log('Error creating TimeSheet table.', error));

          this.db.executeSql(`CREATE TABLE IF NOT EXISTS __________register(
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            currentDate INTEGER, 
            hoursWorked TEXT,
            lunch INTEGER);`, [])
            .then(success=> console.log('Register table created successfully!', success))
            .catch((error: Error) => console.log('Error creating Register table.', error));

          return this.db;
        })
    }
    return this.sqliteHelperService.getDb();
  }

  createTimeSheet(timeSheet: TimeSheet): Promise<TimeSheet> {
    console.log("position: "+timeSheet.position);
    console.log("registerId: "+timeSheet.registerId);
    console.log("hour: "+timeSheet.hour);

    return this.getDb()
    .then((db: SQLiteObject) => {

      return this.db.executeSql('Insert Into _timeSheet (position, registerId, hour) Values (?, ?, ?)', [timeSheet.position, timeSheet.registerId, timeSheet.hour.getTime()])
        .then(resultSet => {
          timeSheet.id = resultSet.insertId;
          return timeSheet;
        }).catch((error: Error) => {
          let errorMsg: string = `Error to create timeSheet ${timeSheet.position}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }

  getAllTimeSheet(registerId?: number, orderBy?: String): Promise<TimeSheet[]> {
    return this.getDb()
      .then((db: SQLiteObject) => {

        let where = '';
        if(registerId != null) {
          where = ` WHERE registerId = ${registerId}`;
        }
        console.log('where:: '+where);
/**Order By ${orderBy || 'Desc'} */
        return this.db.executeSql(`Select * From _timeSheet ${where}`, [])
          .then(resultSet => {
            
            let list: TimeSheet[] = [];

            console.log('resultSet.rows.length: '+resultSet.rows.length);
            
            for(let i = 0; i < resultSet.rows.length; i++) {
              list.push(resultSet.rows.item(i));
            }

            return list;
          })
          .catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAllTimeSheets!' + error.message;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          })
      });
  }
  
  updateTimeSheet(timeSheet: TimeSheet): Promise<boolean> {
    return this.getDb()
    .then((db: SQLiteObject) => {
      return this.db.executeSql('UPDATE _timeSheet SET position=?, hour=? WHERE id=?', [timeSheet.position, timeSheet.hour.getTime(), timeSheet.id])
        .then(resultSet => resultSet.rowsAffected >= 0)
        .catch((error: Error) => {
          let errorMsg: string = `Error to update TimeSheet ${timeSheet.hour}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }

  deleteTimeSheet(id: number): Promise<boolean> {
    return this.getDb()
    .then((db: SQLiteObject) => {
      return this.db.executeSql('DELETE FROM _timeSheet WHERE id=?', [id])
        .then(resultSet => resultSet.rowsAffected > 0)
        .catch((error: Error) => {
          let errorMsg: string = `Error deleting TimeSheet with id ${id}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }


  /** Register */

  create(register: Register): Promise<Register> {
    console.log("GETTIME::: "+register.currentDate.getTime());
    console.log("Hours Worked::: "+register.hoursWorked);
    return this.getDb()
    .then((db: SQLiteObject) => {
      return this.db.executeSql('INSERT INTO __________register (currentDate, hoursWorked) VALUES (?, ?)', [register.currentDate.getTime(), register.hoursWorked])
        .then(resultSet => {
          register.id = resultSet.insertId;
          console.log('criou register'+register.id);
          
          return register;
        }).catch((error: Error) => {
          let errorMsg: string = `Error to create Register ${register.currentDate}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }

  getByDate(date: Date): Promise<Register> {
    return this.getDb()
    .then((db: SQLiteObject) => {

      return this.db.executeSql('SELECT * FROM Register where currentDate=?', [date.getTime()])
      .then(resultSet => resultSet.rows.item(0))
      .catch((error: Error) => {
        let errorMsg: string = `Error fetching Register with date ${date}!` + error.message;
        console.log(errorMsg);
        return Promise.reject(errorMsg);
      });
    });
  }

  getAll(initialDate?: Date, finalDate?:Date, orderBy?: String): Promise<Register[]> {
    return this.getDb()
      .then((db: SQLiteObject) => {

         console.log('getAllRegister');
        // console.log(initialDate);
        // console.log(finalDate);
        
        let where = '';
        if (initialDate != null && finalDate != null) {

          initialDate.setDate(initialDate.getDate()-1);
          //finalDate.setDate(finalDate.getDate()+1);

          where = `WHERE currentDate >= ${initialDate.getTime()} AND currentDate <= ${finalDate.getTime()}`;

          //where = `Where currentDate BETWEEN ${initialDate.getTime()} AND ${finalDate.getTime()}`;

          console.log("where: "+where);
        }

        return this.db.executeSql(`SELECT * FROM __________register ${where}`, [])
          .then(resultSet => {            
            let list: Register[] = [];

            for(let i = 0; i < resultSet.rows.length; i++) {

              let currentRegister: Register = resultSet.rows.item(i);

              if(currentRegister.hoursWorked == null){
                currentRegister.hoursWorked = "";
              }

              list.push(currentRegister); 
            }

            return list;
          }).catch((error: Error) => {
            let errorMsg: string = 'Error executing method getAll!' + error.message;
            console.log(errorMsg);
            return Promise.reject(errorMsg);
          });
      });
  }

  update(register: Register): Promise<boolean> {
    return this.getDb()
    .then((db: SQLiteObject) => {
      return this.db.executeSql('UPDATE __________register SET lunch=?, hoursWorked=? WHERE id=?', [register.lunch, register.hoursWorked, register.id])
        .then(resultSet => resultSet.rowsAffected >= 0)
        .catch((error: Error) => {
          let errorMsg: string = `Error to update Register ${register.id}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }

  deleteRegister(id: number): Promise<boolean> {
    return this.getDb()
    .then((db: SQLiteObject) => {
      return this.db.executeSql('DELETE FROM __________register WHERE id=?', [id])
        .then(resultSet => resultSet.rowsAffected > 0)
        .catch((error: Error) => {
          let errorMsg: string = `Error deleting Register with id ${id}!` + error.message;
          console.log(errorMsg);
          return Promise.reject(errorMsg);
        });
    });
  }
  
  

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
