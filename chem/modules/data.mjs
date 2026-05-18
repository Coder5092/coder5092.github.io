import { rawIsotopeData } from "./isotope_finding/isotopedata.mjs";

export class Element {
  static electronConfigLadder = '1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p 6f 7d 7f'.split(' ');
  static electronConfigMap = {
    's': 2,
    'p': 6,
    'd': 10,
    'f': 14
  };
  static electronShellMaxes = [2, 8, 18, 32, 32, 32, 32];

  constructor(protons, name, symbol, amu, isotopes) {
    this.protons = protons;
    this.name = name;
    this.symbol = symbol;
    this.amu = amu;

    if (isotopes[0] instanceof Isotope) this.allIsotopes = isotopes;
    else this.allIsotopes = isotopes.map(i => {
      return new Isotope(protons, i);
    });

    this.allIsotopes.sort((a, b) => a.amu - b.amu);
  }

  static electronConfig(electrons) {
    let remainingElectrons = electrons;
    let notation = "";
    let ladderIndex = 0;

    while (remainingElectrons > 0) {
      let subshell = this.electronConfigLadder[ladderIndex++];
      let capacity = this.electronConfigMap[subshell[1]];
      let filledElectrons = Math.min(remainingElectrons, capacity);
      remainingElectrons -= filledElectrons;

      notation += subshell + filledElectrons + ' ';
    }

    return notation.trimEnd();
  }

  static electronConfigSimple(electrons) {
    let remainingElectrons = electrons;
    let ladderIndex = 0;
    let shells = [0, 0, 0, 0, 0, 0, 0];

    while (remainingElectrons > 0) {
      let subshell = this.electronConfigLadder[ladderIndex++];
      let capacity = this.electronConfigMap[subshell[1]];
      let filledElectrons = Math.min(remainingElectrons, capacity);
      remainingElectrons -= filledElectrons;

      shells[parseInt(subshell[0]) - 1] += filledElectrons;
    }

    return shells;
  }

  static decay(isotope, type) {
    let targetElement, toReturn;
    let targetProtons = isotope.protons;
    let targetAmu = isotope.amu;
    switch (type) {
      case 'β−':
        targetElement = elements[isotope.protons];
        targetProtons += 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'EC':
      case 'e+':
      case 'ε':
      case 'β+':
        targetElement = elements[isotope.protons - 2];
        targetProtons -= 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'β−β−':
        targetElement = elements[isotope.protons + 1];
        targetProtons += 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'Double EC':
      case 'εε':
      case 'β+β+':
        targetElement = elements[isotope.protons - 3];
        targetProtons -= 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'α':
        targetElement = elements[isotope.protons - 3];
        targetProtons -= 2;
        targetAmu -= 4;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 4)];
        break;
      case 'p':
        targetElement = elements[isotope.protons - 2];
        targetProtons -= 1;
        targetAmu -= 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 1)];
        break;
      case '2p':
        targetElement = elements[isotope.protons - 3];
        targetProtons -= 2;
        targetAmu -= 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 2)];
        break;
      case '3p':
        targetElement = elements[isotope.protons - 4];
        targetProtons -= 3;
        targetAmu -= 3;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 3)];
        break;
      case 'n':
        targetElement = elements[isotope.protons - 1];
        targetAmu -= 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 1)];
        break;
      case '2n':
        targetElement = elements[isotope.protons - 1];
        targetAmu -= 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 2)];
        break;
      case '3n':
        targetElement = elements[isotope.protons - 1];
        targetAmu -= 3;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 3)];
        break;
      case 'd':
        targetElement = elements[isotope.protons - 2];
        targetProtons -= 1;
        targetAmu -= 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 2)];
        break;
      case 't':
        targetElement = elements[isotope.protons - 2];
        targetProtons -= 1;
        targetAmu -= 3;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 3)];
        break;
      case 'β−n':
        return Element.decay(Element.decay(isotope, 'β−'), 'n');
      case 'β−2n':
        return Element.decay(Element.decay(isotope, 'β−'), '2n');
      case 'β−3n':
        return Element.decay(Element.decay(isotope, 'β−'), '3n');
      case 'β+p':
        return Element.decay(Element.decay(isotope, 'β+'), 'p');
      case 'β+2p':
        return Element.decay(Element.decay(isotope, 'β+'), '2p');
      case 'β+3p':
        return Element.decay(Element.decay(isotope, 'β+'), '3p');
      case 'β−α':
        return Element.decay(Element.decay(isotope, 'β−'), 'α');
      case 'β+α':
        return Element.decay(Element.decay(isotope, 'β+'), 'α');
      case 'β−d':
        return Element.decay(Element.decay(isotope, 'β−'), 'd');
      case 'β−t':
        return Element.decay(Element.decay(isotope, 'β−'), 't');
      // case 'CD':
      //   break;
      case 'IT':
        return isotope;
      // case 'SF':
      //   break;
      case 'β+SF':
        return Element.decay(Element.decay(isotope, 'β+'), 'SF');
      case 'β−SF':
        return Element.decay(Element.decay(isotope, 'β−'), 'SF');
      default:
        console.error('unknown decay type: ' + type)
        return null;
    }

    if (toReturn == null) {
      let newIsotope = new Isotope(targetProtons, [targetAmu, null, [], null]);
      elements[targetProtons - 1].allIsotopes.push(newIsotope)
      elements[targetProtons - 1].allIsotopes.sort((a, b) => a.amu - b.amu);
      toReturn = newIsotope;
    }

    return toReturn;
  }
}

