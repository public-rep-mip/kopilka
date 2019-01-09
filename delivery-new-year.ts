export class DeliveryNewYear {
  private baseurl: string = 'https://spb.delivery-club.ru/ajax/';

  private codeUrl: string = 'user_otp/';
  private loginUrl: string = 'login_otp/';
  private kopilkaUrl: string = 'kopilka/';

  public sendCode(phone: string) {

    const params = new URLSearchParams();
    params.append('phone', phone[0] === '7' ? phone : '7' + phone);

    try {
      return fetch(`${this.baseurl}${this.codeUrl}`, { method: 'POST', body: params })
    } catch (e) {
      console.log('sendCode ERROR', e);
      throw new Error('sendCode ERROR' + JSON.stringify(e));
    }
  }

  public async loginEmail(login: string, password: string) {
    // const formData = {
    //   "c_l": login,
    //   "c_p": password
    // }

    const params = new URLSearchParams();
    params.append('c_l', login);
    params.append('c_p', password);
    // let res = await fetch("https://spb.delivery-club.ru/ajax/login/",
    //   {method: "POST", headers, body: formData});
    return await fetch("https://spb.delivery-club.ru/ajax/login/", {method: 'POST', body: params});
  }

  public login(opt: string, request_id: string, cookie) {
    const params = new URLSearchParams();
    params.append('otp', opt);
    params.append('request_id', request_id);

    console.log('login', opt, request_id);

    try {
      return fetch(`${this.baseurl}${this.loginUrl}`, { method: 'POST', body: params, headers: { cookie } });
    } catch (e) {
      console.log('login ERROR', e);
      throw new Error('login ERROR' + JSON.stringify(e));
    }
  }

  public kopilka(email: string, cookie: string) {
    const params = new URLSearchParams();
    params.append('email', email);

    try {
      console.log(cookie);
      return fetch(`${this.baseurl}${this.kopilkaUrl}`, { method: 'POST', body: params, headers: { cookie } })
    } catch (e) {
      console.log('kopilka ERROR', e);
      throw new Error('kopilka ERROR' + JSON.stringify(e));
    }

  }
}
