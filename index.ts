import {URLSearchParams} from 'url';
import * as opt from 'optimist';
import {CheckCookie} from "./check-cookie";
import {SmsSenderDelivery} from "./utils";
import {sleep} from "./sms-activate";

(<any>global).fetch = require("node-fetch");
(<any>global).URLSearchParams = URLSearchParams;

const argv = opt
  .usage('Usage: $0 --cookie [boolean] --service [smsactivate/simsms] --fast [false/true]')
  .default('cookie', 'true')
  .default('fast', 'false')
  .default('service', 'smsactivate')
  .demand(['cookie', 'service'])
  .argv;

(async () => {
  const isCookie = argv.cookie;
  const service = argv.service;
  const fast: boolean = argv.fast === 'true';

  if (isCookie === 'true') {
    const cookie = new CheckCookie(fast);
    cookie.run();

    return;
  }

  for (let i = 1; i < 2; ++i) {
    start(service);
  }
})();

async function start(service: string) {
  const sender = new SmsSenderDelivery();
  for (let i = 0; i < 20000; ++i) {
    console.log(i);
    await sleep(1000);
    await sender.run(service === 'smsactivate' ? 1 : 0);
  }
  process.exit();
}