export class Isotope {
  constructor(protons, data) {
    this.protons = protons;
    this.amu = data[0];
    this.stable = data[1];
    this.decayTypes = data[2];
    this.halfLife = data[3];
  }
}

export function autoConvert(value, currentUnit, mapping) {
  if (typeof (mapping) == 'string') {
    if (mapping == 'time') mapping = {
      'eon': 864e7 * 36525,
      'Ma': 864e4 * 36525,
      'mill': 86400 * 365250,
      'c': 86400 * 36525,
      'dec': 86400 * 3652.5,
      'yr': 86400 * 365.25,
      'mo': 86400 * 30.4167,
      'wk': 604800,
      'd': 86400,
      'hr': 3600,
      'min': 60,
      's': 1,
      'ms': 1e-3,
      'us': 1e-6,
      'ns': 1e-9,
      'ps': 1e-12,
      'fs': 1e-15,
      'as': 1e-18,
      'zs': 1e-21,
      'ys': 1e-24
    };
    else if (mapping = 'radiation') mapping = {
      'Sv': 1,
      'mSv': 1e-3,
      'uSv': 1e-6,
      'nSv': 1e-9
    };
  }

  let currentValue = value * mapping[currentUnit];
  let keys = Object.keys(mapping).reverse();
  let currentKeyIdx = keys.indexOf(currentUnit);
  if (currentValue > mapping[currentUnit]) {
    while (true) {
      let newValue = currentValue / mapping[keys[++currentKeyIdx]];
      if (newValue < 1 || currentKeyIdx >= keys.length) {
        currentKeyIdx--;
        break;
      }
    }
  } else {
    while (true) {
      let newValue = currentValue / mapping[keys[--currentKeyIdx]];
      if (newValue > 10 || currentKeyIdx < 0) {
        currentKeyIdx++;
        break;
      }
    }
  }

  return `${Math.round(currentValue / mapping[keys[currentKeyIdx]] * 100) / 100} ${keys[currentKeyIdx]}`;
}

