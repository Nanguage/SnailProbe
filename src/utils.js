import PaPa from 'papaparse'
import _ from 'lodash'

let isFloat = (x) => { return !!(x % 1); }

let coloringBases = (seq) => {
  let colored = ""
  let c = "#000000"
  for (let b of seq) {
    switch (b) {
      case 'A':
        c = "#aF0000"
        break;
      case 'T':
        c = "#00aF53"
        break;
      case 'C':
        c = "#FF3600"
        break;
      case 'G':
        c = "#0000FF"
        break;
    }
    colored += b.fontcolor(c)
  }
  return colored
}

//let createElementFromHTML = (htmlString) => {
//  var div = document.createElement('div');
//  div.innerHTML = htmlString.trim();
//  return div.firstChild; 
//}


let parseCSV = (csvtext) => {
    let items = []
    let data = PaPa.parse(csvtext).data
    data = _.filter(data, (i) => (i.length > 1))
    let columns = data.shift()
    for (let row of data) {
        let item = {}
        for (let [idx, col] of row.entries()) {
            item[columns[idx]] = col
        }
        items.push(item)
    }
    return items
}

export {isFloat, coloringBases, parseCSV}
