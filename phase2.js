const puppeteer = require("puppeteer");
const fs = require("fs");
// import { uid } from "uid";

let companiesData = [];
let addressesData = [];
let directorsData = [];
let shareholdersData = [];
let allocatorData = [];

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const filePath = `./${process.argv[2]}`;
  const companies = require(filePath);
  const currentTimestamp = Date.now();

  for (const company of companies) {
    console.log(
      "Scrapping data for: ",
      company.name,
      "with number: ",
      company.number
    );

    const url = `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/${company.number}`;

    await page.goto(url, { waitUntil: "domcontentloaded" });
    const singlePageSelector = "#showAllDetails";
    const singlePageButton = await page.$(singlePageSelector);

    await Promise.all([singlePageButton?.click(), page.waitForNavigation()]);

    // await page.screenshot({ path: "singlePage.png", fullPage: true });

    // Labels
    const companyInfo = await page.evaluate((company) => {
      //    const company = {
      //    name: "128 KINGS DRIVE LIMITED",
      //    number: "8721371",
      //  };

      const companyNumberLabel = document.querySelector(
        'label[for="companyNumber"]'
      );
      const nzbnLabel = document.querySelector('label[for="nzbn"]');
      const incorporationDateLabel = document.querySelector(
        'label[for="incorporationDate"]'
      );
      const companyStatusLabel = document.querySelector(
        'label[for="companyStatus"]'
      );
      const entityTypeLabel = document.querySelector('label[for="entityType"]');
      const constitutionFiledLabel = document.querySelector(
        'label[for="constitutionFiled"] + a'
      );
      const arFilingMonthLabel = document.querySelector(
        'label[for="arFilingMonth"]'
      );

      const table = document.querySelector("table.otherDetailsTable");
      const tradingNameLabel = document.querySelector(
        "tr:nth-child(1) td:last-child"
      );
      const phoneNumbersLabel = document.querySelector(
        "tr:nth-child(2) td:last-child"
      );
      const emailLabel = document.querySelector(
        "tr:nth-child(3) td:last-child"
      );
      const websiteLabel = document.querySelector(
        "tr:nth-child(4) td:last-child"
      );
      const industryClassificationLabel = table.querySelector(
        "tr:nth-child(5) td:last-child"
      );

      const ultimateHoldingCompanyLabel = document.querySelector(
        "#ultimateHoldingCompany"
      );

      // Properties
      const companyNumber =
        companyNumberLabel?.nextSibling?.textContent?.trim();
      const nzbn = nzbnLabel?.nextSibling?.textContent?.trim();
      const incorporationDate =
        incorporationDateLabel?.nextSibling?.textContent?.trim();
      const companyStatus =
        companyStatusLabel?.nextSibling?.textContent?.trim();
      const entityType = entityTypeLabel?.nextSibling?.textContent?.trim();
      const constitutionFiled =
        constitutionFiledLabel?.textContent?.trim() ?? "No";

      const arFilingMonth = arFilingMonthLabel?.nextSibling?.textContent
        ?.trim()
        ?.replace(/\n/g, "")
        ?.split(",")[0]
        ?.trim();

      const tradingName = tradingNameLabel?.textContent?.trim();
      const phoneNumber = phoneNumbersLabel?.textContent?.trim();
      const email = emailLabel?.textContent?.trim();
      const website = websiteLabel?.textContent?.trim();
      const industryClassification =
        industryClassificationLabel.textContent?.trim();
      const ultimateHoldingCompany =
        ultimateHoldingCompanyLabel?.nextSibling?.textContent?.trim();

      return {
        name: company.name,
        companyNumber,
        nzbn,
        incorporationDate,
        companyStatus,
        constitutionFiled,
        arFilingMonth,
        tradingName,
        phoneNumber,
        email,
        website,
        industryClassification,
        ultimateHoldingCompany,
        companyRecordLink: `https://app.companiesoffice.govt.nz/co/${company.number}`,
      };
    }, company);

    const addresses = await page.evaluate((company) => {
      const registeredOfficeAddressLabel =
        document.querySelector(
          'label[for="registeredCompanyAddress0"] + div'
        ) ??
        document.querySelector('label[for="registeredCompanyAddress1"] + div');

      const addressForServiceLabel =
        document.querySelector('label[for="addressForService1"] + div') ??
        document.querySelector('label[for="addressForService0"] + div');

      const registeredOfficeAddress = registeredOfficeAddressLabel?.textContent
        ?.trim()
        ?.replace(/\n/g, "");
      const addressForService = addressForServiceLabel?.textContent
        ?.trim()
        ?.replace(/\n/g, "");

      return {
        registeredOfficeAddress,
        addressForService,
        companyNumber: company.number,
      };
    }, company);

    const directors = await page.evaluate((company) => {
      const details = [];

      const directorsPanel = document.querySelector("#directorsPanel");
      const directorRows = directorsPanel?.querySelectorAll("table");
      directorRows?.forEach((row) => {
        const name = row
          ?.querySelector('label[for="fullName"]')
          ?.nextSibling?.textContent?.trim()
          ?.replace(/\n/g, "");
        const residentialAddress = row
          ?.querySelector('label[for="residentialAddress"]')
          ?.nextSibling?.textContent?.trim()
          ?.replace(/\n/g, "");
        const appointmentDate = row
          ?.querySelector('label[for="appointmentDate"]')
          ?.nextSibling?.textContent?.trim();
        const isShareholder =
          row
            ?.querySelector('label[for="shareholder"] + a')
            ?.textContent?.trim() ?? "No";
        //  const consentFormLink = row.querySelector(".fileName")?.href || null;

        details.push({
          name,
          residentialAddress,
          appointmentDate,
          companyNumber: company.number,
        });
      });

      return details;
    }, company);

    const shareholders = await page.evaluate((company) => {
      const row = document.querySelector(".allocations div.row");
      const totalSharesLabel = row?.querySelector("label:nth-child(1)");
      const extensiveShareholdingLabel = row?.querySelector(".noLabel");
      const numberOfShares =
        totalSharesLabel?.nextElementSibling?.textContent?.trim();

      const extensiveShareholding =
        extensiveShareholdingLabel?.textContent?.trim();
      return {
        companyNumber: company.number,
        numberOfShares,
        extensiveShareholding,
      };
    }, company);

    const allocators = await getAllocators(page, company);

    companiesData.push(companyInfo);
    addressesData.push(addresses);
    directorsData.push(directors);
    shareholdersData.push(shareholders);
    allocatorData.push(allocators);

    // console.log({ companyInfo });
    // console.log({ addresses });
    // console.log({ directors });
    // console.log({ shareholders });
    // console.log({ allocators });

    await writeToFile(companiesData.flat(), "companies", currentTimestamp);
    await writeToFile(addressesData.flat(), "addresses", currentTimestamp);
    await writeToFile(directorsData.flat(), "directors", currentTimestamp);
    await writeToFile(
      shareholdersData.flat(),
      "shareholders",
      currentTimestamp
    );
    await writeToFile(allocatorData.flat(), "allocators", currentTimestamp);

    await removeCompanyFromFile(filePath, company);

    console.log(
      "Done scrapping data for: ",
      company.name,
      "with number: ",
      company.number
    );
  }

  console.log("======= Scrapping is done, CLOSING BROWSER =========");
  await browser.close();
}

