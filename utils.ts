import * as fs from "fs";

function findDate() {
  try {
    const startDate = new Date("01/01/1903");
    const endDate = new Date("03/05/2023");
    const dates: string[] = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear().toString();
      const formattedDate = `${day}/${month}/${year}`;
      dates.push(formattedDate);
    }

    console.log(dates);
    writeToFile(dates);
  } catch (error) {
    console.log(error.message);
  }
}

findDate();

async function writeToFile(_data: any) {
  try {
    const data = JSON.stringify(_data);
    fs.appendFile("dates.json", data, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  } catch (error) {
    console.log(error.message);
  }
}

//   searchResultsTotal = await page.evaluate(
//     () =>
//       document
//         .querySelector(".totalInfo h4")
//         ?.innerText.split("of ")
//         .slice(-1)[0]
//         .split(" ")[0]
//   );
//   console.log(searchResultsTotal);
