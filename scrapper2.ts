import puppeteer, { Page } from "puppeteer";
import * as fs from "fs";
import { uid } from "uid";

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const company = {
    name: "ACCESS PROPERTY SERVICES LIMITED",
    number: "2194510",
  };

  const url = `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/${company.number}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });
  const singlePageSelector = "#showAllDetails";
  const singlePageButton = await page.$(singlePageSelector);

  await Promise.all([singlePageButton?.click(), page.waitForNavigation()]);

  // await page.screenshot({ path: "singlePage.png", fullPage: true });

  // Labels
  const companyInfo = await page.evaluate(() => {
    const company = {
      name: "ACCESS PROPERTY SERVICES LIMITED",
      number: "2194510",
    };

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

    const table = document.querySelector("table.otherDetailsTable")!;
    const tradingNameLabel = document.querySelector(
      "tr:nth-child(1) td:last-child"
    );
    const phoneNumbersLabel = document.querySelector(
      "tr:nth-child(2) td:last-child"
    );
    const emailLabel = document.querySelector("tr:nth-child(3) td:last-child");
    const websiteLabel = document.querySelector(
      "tr:nth-child(4) td:last-child"
    );
    const industryClassificationLabel = table.querySelector(
      "tr:nth-child(5) td:last-child"
    )!;

    const ultimateHoldingCompanyLabel = document.querySelector(
      "#ultimateHoldingCompany"
    );

    // Properties
    const companyNumber = companyNumberLabel?.nextSibling?.textContent?.trim();
    const nzbn = nzbnLabel?.nextSibling?.textContent?.trim();
    const incorporationDate =
      incorporationDateLabel?.nextSibling?.textContent?.trim();
    const companyStatus = companyStatusLabel?.nextSibling?.textContent?.trim();
    const entityType = entityTypeLabel?.nextSibling?.textContent?.trim();
    const constitutionFiled =
      constitutionFiledLabel?.textContent?.trim() ?? "No";
    const arFilingMonth = arFilingMonthLabel?.nextSibling?.textContent?.trim();
    const tradingName = tradingNameLabel?.textContent!.trim();
    const phoneNumber = phoneNumbersLabel?.textContent!.trim();
    const email = emailLabel?.textContent!.trim();
    const website = websiteLabel?.textContent!.trim();
    const industryClassification =
      industryClassificationLabel.textContent!.trim();
    const ultimateHoldingCompany =
      ultimateHoldingCompanyLabel?.nextSibling?.textContent?.trim();

    return {
      name: company.name,
      companyNumber,
      nzbn,
      incorporationDate,
      companyStatus,
      entityType,
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
  });

  const addresses = await page.evaluate(() => {
    const company = {
      name: "ACCESS PROPERTY SERVICES LIMITED",
      number: "2194510",
    };

    const registeredOfficeAddressLabel = document.querySelector(
      'label[for="registeredCompanyAddress0"] + div'
    );
    const addressForServiceLabel = document.querySelector(
      'label[for="addressForService1"] + div'
    );

    const registeredOfficeAddress = registeredOfficeAddressLabel?.textContent
      ?.trim()
      ?.replace(/\n/g, "");
    const addressForService = addressForServiceLabel?.textContent
      ?.trim()
      ?.replace(/\n/g, "");

    return {
      registeredOfficeAddress,
      addressForService,
      comaapnyNumber: company.number,
    };
  });

  const directors = await page.evaluate(() => {
    const company = {
      name: "ACCESS PROPERTY SERVICES LIMITED",
      number: "2194510",
    };

    const details: any = [];

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
        id: "",
        name,
        residentialAddress,
        appointmentDate,
        // isShareholder,
        companyNumber: company.number,
        //  consentFormLink,
      });
    });

    return details;
  });

  const shareholders = await page.evaluate(() => {
    const company = {
      name: "ACCESS PROPERTY SERVICES LIMITED",
      number: "2194510",
    };

    const row = document.querySelector(".allocations div.row");
    const totalSharesLabel = row?.querySelector("label:nth-child(1)");
    const extensiveShareholdingLabel = row?.querySelector(".noLabel");
    const totalShares =
      totalSharesLabel?.nextElementSibling?.textContent?.trim();

    const extensiveShareholding =
      extensiveShareholdingLabel?.textContent?.trim();
    return {
      id: "",
      companyNumber: company.number,
      totalShares,
      extensiveShareholding,
    };
  });

  // const allocations = await scrapeAllocators(page);

  appendId(directors);
  appendId([shareholders]);
  console.log(companyInfo);
  console.log(addresses);
  console.log(directors);
  console.log(shareholders);
  // console.log(allocations);

  await browser.close();
}

run();

function appendId(entity: any) {
  entity.forEach((entity: any) => {
    entity.id = uid(32);
  });

  return entity;
}

async function getAllocations(page: Page) {
  const allocations = await page.$$("#allocations .allocationDetail");
  const allocators: any[] = [];
  for (const allocation of allocations) {
    const shares = await allocation.$eval('input[name="shares"]', (input) =>
      parseInt(input?.getAttribute("value") as string)
    );

    const allocatorElements = await allocation.$$(".labelValue.col2");

    if (allocatorElements.length === 1) {
      const name = await allocatorElements[0].evaluate((node) =>
        node.textContent?.trim()?.replace(/\n/g, "")
      );
      const address = await allocatorElements[0].evaluate(
        (node) =>
          node.nextElementSibling?.textContent?.trim()?.replace(/\n/g, "") ?? ""
      );
      allocators.push({ name, address, shares });
    } else {
      const sharesPerAllocator = shares / allocatorElements.length;
      for (const allocatorElement of allocatorElements) {
        const name = await allocatorElement.evaluate((node) =>
          node.textContent?.trim()?.replace(/\n/g, "")
        );
        const address = await allocatorElement.evaluate(
          (node) =>
            node.nextElementSibling?.textContent?.trim()?.replace(/\n/g, "") ??
            ""
        );
        allocators.push({ name, address, shares: sharesPerAllocator });
      }
    }
  }

  return allocators;
}

interface Allocator {
  name: string | undefined;
  address: string | undefined;
  shares: number | undefined;
}

async function scrapeAllocators(page: Page) {
  const allocators: Allocator[] = [];

  // Loop through each allocation detail element
  const allocationElements = await page.$$("#allocations .allocationDetail");
  for (let i = 0; i < allocationElements.length; i++) {
    const allocation = allocationElements[i];
    const sharesInput = await allocation.$('input[name="shares"]');
    const shares = await sharesInput?.evaluate((el) =>
      parseInt(el.getAttribute("value") || "0", 10)
    );

    // Get the name and address of each allocator
    const allocatorElements = await allocation.$$(
      ".row:nth-child(2) .labelValue"
    );
    for (let j = 0; j < allocatorElements.length; j++) {
      const allocatorElement = allocatorElements[j];
      const name = await allocatorElement.evaluate((el) =>
        el.textContent?.trim()
      );
      const addressElement = allocatorElement.nextElementSibling;
      const address = await addressElement?.evaluate((el) =>
        el.textContent?.trim()
      );

      // Divide the shares among multiple allocators
      const numAllocators = allocatorElements.length;
      const allocatorShares =
        numAllocators > 1 ? shares / numAllocators : shares;

      // Add the allocator to the list
      allocators.push({
        name: name || "",
        address: address || "",
        shares: allocatorShares,
      });
    }
  }

  return allocators;
}
