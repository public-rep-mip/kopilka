import {DeliveryNewYear} from "./delivery-new-year";
import {CheckCookie, cookieService} from "./check-cookie";
import {SimSms, sleep, SmsActivate} from "./sms-activate";

const token = '<тут telegramm токен бота для отправки сообщения>';
const message = encodeURIComponent('У вас недостатно денег на балансе');
// const startEmail = 'jokcik';
const startEmail = 'testtest';
const endEmail = '@gmail.com';

function mergeCookie(cookie1, cookie2) {
  const split1 = cookie1.split('; ');
  const split2 = cookie2.split('; ');

  const split: string[] = [...split1, ...split2];
  return split.join('; ');
}


export async function sendKopilkaAnd(delivery: DeliveryNewYear, cookie: string, sms?: SmsActivate | SimSms, id?: string) {
  const email = `${startEmail}+misha${Date.now()}${endEmail}`;
  const reqKopilka = await delivery.kopilka(email, cookie);
  const jsonRes = await reqKopilka.json();
  console.log(JSON.stringify(jsonRes));
  const payloadResult = jsonRes.payload;

  if (sms) {
    await sms.setStatus(id, 6);
  }

  if (!payloadResult.gift) {
    if (payloadResult.errors[0].message.indexOf('не пройдена') > 0) {
      await cookieService.write(cookie, -1);
    } else {
      await cookieService.write(cookie, 0);
    }

    return;
  } else {
    await cookieService.write(cookie, 1);
  }

  const delivery_code = payloadResult.gift.dc_code;
  const delivery_title = payloadResult.gift.title;
  console.log(email);
  const resMessage = `${delivery_title}. Код: ${delivery_code}. Отправлен на email: ${email}`;

  console.log(resMessage);
  (await fetch(`http://crierbot.appspot.com/${token}/send?message=${encodeURIComponent(resMessage)}`));

  return;
}


export class SmsSenderDelivery {
  public async run(flag = 1) {
    let sms, id;
    try {
      if (flag) {
        sms = new SmsActivate();
      } else {
        sms = new SimSms();
      }
      const delivery = new DeliveryNewYear();

      const balance = await sms.getBalance();
      console.log('balance');
      if (balance <= 1) {
        await fetch(`http://crierbot.appspot.com/${token}/send?message=${message}`);
        process.exit();
      }

      const res = await fetch('http://spb.delivery-club.ru/kopilka/?utm_source=advcake&utm_campaign=admitad&utm_content=11232&utm_medium=cpa&advcake_params=dcfc744c446a6d96d23fb9a83df0fe18');
      let cookie = res.headers.get('set-cookie');
      const splits = cookie.split('; ');
      let number;
      try {
        const res = await sms.getOtherNumber();
        id = res.id;
        number = res.number;
      } catch (e) {
        console.log(new Date() + ' нет номера ' + e.message);
        await sleep(flag ? 2000 : 10000);
        return;
      }
      console.log('sms.getOtherNumber', id, number);

      const reqCode = await delivery.sendCode(number);
      const payload = (await reqCode.json()).payload;
      if (payload.errors) {
        await sms.setStatus(id, -1);
        return console.log('error', JSON.stringify(payload));
      }

      cookie = mergeCookie(cookie, reqCode.headers.get('set-cookie'));
      const requestId = payload.request_id;

      const text = await sms.getCode(id);
      const code = text.match(/\d+/)[0];

      console.log('text sms', text);
      console.log('code sms', code);

      // rl.question('enterCode:  ', async code => {
      const reqLogin = await delivery.login(code, requestId, cookie);
      cookie = mergeCookie(cookie, reqLogin.headers.get('set-cookie'));

      const json = await reqLogin.json();
      if (json.payload.errors) {
        console.log('код неверный');
        await sms.setStatus(id, 6);
        return;
      }

      await sendKopilkaAnd(delivery, cookie, sms, id);
      // await sleep(50000);
      // process.exit();
    } catch (e) {
      try {
        await sms.setStatus(id, -1);
      } catch (e) {
        try {
          await sms.setStatus(id, 6);
        } catch (e) {
        }
      }

      console.log('error INDEX', e);
      return;
      // process.exit();
    }
  }
}