let oldElements = [
  new Element(1, "Hydrogen", "H", 1.008, [[1, true, [], -1, 0], [2, true, [], -1, 0], [3, false, ["beta minus"], 388838400, 0.000056]]),
  new Element(2, "Helium", "He", 4.003, [[3, false, ["beta minus"], 2764800, 0.0001], [4, true, [], -1, 0], [6, true, [], -1, 0]]),
  new Element(3, "Lithium", "Li", 6.941, [[6, false, ["beta minus"], 1267833600, 0.00003], [7, true, [], -1, 0]]),
  new Element(4, "Beryllium", "Be", 9.012, [[9, true, [], -1, 0], [10, false, ["beta minus"], 18144000000000, 0.000001]]),
  new Element(5, "Boron", "B", 10.811, [[10, false, ["beta plus"], 1387200, 0.0001], [11, true, [], -1, 0]]),
  new Element(6, "Carbon", "C", 12.011, [[12, true, [], -1, 0], [13, true, [], -1, 0], [14, false, ["beta minus"], 180345600000, 0.000001]]),
  new Element(7, "Nitrogen", "N", 14.007, [[14, false, ["beta plus"], 491400, 0.00008], [15, true, [], -1, 0]]),
  new Element(8, "Oxygen", "O", 15.999, [[16, true, [], -1, 0], [17, true, [], -1, 0], [18, true, [], -1, 0]]),
  new Element(9, "Fluorine", "F", 18.998, [[19, true, [], -1, 0]]),
  new Element(10, "Neon", "Ne", 20.180, [[20, true, [], -1, 0], [21, true, [], -1, 0], [22, true, [], -1, 0]]),
  new Element(11, "Sodium", "Na", 22.990, [[23, true, [], -1, 0], [24, false, ["beta minus"], 86400, 0.00055]]),
  new Element(12, "Magnesium", "Mg", 24.305, [[24, true, [], -1, 0], [25, true, [], -1, 0], [26, true, [], -1, 0]]),
  new Element(13, "Aluminum", "Al", 26.982, [[27, true, [], -1, 0], [26, false, ["beta minus"], 232243200, 0.0001]]),
  new Element(14, "Silicon", "Si", 28.085, [[28, true, [], -1, 0], [29, true, [], -1, 0], [30, true, [], -1, 0]]),
  new Element(15, "Phosphorus", "P", 30.974, [[31, true, [], -1, 0]]),
  new Element(16, "Sulfur", "S", 32.06, [[32, true, [], -1, 0], [33, true, [], -1, 0], [34, true, [], -1, 0], [36, true, [], -1, 0]]),
  new Element(17, "Chlorine", "Cl", 35.45, [[35, true, [], -1, 0], [37, true, [], -1, 0]]),
  new Element(18, "Argon", "Ar", 39.948, [[36, true, [], -1, 0], [38, true, [], -1, 0], [40, false, ["beta minus"], 33803200000000, 0.0000001]]),
  new Element(19, "Potassium", "K", 39.098, [[39, true, [], -1, 0], [40, false, ["beta minus", "beta plus"], 40176000000000, 0.000000001], [41, true, [], -1, 0]]),
  new Element(20, "Calcium", "Ca", 40.078, [[40, true, [], -1, 0], [42, true, [], -1, 0], [43, true, [], -1, 0], [44, true, [], -1, 0], [46, false, ["double beta minus"], 6500000000000000000, 0.000000001], [48, false, ["double beta minus"], 7600000000000000000, 0.000000001]]),
  new Element(21, "Scandium", "Sc", 44.956, [[45, true, [], -1, 0]]),
  new Element(22, "Titanium", "Ti", 47.867, [[46, true, [], -1, 0], [47, true, [], -1, 0], [48, true, [], -1, 0], [49, true, [], -1, 0], [50, true, [], -1, 0]]),
  new Element(23, "Vanadium", "V", 50.942, [[50, false, ["beta plus"], 7614000000000, 0.0000001], [51, true, [], -1, 0]]),
  new Element(24, "Chromium", "Cr", 51.996, [[50, true, [], -1, 0], [52, true, [], -1, 0], [53, true, [], -1, 0], [54, true, [], -1, 0]]),
  new Element(25, "Manganese", "Mn", 54.938, [[55, true, [], -1, 0]]),
  new Element(26, "Iron", "Fe", 55.845, [[54, true, [], -1, 0], [56, true, [], -1, 0], [57, true, [], -1, 0], [58, true, [], -1, 0]]),
  new Element(27, "Cobalt", "Co", 58.933, [[59, true, [], -1, 0]]),
  new Element(28, "Nickel", "Ni", 58.693, [[58, true, [], -1, 0], [60, true, [], -1, 0], [61, true, [], -1, 0], [62, true, [], -1, 0], [64, false, ["beta minus"], 88569600000000, 0.000000001]]),
  new Element(29, "Copper", "Cu", 63.546, [[63, true, [], -1, 0], [65, true, [], -1, 0]]),
  new Element(30, "Zinc", "Zn", 65.38, [[64, true, [], -1, 0], [66, true, [], -1, 0], [67, true, [], -1, 0], [68, true, [], -1, 0], [70, false, ["double beta minus"], 1800000000000000000, 0.000000001]]),
  new Element(31, "Gallium", "Ga", 69.723, [[69, true, [], -1, 0], [71, true, [], -1, 0]]),
  new Element(32, "Germanium", "Ge", 72.630, [[70, true, [], -1, 0], [72, true, [], -1, 0], [73, true, [], -1, 0], [74, true, [], -1, 0], [76, false, ["double beta minus"], 1700000000000000000, 0.000000001]]),
  new Element(33, "Arsenic", "As", 74.922, [[75, true, [], -1, 0]]),
  new Element(34, "Selenium", "Se", 78.96, [[74, true, [], -1, 0], [76, true, [], -1, 0], [77, true, [], -1, 0], [78, true, [], -1, 0], [80, true, [], -1, 0], [82, false, ["beta minus"], 5000000000000000000, 0.000000001]]),
  new Element(35, "Bromine", "Br", 79.904, [[79, true, [], -1, 0], [81, true, [], -1, 0]]),
  new Element(36, "Krypton", "Kr", 83.798, [[78, true, [], -1, 0], [80, true, [], -1, 0], [82, true, [], -1, 0], [83, true, [], -1, 0], [84, true, [], -1, 0], [86, false, ["double beta minus"], 55200000000000000000, 0.000000001]]),
  new Element(37, "Rubidium", "Rb", 85.468, [[85, true, [], -1, 0], [87, false, ["beta minus"], 1398355200000, 0.0000001]]),
  new Element(38, "Strontium", "Sr", 87.62, [[84, true, [], -1, 0], [86, true, [], -1, 0], [87, true, [], -1, 0], [88, true, [], -1, 0]]),
  new Element(39, "Yttrium", "Y", 88.906, [[89, true, [], -1, 0]]),
  new Element(40, "Zirconium", "Zr", 91.224, [[90, true, [], -1, 0], [91, true, [], -1, 0], [92, true, [], -1, 0], [94, true, [], -1, 0], [96, false, ["double beta minus"], 2000000000000000000, 0.000000001]]),
  new Element(41, "Niobium", "Nb", 92.906, [[93, true, [], -1, 0]]),
  new Element(42, "Molybdenum", "Mo", 95.95, [[92, true, [], -1, 0], [94, true, [], -1, 0], [95, true, [], -1, 0], [96, true, [], -1, 0], [97, true, [], -1, 0], [98, true, [], -1, 0], [100, false, ["double beta minus"], 9300000000000000000, 0.000000001]]),
  new Element(43, "Technetium", "Tc", 98, [[97, false, ["beta minus"], 2592000, 0.00001], [98, false, ["beta minus"], 3600, 0.0001], [99, false, ["beta minus"], 2106000000, 0.000001]]),
  new Element(44, "Ruthenium", "Ru", 101.07, [[96, true, [], -1, 0], [98, true, [], -1, 0], [99, true, [], -1, 0], [100, true, [], -1, 0], [101, true, [], -1, 0], [102, true, [], -1, 0], [104, true, [], -1, 0]]),
  new Element(45, "Rhodium", "Rh", 102.906, [[103, true, [], -1, 0]]),
  new Element(46, "Palladium", "Pd", 106.42, [[102, true, [], -1, 0], [104, true, [], -1, 0], [105, true, [], -1, 0], [106, true, [], -1, 0], [108, true, [], -1, 0], [110, true, [], -1, 0]]),
  new Element(47, "Silver", "Ag", 107.868, [[107, true, [], -1, 0], [109, true, [], -1, 0]]),
  new Element(48, "Cadmium", "Cd", 112.411, [[106, true, [], -1, 0], [108, true, [], -1, 0], [110, true, [], -1, 0], [111, true, [], -1, 0], [112, true, [], -1, 0], [113, false, ["beta minus"], 1044960000000000, 0.000000001], [114, true, [], -1, 0], [116, false, ["double beta minus"], 7700000000000000000, 0.000000001]]),
  new Element(49, "Indium", "In", 114.818, [[113, true, [], -1, 0], [115, false, ["beta minus"], 4020000000000000000, 0.000000001]]),
  new Element(50, "Tin", "Sn", 118.710, [[112, true, [], -1, 0], [114, true, [], -1, 0], [115, true, [], -1, 0], [116, true, [], -1, 0], [117, true, [], -1, 0], [118, true, [], -1, 0], [119, true, [], -1, 0], [120, true, [], -1, 0], [122, true, [], -1, 0], [124, false, ["double beta minus"], 1100000000000000000, 0.000000001]]),
  new Element(51, "Antimony", "Sb", 121.760, [[121, true, [], -1, 0], [123, true, [], -1, 0]]),
  new Element(52, "Tellurium", "Te", 127.60, [[120, true, [], -1, 0], [122, true, [], -1, 0], [123, false, ["beta minus"], 7776000000000000, 0.000000001], [124, true, [], -1, 0], [125, true, [], -1, 0], [126, true, [], -1, 0], [128, false, ["double beta minus"], 8000000000000000000, 0.000000001], [130, false, ["double beta minus"], 8000000000000000000, 0.000000001]]),
  new Element(53, "Iodine", "I", 126.904, [[127, true, [], -1, 0]]),
  new Element(54, "Xenon", "Xe", 131.29, [[124, true, [], -1, 0], [126, false, ["double beta plus"], 4000000000000000000, 0.000000001], [128, true, [], -1, 0], [129, true, [], -1, 0], [130, true, [], -1, 0], [131, true, [], -1, 0], [132, true, [], -1, 0], [134, true, [], -1, 0], [136, false, ["double beta minus"], 22000000000000000000, 0.000000001]]),
  new Element(55, "Cesium", "Cs", 132.905, [[133, true, [], -1, 0]]),
  new Element(56, "Barium", "Ba", 137.327, [[130, false, ["double beta plus"], 2000000000000000000, 0.000000001], [132, false, ["double beta plus"], 7000000000000000000, 0.000000001], [134, true, [], -1, 0], [135, true, [], -1, 0], [136, true, [], -1, 0], [137, true, [], -1, 0], [138, true, [], -1, 0]]),
  new Element(57, "Lanthanum", "La", 138.905, [[138, false, ["beta minus"], 1000000000000, 0.000000001], [139, true, [], -1, 0]]),
  new Element(58, "Cerium", "Ce", 140.116, [[136, false, ["double beta plus"], 10000000000000000000, 0.000000001], [138, true, [], -1, 0], [140, true, [], -1, 0], [142, false, ["alpha decay"], 4900000000000000000, 0.00000001]]),
  new Element(59, "Praseodymium", "Pr", 140.908, [[141, true, [], -1, 0]]),
  new Element(60, "Neodymium", "Nd", 144.242, [[142, true, [], -1, 0], [143, true, [], -1, 0], [144, false, ["alpha decay"], 2320000000000000000, 0.0000001], [145, true, [], -1, 0], [146, true, [], -1, 0], [148, false, ["alpha decay"], 5000000000000000000, 0.00000001], [150, false, ["double beta minus"], 10000000000000000000, 0.000000001]]),
  new Element(61, "Promethium", "Pm", 145, [[145, false, ["beta minus"], 2592000, 0.00001]]),
  new Element(62, "Samarium", "Sm", 150.36, [[144, true, [], -1, 0], [147, false, ["alpha decay"], 4050000000000000000, 0.00000001], [149, false, ["alpha decay"], 1400000000000000000, 0.00000001], [150, false, ["alpha decay"], 7000000000000000000, 0.000000001], [151, true, [], -1, 0], [152, true, [], -1, 0], [154, true, [], -1, 0]]),
  new Element(63, "Europium", "Eu", 151.964, [[151, true, [], -1, 0], [153, true, [], -1, 0]]),
  new Element(64, "Gadolinium", "Gd", 157.25, [[152, false, ["alpha decay"], 1310000000000000000, 0.00000001], [154, false, ["alpha decay"], 2400000000000000000, 0.00000001], [155, true, [], -1, 0], [156, true, [], -1, 0], [157, true, [], -1, 0], [158, true, [], -1, 0], [160, true, [], -1, 0]]),
  new Element(65, "Terbium", "Tb", 158.925, [[159, true, [], -1, 0]]),
  new Element(66, "Dysprosium", "Dy", 162.500, [[156, true, [], -1, 0], [158, true, [], -1, 0], [160, true, [], -1, 0], [161, true, [], -1, 0], [162, true, [], -1, 0], [163, true, [], -1, 0], [164, true, [], -1, 0]]),
  new Element(67, "Holmium", "Ho", 164.930, [[165, true, [], -1, 0]]),
  new Element(68, "Erbium", "Er", 167.259, [[162, true, [], -1, 0], [164, true, [], -1, 0], [166, true, [], -1, 0], [167, true, [], -1, 0], [168, true, [], -1, 0], [170, true, [], -1, 0]]),
  new Element(69, "Thulium", "Tm", 168.934, [[169, true, [], -1, 0]]),
  new Element(70, "Ytterbium", "Yb", 173.04, [[168, true, [], -1, 0], [170, true, [], -1, 0], [171, true, [], -1, 0], [172, true, [], -1, 0], [173, true, [], -1, 0], [174, true, [], -1, 0], [176, true, [], -1, 0]]),
  new Element(71, "Lutetium", "Lu", 174.967, [[175, true, [], -1, 0], [176, false, ["beta minus"], 36000000000000, 0.000000001]]),
  new Element(72, "Hafnium", "Hf", 178.49, [[174, false, ["alpha decay"], 2000000000000000000, 0.00000001], [176, true, [], -1, 0], [177, true, [], -1, 0], [178, true, [], -1, 0], [179, true, [], -1, 0], [180, true, [], -1, 0]]),
  new Element(73, "Tantalum", "Ta", 180.948, [[180, false, ["beta minus"], 28000000000000, 0.000000001], [181, true, [], -1, 0]]),
  new Element(74, "Tungsten", "W", 183.84, [[180, true, [], -1, 0], [182, true, [], -1, 0], [183, true, [], -1, 0], [184, true, [], -1, 0], [186, false, ["alpha decay"], 8300000000000000000, 0.00000001]]),
  new Element(75, "Rhenium", "Re", 186.207, [[185, true, [], -1, 0], [187, false, ["beta minus"], 42000000000000000000, 0.000000001]]),
  new Element(76, "Osmium", "Os", 190.23, [[184, false, ["alpha decay"], 56000000000000000000, 0.000000001], [186, false, ["alpha decay"], 2000000000000000000, 0.00000001], [187, true, [], -1, 0], [188, true, [], -1, 0], [189, true, [], -1, 0], [190, true, [], -1, 0], [192, true, [], -1, 0]]),
  new Element(77, "Iridium", "Ir", 192.217, [[191, true, [], -1, 0], [193, true, [], -1, 0]]),
  new Element(78, "Platinum", "Pt", 195.084, [[190, true, [], -1, 0], [192, true, [], -1, 0], [194, true, [], -1, 0], [195, true, [], -1, 0], [196, true, [], -1, 0], [198, true, [], -1, 0]]),
  new Element(79, "Gold", "Au", 196.967, [[197, true, [], -1, 0]]),
  new Element(80, "Mercury", "Hg", 200.59, [[196, true, [], -1, 0], [198, true, [], -1, 0], [199, true, [], -1, 0], [200, true, [], -1, 0], [201, true, [], -1, 0], [202, true, [], -1, 0], [204, true, [], -1, 0]]),
  new Element(81, "Thallium", "Tl", 204.383, [[203, true, [], -1, 0], [205, true, [], -1, 0]]),
  new Element(82, "Lead", "Pb", 207.2, [[204, true, [], -1, 0], [206, true, [], -1, 0], [207, true, [], -1, 0], [208, true, [], -1, 0]]),
  new Element(83, "Bismuth", "Bi", 208.980, [[209, false, ["alpha decay"], 3000000000000000000, 0.00000001]]),
  new Element(84, "Polonium", "Po", 209, [[209, false, ["alpha decay"], 8760, 0.00001]]),
  new Element(85, "Astatine", "At", 210, [[210, false, ["beta minus"], 28800, 0.00001]]),
  new Element(86, "Radon", "Rn", 222, [[222, false, ["alpha decay"], 259200, 0.0001]]),
  new Element(87, "Francium", "Fr", 223, [[223, false, ["beta minus"], 1260, 0.0001]]),
  new Element(88, "Radium", "Ra", 226, [[226, false, ["alpha decay"], 50400000000, 0.01]]),
  new Element(89, "Actinium", "Ac", 227, [[227, false, ["beta minus"], 681600, 0.001]]),
  new Element(90, "Thorium", "Th", 232.038, [[232, false, ["alpha decay"], 407769600000000000, 0.00001]]),
  new Element(91, "Protactinium", "Pa", 231.036, [[231, false, ["alpha decay"], 1036800000000000000, 0.00001]]),
  new Element(92, "Uranium", "U", 238.029, [[235, false, ["alpha decay"], 25567440000000000000, 0.00001], [238, false, ["alpha decay"], 141012000000000000000, 0.000001]]),
  new Element(93, "Neptunium", "Np", 237, [[237, false, ["alpha decay"], 68256000000000000000, 0.00001]]),
  new Element(94, "Plutonium", "Pu", 244, [[244, false, ["alpha decay"], 760320000000000000000, 0.00001]]),
  new Element(95, "Americium", "Am", 243, [[243, false, ["alpha decay"], 28296000000000000000, 0.0001]]),
  new Element(96, "Curium", "Cm", 247, [[247, false, ["alpha decay"], 47304000000000000000, 0.0001]]),
  new Element(97, "Berkelium", "Bk", 247, [[247, false, ["alpha decay"], 33408000000000000000, 0.0001]]),
  new Element(98, "Californium", "Cf", 251, [[251, false, ["alpha decay"], 32659200000000000000, 0.001]]),
  new Element(99, "Einsteinium", "Es", 252, [[252, false, ["alpha decay"], 37152000000000000, 0.001]]),
  new Element(100, "Fermium", "Fm", 257, [[257, false, ["alpha decay"], 9072000000000000000, 0.001]]),
  new Element(101, "Mendelevium", "Md", 258, [[258, false, ["beta minus"], 5184000, 0.001]]),
  new Element(102, "Nobelium", "No", 259, [[259, false, ["alpha decay"], 3600, 0.001]]),
  new Element(103, "Lawrencium", "Lr", 266, [[266, false, ["alpha decay"], 36000, 0.001]]),
  new Element(104, "Rutherfordium", "Rf", 267, [[267, false, ["alpha decay"], 1800, 0.001]]),
  new Element(105, "Dubnium", "Db", 268, [[268, false, ["alpha decay"], 28800, 0.001]]),
  new Element(106, "Seaborgium", "Sg", 269, [[269, false, ["alpha decay"], 1800, 0.001]]),
  new Element(107, "Bohrium", "Bh", 270, [[270, false, ["alpha decay"], 61, 0.001]]),
  new Element(108, "Hassium", "Hs", 277, [[277, false, ["alpha decay"], 900, 0.001]]),
  new Element(109, "Meitnerium", "Mt", 278, [[278, false, ["alpha decay"], 7200, 0.001]]),
  new Element(110, "Darmstadtium", "Ds", 281, [[281, false, ["alpha decay"], 1, 0.001]]),
  new Element(111, "Roentgenium", "Rg", 282, [[282, false, ["alpha decay"], 1, 0.001]]),
  new Element(112, "Copernicium", "Cn", 285, [[285, false, ["alpha decay"], 5400, 0.001]]),
  new Element(113, "Nihonium", "Nh", 286, [[286, false, ["alpha decay"], 1, 0.001]]),
  new Element(114, "Flerovium", "Fl", 289, [[289, false, ["alpha decay"], 1, 0.001]]),
  new Element(115, "Moscovium", "Mc", 290, [[290, false, ["alpha decay"], 1, 0.001]]),
  new Element(116, "Livermorium", "Lv", 293, [[293, false, ["alpha decay"], 1, 0.001]]),
  new Element(117, "Tennessine", "Ts", 294, [[294, false, ["alpha decay"], 1, 0.001]]),
  new Element(118, "Oganesson", "Og", 294, [[294, false, ["alpha decay"], 1, 0.001]]),
];
let fixedElements = [
  new Element(1, "Hydrogen", "H", 1.008, [
    [1, true, [], -1, 0],
    [2, true, [], -1, 0],
    [3, false, ["beta minus"], 388789632, 0]
  ]),

  new Element(2, "Helium", "He", 4.0026, [
    [3, true, [], -1, 0],
    [4, true, [], -1, 0],
    [6, false, ["beta minus"], 0.8067, 0]
  ]),

  new Element(3, "Lithium", "Li", 6.94, [
    [6, false, ["beta minus"], 1198396800, 0],
    [7, true, [], -1, 0]
  ]),

  new Element(4, "Beryllium", "Be", 9.0122, [
    [9, true, [], -1, 0],
    [10, false, ["beta minus"], 4.73364e13, 0]
  ]),

  new Element(5, "Boron", "B", 10.81, [
    [10, false, ["beta plus"], 1198.8, 0],
    [11, true, [], -1, 0]
  ]),

  new Element(6, "Carbon", "C", 12.011, [
    [12, true, [], -1, 0],
    [13, true, [], -1, 0],
    [14, false, ["beta minus"], 1.7987e11, 0]
  ]),

  new Element(7, "Nitrogen", "N", 14.007, [
    [14, true, [], -1, 0],
    [15, true, [], -1, 0]
  ]),

  new Element(8, "Oxygen", "O", 15.999, [
    [16, true, [], -1, 0],
    [17, true, [], -1, 0],
    [18, true, [], -1, 0]
  ]),

  new Element(9, "Fluorine", "F", 18.998, [
    [19, true, [], -1, 0]
  ]),

  new Element(10, "Neon", "Ne", 20.180, [
    [20, true, [], -1, 0],
    [21, true, [], -1, 0],
    [22, true, [], -1, 0]
  ]),

  new Element(11, "Sodium", "Na", 22.990, [
    [23, true, [], -1, 0],
    [24, false, ["beta minus"], 53913.6, 0]
  ]),

  new Element(12, "Magnesium", "Mg", 24.305, [
    [24, true, [], -1, 0],
    [25, true, [], -1, 0],
    [26, true, [], -1, 0]
  ]),

  new Element(13, "Aluminum", "Al", 26.982, [
    [27, true, [], -1, 0],
    [26, false, ["beta plus"], 4.54752e13, 0]
  ]),

  new Element(14, "Silicon", "Si", 28.085, [
    [28, true, [], -1, 0],
    [29, true, [], -1, 0],
    [30, true, [], -1, 0]
  ]),

  new Element(15, "Phosphorus", "P", 30.974, [
    [31, true, [], -1, 0]
  ]),

  new Element(16, "Sulfur", "S", 32.06, [
    [32, true, [], -1, 0],
    [33, true, [], -1, 0],
    [34, true, [], -1, 0],
    [36, true, [], -1, 0]
  ]),

  new Element(17, "Chlorine", "Cl", 35.45, [
    [35, true, [], -1, 0],
    [37, true, [], -1, 0]
  ]),

  new Element(18, "Argon", "Ar", 39.948, [
    [36, true, [], -1, 0],
    [38, true, [], -1, 0],
    [40, true, [], -1, 0]
  ]),

  new Element(19, "Potassium", "K", 39.0983, [
    [39, true, [], -1, 0],
    [40, false, ["beta minus", "electron capture"], 3.938e16, 0],
    [41, true, [], -1, 0]
  ]),

  new Element(20, "Calcium", "Ca", 40.078, [
    [40, true, [], -1, 0],
    [42, true, [], -1, 0],
    [43, true, [], -1, 0],
    [44, true, [], -1, 0],
    [46, true, [], -1, 0],
    [48, false, ["double beta minus"], 1.26e19, 0]
  ]),

  new Element(24, "Chromium", "Cr", 51.9961, [
    [50, false, ["double electron capture"], 4.0e25, 0],
    [52, true, [], -1, 0],
    [53, true, [], -1, 0],
    [54, true, [], -1, 0]
  ]),

  new Element(52, "Tellurium", "Te", 127.60, [
    [120, true, [], -1, 0],
    [122, true, [], -1, 0],
    [123, true, [], -1, 0],
    [124, true, [], -1, 0],
    [125, true, [], -1, 0],
    [126, true, [], -1, 0],
    [128, false, ["double beta minus"], 6.9e31, 0],
    [130, false, ["double beta minus"], 2.5e28, 0]
  ]),

  new Element(54, "Xenon", "Xe", 131.293, [
    [124, false, ["double electron capture"], 5.8e21, 0],
    [126, false, ["double electron capture"], 3.0e24, 0],
    [128, true, [], -1, 0],
    [129, true, [], -1, 0],
    [130, true, [], -1, 0],
    [131, true, [], -1, 0],
    [132, true, [], -1, 0],
    [134, true, [], -1, 0],
    [136, false, ["double beta minus"], 6.9e21, 0]
  ]),

  new Element(56, "Barium", "Ba", 137.327, [
    [130, false, ["double electron capture"], 1.6e21, 0],
    [132, false, ["double electron capture"], 9.5e24, 0],
    [134, true, [], -1, 0],
    [135, true, [], -1, 0],
    [136, true, [], -1, 0],
    [137, true, [], -1, 0],
    [138, true, [], -1, 0]
  ]),

  new Element(62, "Samarium", "Sm", 150.36, [
    [144, false, ["alpha decay"], 6.8e22, 0],
    [147, false, ["alpha decay"], 3.4e18, 0],
    [148, true, [], -1, 0],
    [149, false, ["alpha decay"], 6.3e22, 0],
    [150, true, [], -1, 0],
    [152, true, [], -1, 0],
    [154, true, [], -1, 0]
  ]),

  new Element(74, "Tungsten", "W", 183.84, [
    [180, false, ["alpha decay"], 5.7e25, 0],
    [182, true, [], -1, 0],
    [183, true, [], -1, 0],
    [184, true, [], -1, 0],
    [186, false, ["alpha decay"], 4.7e25, 0]
  ]),

  new Element(78, "Platinum", "Pt", 195.084, [
    [190, false, ["alpha decay"], 2.0e19, 0],
    [192, true, [], -1, 0],
    [194, true, [], -1, 0],
    [195, true, [], -1, 0],
    [196, true, [], -1, 0],
    [198, true, [], -1, 0]
  ]),

  new Element(83, "Bismuth", "Bi", 208.980, [
    [209, false, ["alpha decay"], 6.0e26, 0]
  ]),

  new Element(84, "Polonium", "Po", 209, [
    [209, false, ["alpha decay"], 3.94e9, 0]
  ]),

  new Element(89, "Actinium", "Ac", 227, [
    [227, false, ["beta minus", "alpha decay"], 6.88e8, 0]
  ]),

  new Element(100, "Fermium", "Fm", 257, [
    [257, false, ["alpha decay"], 8.64e6, 0]
  ])
];
let fixedElementNames = fixedElements.map(e => e.name);

export const elements = oldElements.map(e => {
  if (fixedElementNames.includes(e.name)) return fixedElements[fixedElementNames.indexOf(e.name)];
  else return e;
}).map((e, idx) => new Element(e.protons, e.name, e.symbol, e.amu, rawIsotopeData[e.protons - 1]));
export const elementIndexing = elements.map(e => e.symbol);
export const elementNameIndexing = elements.map(e => e.name);