run();

async function getAllocators(page, company) {
  const allAllocations = await page.$$("#allocations .allocationDetail");

  const allocators = [];

  for (const allocation of allAllocations) {
    const _shares = await allocation.$eval('input[name="shares"]', (input) =>
      parseInt(input?.getAttribute("value"))
    );

    const allocations = await allocation.$$(".clear ~ .row .labelValue");
    const numberOfAllocators = allocations.length / 2;
    const shares = (_shares / numberOfAllocators).toFixed(2);

    let name;
    let address;
    for (let i = 0; i < allocations.length; i++) {
      const allocator = allocations[i];

      if (i % 2 == 0) {
        name = await allocator.evaluate((node) => node.textContent.trim());
      } else {
        address = await allocator.evaluate((node) =>
          node.textContent.trim()?.replace(/\n/g, "")
        );
        allocators.push({
          name,
          address,
          shares,
          companyNumber: company.number,
        });
      }
    }
  }
  return allocators;
}

let writeCounter = 0;
async function writeToFile(_data, location, timeStamp) {
  if (_data.length === 0) return;
  if (_data.length <= writeCounter) return;
  try {
    const data = JSON.stringify(_data);
    fs.writeFile(`phase2/${location}/${timeStamp}.json`, data, (err) => {
      if (err) throw err;
      console.log(`The file has been saved to ${location}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function removeCompanyFromFile(filePath, company) {
  // Load the JSON file
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Define the text to remove
  const textToRemove = company;

  // Remove all occurrences of the text from the JSON
  const filteredData = jsonData.filter(
    (obj) => JSON.stringify(obj) !== JSON.stringify(textToRemove)
  );

  // Save the filtered data back to the JSON file
  fs.writeFileSync(filePath, JSON.stringify(filteredData));
}
