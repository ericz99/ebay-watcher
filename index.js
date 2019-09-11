const request = require("request-promise");
const logger = require("./lib/logger");
const cheerio = require("cheerio");
const fs = require("fs");
const readline = require("readline");
const async = require('async');

// readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// stores proxies
const formattedProxies = [];

// auto exe this function
const formatProxy = (() => {
  var text = fs.readFileSync("./proxies.txt", "utf-8");
  var textFormat = text.split("\r\n");

  for (let i = 0; i < textFormat.length; i++) {
    textFormat[i].replace(" ", "_");
    var splitProxy = textFormat[i].split(":");
    if (splitProxy.length > 3) {
      formattedProxies.push(
        "http://" +
        splitProxy[2] +
        ":" +
        splitProxy[3] +
        "@" +
        splitProxy[0] +
        ":" +
        splitProxy[1]
      );
    } else {
      formattedProxies.push("https://" + splitProxy[0] + ":" + splitProxy[1]);
    }
  }
})();

const genEmail = domain => {
  return Math.floor(Math.random() * 100000000000) + domain;
};

class Watcher {
  constructor(url, domain, counter) {
    this.url = url;
    this.domain = genEmail(domain);
    this.jar = request.jar();
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
      'Upgrade-Insecure-Requests': 1,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'Accept-Encoding': 'gzip, deflate, br',
      "Accept-Language": "en-US,en;q=0.9",
    };

    this.status = "";
    this.counter = counter;
    this.log = logger("Ebay Watcher!", this.counter);
    this.proxies = formattedProxies;
    this.request = request.defaults({
      jar: this.jar,
      gzip: true
    });
  }

  async init() {
    try {
      await this.register();

      await this.watch();
    } catch (err) {
      if (err) this.log.green(err, "ERROR");
    }
  }

  async register() {
    this.log.yellow(`Registering account => ${this.domain}`);

    const payload = {
      isSug: "false",
      countryId: "1",
      userid: "",
      ru: "http://www.ebay.com",
      firstname: "Nyan",
      lastname: "Cat",
      email: this.domain,
      PASSWORD: "123lol",
      promotion: "true",
      iframeMigration1: "true",
      mode: "1",
      frmaction: "submit",
      tagInfo:
        "ht5%3DAQAAAW0dnqDpAAUxNmQyMjIzZmI0NC5hZDNkNzk1LjE1OTRiLmZmZmFkNjdmvf2AghJ2FvO1c4faa0I5XbCkdKA*%7Cht5new%3Dfalse%26usid%3D2224625d16d0aa12dc5219c5fffa8c3a",
      hmvb: "",
      isGuest: "0",
      idlstate: "",
      profilePicture: "",
      agreement: "Terms and conditions",
      signInUrl:
        "https%3A%2F%2Fsignin.ebay.com%2Fws%2FeBayISAPI.dll%3FSignIn%26regUrl%3Dhttps%253A%252F%252Freg.ebay.com%252Freg%252FPartialReg",
      personalFlag: "true",
      isMobilePhone: "",
      _trksid: "p2052190",
      ets: "AQAEAAAAEIFrMmHMzbIBuKwnQ7oS9WM"
    };

    let opts = {
      uri: "https://reg.ebay.com/reg/PartialReg",
      form: payload,
      method: "POST",
      resolveWithFullResponse: true,
      simple: false
    };

    const res = await this._makeRequest(opts);

    if (res.statusCode == 302) {
      return this.log.green(
        "Successfully registered & logged in under email => " + this.domain
      );
    }
  }

  async watch() {
    let opts = {
      uri: this.url,
      method: "GET",
      resolveWithFullResponse: true
    };

    const res = await this._makeRequest(opts);

    if (res.statusCode == 200) {
      this.log.green("Grabbing watch link...");
      const $ = cheerio.load(res.body);
      const watchUrl = $("#vi-atl-lnk > a").attr("href");

      let opts = {
        uri: watchUrl,
        method: "GET",
        resolveWithFullResponse: true
      };

      const secondRes = await this._makeRequest(opts);

      if (secondRes.statusCode == 200) {
        this.log.green("Successfully watched URL: " + this.url);
        this.status = "done";
        return true;
      } else {
        this.log.red(secondRes.statusCode);
      }
    } else {
      this.log.red(res.statusCode);
    }
  }

  async _makeRequest(options) {
    options.method = options.method || "GET";

    let headers = this.headers;

    let settings = {
      ...options,
      uri: options.uri,
      method: options.method,
      headers
    };

    if (options.form) settings.form = options.form;

    return await this.request(settings);
  }
}

function _init() {
  let counter = 0;

  rl.question("Enter Product Link: ", answer => {
    let url = answer;
    rl.question(
      "Enter Watch Number (MAX: 20 TO AVOID BAN/ABUSE!): ",
      answer => {
        let entries = parseInt(answer);
        rl.question("Enter your domain: ", answer => {
          let domain = answer;
          let threads = [];
          for (let i = 0; i < entries; i++) {
            threads.push(new Watcher(url, domain, counter++));
            async.parallel(threads[i].init());
          }
        });
      }
    );
  });
}

// RUN _INIT()

_init();
