import * as fs from "fs";

// function findDate() {
//   try {
//     const startDate = new Date("10/03/2023");
//     const endDate = new Date("09/05/2023");
//     const dates: string[] = [];

//     for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
//       const day = d.getDate().toString().padStart(2, "0");
//       const month = (d.getMonth() + 1).toString().padStart(2, "0");
//       const year = d.getFullYear().toString();
//       const formattedDate = `${day}/${month}/${year}`;
//       dates.push(formattedDate);
//     }

//     console.log(dates);
//     writeToFile(dates);
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// findDate();

// async function writeToFile(_data: any) {
//   try {
//     const data = JSON.stringify(_data);
//     fs.appendFile("dates.json", data, (err) => {
//       if (err) throw err;
//       console.log("The file has been saved!");
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// }

function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
}

function generateDateList(startDate: Date, endDate: Date): string[] {
  const dateList: any = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateList.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateList;
}

const startDate = new Date("2023-03-10");
const endDate = new Date("2023-05-10");

const dateList = generateDateList(startDate, endDate);

console.log(dateList);
