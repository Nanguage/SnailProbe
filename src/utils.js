import PaPa from 'papaparse'
import _ from 'lodash'

const isFloat = (x) => { return !!(x % 1); }

const coloringBases = (seq) => {
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


const parseCSV = (csvtext) => {
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

const reverseComplement = (seq) => {
  let res = []
  let p;
  for (let b of seq.split("").reverse()) {
    switch (b) {
      case 'A':
        p = 'T'
        break
      case 'T':
        p = 'A'
        break
      case 'G':
        p = 'C'
        break
      case 'C':
        p = 'G'
        break
      default:
        p = 'N'
        break
    }
    res.push(p)
  }
  return res.join("")
}

const getPrimerColors = (primer, type, color, armLength) => {
  let colorPrimer1 = (idx) => {
    if (idx < armLength) {
      return color.leftArm
    } else if (idx > primer.length - armLength) {
      return color.rightArm
    } else {
      return color.common
    }
  }

  let colorPirmer2 = (idx) => {
    if (idx > primer.length - armLength - 1) {
      return color.common
    } else if (idx === primer.length - armLength - 1) {
      return color.single
    } else {
      return color.default
    }
  }

  let colorTarget = (idx) => {
    if (idx < armLength) {
      return color.leftArm
    } else if ((idx >= armLength) && (idx < 2*armLength)) {
      return color.rightArm
    } else if (idx === 2*armLength) {
      return color.single
    } else {
      return color.default
    }
  }

  let colors = []
  for (let idx = 0; idx < primer.length; idx ++) {
    if (type === 'p1') {
      // pad-probe
      colors.push(colorPrimer1(idx))
    } else if (type === 'p2') {
      // amp-probe
      colors.push(colorPirmer2(idx))
    } else {
      // target-sequence
      colors.push(colorTarget(idx))
    }
  }

  return colors
}


const coloringPrimer = (primer, type, color, armLength) => {
  let colors = getPrimerColors(primer, type, color, armLength)
  let colored = []
  for (let idx=0; idx<primer.length; idx++) {
    let c = colors[idx]
    let b = primer[idx]
    colored.push(b.fontcolor(c))
  }
  return colored.join("")
}


export {
  isFloat, coloringBases, parseCSV,
  reverseComplement, getPrimerColors,
  coloringPrimer
}
