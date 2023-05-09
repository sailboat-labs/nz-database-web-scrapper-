import puppeteer, { Page } from "puppeteer";
import * as fs from "fs";
// import { dates } from "./dates";

async function run() {
  const dates = require(`./${process.argv[2]}`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const start = 0;
  const limit = 15;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    console.log("Collecting companies registered on:", date);
    await page.goto(
      `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=&start=${start}&limit=${limit}&entitySearch=&addressKeyword=&postalCode=&incorpFrom=${date}&incorpTo=${date}&country=&addressType=&advancedPanel=true&mode=advanced&sf=&sd=&entityTypes=ALL&entityStatusGroups=ALL&addressTypes=ALL`,
      { waitUntil: "domcontentloaded" }
    );

    await getCompanies(page);

    while (true) {
      const NextButtonSelector = ".paging > .pagingNext > a";
      const nextButton = await page.$(NextButtonSelector);

      if (nextButton) {
        await Promise.all([
          nextButton?.click(),
          page.waitForNavigation({ timeout: 50000 }),
        ]);
        await getCompanies(page);
      } else {
        break;
      }
    }
    writeToFile(collectedData.flat());
    console.log("Done collecting companies registered on:", date);
  }

  await browser.close();
}

run();

async function getCompanies(page: Page) {
  const companies = await page.evaluate(() => {
    const companyList = document.querySelectorAll(".dataList a.link");
    if (!companyList) return;

    return Array.from(companyList).map((c) => {
      const name = c.querySelector("span.entityName")?.innerText;
      const number = c
        .querySelector("span.entityInfo")
        ?.innerText.split(" ")[0]
        .replace(/[()]/g, "");

      return { name, number };
    });
  });
  //   console.log(companies.flat());
  collectData(companies);
  console.log(companies?.length, " were registered");
  return companies;
}

let collectedData: any[] = [];
async function collectData(companyData: any) {
  if (!companyData) return;
  collectedData.push(companyData);
}

let writeCounter = 0;
async function writeToFile(_data: any) {
  if (_data.length === 0) return;
  if (_data.length <= writeCounter) return;
  try {
    const data = JSON.stringify(_data);
    fs.writeFile("data.json", data, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
      writeCounter = _data.length;
    });
  } catch (error) {
    console.log(error.message);
  }
}
