import * as SMSActiv from 'node-sms-activate-api';

export class SmsActivate {
  private API_KEY = "API_KEY";
  private smsactivate = new SMSActiv(this.API_KEY);

  constructor() {
  }

  public getBalance() {
    return this.smsactivate.getBalance();
  }

  public getOtherNumber() {
    return this.smsactivate.getNumber('dt');
  }

  public async getCode(id: string) {
    try {
      const timeout = setTimeout(() => this.setStatus(id, -1), 1000 * 60 * 1);
      const result = await this.smsactivate.getCode(id);
      clearTimeout(timeout);

      return result;
    } catch (e) {
      throw new Error('getCode error' + e.message);
    }
  }

  public setStatus(id: string, status: number) {
    return this.smsactivate.setStatus(id, status);
  }
}

const SIMSms = require('node-simsms-api');
// const simsms = new SimSms('API_KEY');
const serviceList = require('./node_modules/node-simsms-api/serviceList');
serviceList['Delivery'] = 69;

export class SimSms {
  private API_KEY = "API_KEY";
  private sms = new SIMSms(this.API_KEY);
  private service = 'Delivery';

  constructor() {
  }

  public getBalance() {
    return this.sms.get_balance();
  }

  public getOtherNumber() {
    return this.sms.get_number(this.service);
  }

  public async getCode(id: string) {
    try {
      const timeout = setTimeout(() => this.setStatus(id, -1), 1000 * 60 * 1);
      let result;

      while (true) {
        try {
          result = await this.sms.get_sms(id, this.service);
          break;
        } catch (e) {
          console.log(e.message);
          if (e.message !== 'get_sms error') {
            console.log('Не пришла sms: ' + id);
            return;
          }
        }
        await sleep(1000);

      }
      clearTimeout(timeout);

      console.log(result);
      return result;
    } catch (e) {
      throw new Error('getCode error' + e.message);
    }
  }

  public setStatus(id: string, status: number) {
    if (status === -1) {
      return this.sms.denial();
    }

    // return this.sms.setStatus(id, status);
  }
}

export function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
