export class Element {
  static electronConfigLadder = '1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s 5f 6d 7p 6f 7d 7f'.split(' ');
  static electronConfigMap = {
    's': 2,
    'p': 6,
    'd': 10,
    'f': 14
  };
  static electronShellMaxes = [2, 8, 18, 32, 32, 32, 32];

  constructor(protons, name, symbol, amu, isotopes, syntheticIsotopes) {
    this.protons = protons;
    this.name = name;
    this.symbol = symbol;
    this.amu = amu;

    if (isotopes[0] instanceof Isotope) this.isotopes = isotopes;
    else this.isotopes = isotopes.map(i => {
      return new Isotope(protons, i);
    });

    this.syntheticIsotopes = syntheticIsotopes ?? [];
    this.allIsotopes = this.isotopes.concat(this.syntheticIsotopes);
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
      case 'beta minus':
        targetElement = elements[isotope.protons];
        targetProtons += 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'electron capture':
      case 'beta plus':
        targetElement = elements[isotope.protons - 2];
        targetProtons -= 1;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'double beta minus':
        targetElement = elements[isotope.protons + 1];
        targetProtons += 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'double electron capture':
      case 'double beta plus':
        targetElement = elements[isotope.protons - 3];
        targetProtons -= 2;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu)];
        break;
      case 'alpha decay':
        targetElement = elements[isotope.protons - 3];
        targetProtons -= 2;
        targetAmu -= 4;
        toReturn = targetElement.allIsotopes[targetElement.allIsotopes.map(i => i.amu).indexOf(isotope.amu - 4)];
        break;
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
let syntheticIsotopes = [
  // H (1) - Synthetic isotopes excluding stable isotopes 1,2
  [new Isotope(1, [3, false, ["beta minus"], 388838400, 0.000056])],
  // He (2) - Synthetic isotopes excluding stable isotopes 4,6
  [new Isotope(2, [3, false, ["beta minus"], 2764800, 0.0001])],
  // Li (3) - Synthetic isotopes excluding natural 6,7
  [new Isotope(3, [8, false, ["beta minus"], 839.9, 0.001]), new Isotope(3, [9, false, ["beta minus"], 178.3, 0.001]), new Isotope(3, [11, false, ["beta minus"], 8.59, 0.001])],
  // Be (4) - Synthetic isotopes excluding natural 9
  [new Isotope(4, [5, false, ["beta plus"], 1.388, 0.001]), new Isotope(4, [8, false, ["alpha decay"], 1e-13, 0.001]), new Isotope(4, [11, false, ["beta minus"], 13.81, 0.001])],
  // B (5) - Synthetic isotopes excluding natural 10,11
  [new Isotope(5, [8, false, ["alpha decay"], 1e-12, 0.001]), new Isotope(5, [12, false, ["beta minus"], 0.0202, 0.001])],
  // C (6) - Synthetic isotopes excluding natural 12,13 (14 is synthetic but natural in environment)
  [new Isotope(6, [10, false, ["alpha decay"], 2e-11, 0.001]), new Isotope(6, [11, false, ["beta plus"], 1223.4, 0.001]), new Isotope(6, [15, false, ["beta minus"], 2.45, 0.001])],
  // N (7) - Synthetic isotopes excluding natural 14,15
  [new Isotope(7, [13, false, ["beta plus"], 598.8, 0.001]), new Isotope(7, [16, false, ["beta minus"], 7.13, 0.001]), new Isotope(7, [17, false, ["beta minus"], 4.17, 0.001])],
  // O (8) - Synthetic isotopes excluding natural 16,17,18
  [new Isotope(8, [14, false, ["beta plus"], 70.64, 0.001]), new Isotope(8, [15, false, ["beta plus"], 176.4, 0.001]), new Isotope(8, [19, false, ["beta minus"], 26.47, 0.001]), new Isotope(8, [20, false, ["beta minus"], 13.51, 0.001])],
  // F (9) - Synthetic isotopes excluding natural 19
  [new Isotope(9, [17, false, ["beta plus"], 64.49, 0.001]), new Isotope(9, [18, false, ["beta plus"], 109.77, 0.001]), new Isotope(9, [20, false, ["beta minus"], 11.0, 0.001]), new Isotope(9, [21, false, ["beta minus"], 4.158, 0.001])],
  // Ne (10) - Synthetic isotopes excluding natural 20,21,22
  [new Isotope(10, [18, false, ["beta minus"], 1.672, 0.001]), new Isotope(10, [19, false, ["beta plus"], 17.22, 0.001]), new Isotope(10, [24, false, ["beta minus"], 3.38, 0.001])],
  // Na (11) - Synthetic isotopes excluding natural 23
  [new Isotope(11, [22, false, ["beta plus"], 2.6019, 0.001]), new Isotope(11, [25, false, ["beta minus"], 59.1, 0.001]), new Isotope(11, [26, false, ["beta minus"], 1.071, 0.001])],
  // Mg (12) - Synthetic isotopes excluding natural 24,25,26
  [new Isotope(12, [23, false, ["beta plus"], 11.317, 0.001]), new Isotope(12, [27, false, ["beta minus"], 591.1, 0.001]), new Isotope(12, [28, false, ["beta minus"], 20.915, 0.001]), new Isotope(12, [29, false, ["beta minus"], 1.3, 0.001])],
  // Al (13) - Synthetic isotopes excluding natural 27
  [new Isotope(13, [24, false, ["alpha decay"], 2.053, 0.001]), new Isotope(13, [28, false, ["beta minus"], 2.2414, 0.001]), new Isotope(13, [29, false, ["beta minus"], 6.52, 0.001])],
  // Si (14) - Synthetic isotopes excluding natural 28,29,30
  [new Isotope(14, [25, false, ["beta plus"], 220.8, 0.001]), new Isotope(14, [26, false, ["beta plus"], 2.2345, 0.001]), new Isotope(14, [31, false, ["beta minus"], 157.36, 0.001]), new Isotope(14, [32, false, ["beta minus"], 276000000000, 0.001])],
  // P (15) - Synthetic isotopes excluding natural 31
  [new Isotope(15, [30, false, ["beta plus"], 2.498, 0.001]), new Isotope(15, [32, false, ["beta minus"], 1232.4, 0.001]), new Isotope(15, [33, false, ["beta minus"], 25.34, 0.001]), new Isotope(15, [34, false, ["beta minus"], 12.43, 0.001])],
  // S (16) - Synthetic isotopes excluding natural 32,33,34,36
  [new Isotope(16, [31, false, ["beta plus"], 2.572, 0.001]), new Isotope(16, [35, false, ["beta minus"], 7524000, 0.001]), new Isotope(16, [37, false, ["beta minus"], 305.5, 0.001]), new Isotope(16, [38, false, ["beta minus"], 170.3, 0.001])],
  // Cl (17) - Synthetic isotopes excluding natural 35,37
  [new Isotope(17, [34, false, ["beta plus"], 1.526, 0.001]), new Isotope(17, [36, false, ["beta minus"], 301000000, 0.001]), new Isotope(17, [38, false, ["beta minus"], 637.0, 0.001]), new Isotope(17, [39, false, ["beta minus"], 56.2, 0.001])],
  // Ar (18) - Synthetic isotopes excluding natural 36,38,40
  [new Isotope(18, [37, false, ["electron capture"], 35.04, 0.001]), new Isotope(18, [39, false, ["beta minus"], 268, 0.001]), new Isotope(18, [42, false, ["beta minus"], 32.9, 0.001])],
  // K (19) - Synthetic isotopes excluding natural 39,41
  [new Isotope(19, [42, false, ["beta minus"], 44159.04, 0.001]), new Isotope(19, [43, false, ["beta minus"], 370.2, 0.001]), new Isotope(19, [44, false, ["beta minus"], 22.3, 0.001])],
  // Ca (20) - Synthetic isotopes excluding natural 40,42,43,44,46,48
  [new Isotope(20, [41, false, ["beta plus"], 99360.0, 0.001]), new Isotope(20, [45, false, ["beta plus"], 162.67, 0.001]), new Isotope(20, [47, false, ["beta minus"], 4.536, 0.001]), new Isotope(20, [49, false, ["beta minus"], 8.718, 0.001])],
  // Sc (21) - Synthetic isotopes excluding natural 45
  [new Isotope(21, [46, false, ["beta plus"], 83.79, 0.001]), new Isotope(21, [47, false, ["beta minus"], 1261440, 0.001]), new Isotope(21, [48, false, ["beta minus"], 43.67, 0.001]), new Isotope(21, [49, false, ["beta minus"], 55.6, 0.001])],
  // Ti (22) - Synthetic isotopes excluding natural 46,47,48,49,50
  [new Isotope(22, [44, false, ["alpha decay"], 63072000, 0.001]), new Isotope(22, [51, false, ["beta minus"], 368.3, 0.001]), new Isotope(22, [52, false, ["beta minus"], 1.6, 0.001])],
  // V (23) - Synthetic isotopes excluding natural 51
  [new Isotope(23, [49, false, ["beta plus"], 330.0, 0.001]), new Isotope(23, [52, false, ["beta minus"], 3.75, 0.001]), new Isotope(23, [53, false, ["beta minus"], 1.60, 0.001])],
  // Cr (24) - Synthetic isotopes excluding natural 50,52,53,54
  [new Isotope(24, [51, false, ["electron capture"], 2754267.6, 0.001]), new Isotope(24, [55, false, ["beta minus"], 3159000, 0.001]), new Isotope(24, [56, false, ["beta minus"], 300.3, 0.001])],
  // Mn (25) - Synthetic isotopes excluding natural 55
  [new Isotope(25, [54, false, ["beta plus"], 312.12, 0.001]), new Isotope(25, [56, false, ["beta minus"], 9.293, 0.001]), new Isotope(25, [57, false, ["beta minus"], 85.6, 0.001])],
  // Fe (26) - Synthetic isotopes excluding natural 54,56,57,58
  [new Isotope(26, [55, false, ["electron capture"], 999999999999, 0.001]), new Isotope(26, [59, false, ["beta minus"], 1544688, 0.001]), new Isotope(26, [60, false, ["beta minus"], 1000000000, 0.001])],
  // Co (27) - Synthetic isotopes excluding natural 59
  [new Isotope(27, [57, false, ["electron capture"], 27129600, 0.001]), new Isotope(27, [58, false, ["beta plus", "electron capture"], 1925.28, 0.001]), new Isotope(27, [60, false, ["beta minus"], 1925.68, 0.001])],
  // Ni (28) - Synthetic isotopes excluding natural 58,60,61,62,64
  [new Isotope(28, [63, false, ["beta minus"], 100.1, 0.001]), new Isotope(28, [65, false, ["beta minus"], 2.517, 0.001]), new Isotope(28, [66, false, ["beta minus"], 54.6, 0.001])],
  // Cu (29) - Synthetic isotopes excluding natural 63,65
  [new Isotope(29, [62, false, ["beta plus"], 579.5, 0.001]), new Isotope(29, [64, false, ["beta plus", "beta minus"], 45396.0, 0.001]), new Isotope(29, [67, false, ["beta minus"], 148752, 0.001])],
  // Zn (30) - Synthetic isotopes excluding natural 64,66,67,68,70
  [new Isotope(30, [69, false, ["beta minus"], 56.4, 0.001]), new Isotope(30, [71, false, ["beta minus"], 2.4, 0.001]), new Isotope(30, [72, false, ["beta minus"], 46.5, 0.001])],
  // Ga (31) - Synthetic isotopes excluding natural 69,71
  [new Isotope(31, [67, false, ["electron capture"], 79704, 0.001]), new Isotope(31, [68, false, ["beta plus"], 3061.2, 0.001]), new Isotope(31, [70, false, ["beta minus"], 518.4, 0.001]), new Isotope(31, [72, false, ["beta minus"], 14.095, 0.001])],
  // Ge (32) - Synthetic isotopes excluding natural 70,72,73,74,76
  [new Isotope(32, [75, false, ["electron capture"], 82800, 0.001]), new Isotope(32, [77, false, ["beta minus"], 11.3, 0.001]), new Isotope(32, [78, false, ["beta minus"], 88.8, 0.001])],
  // As (33) - Synthetic isotopes excluding natural 75
  [new Isotope(33, [74, false, ["beta plus", "electron capture"], 380160, 0.001]), new Isotope(33, [76, false, ["beta minus"], 26.32, 0.001]), new Isotope(33, [77, false, ["beta minus"], 38.83, 0.001]), new Isotope(33, [78, false, ["beta minus"], 151.6, 0.001])],
  // Se (34) - Synthetic isotopes excluding natural 74,76,77,78,80,82
  [new Isotope(34, [75, false, ["electron capture"], 119.78, 0.001]), new Isotope(34, [79, false, ["beta minus"], 295000, 0.001]), new Isotope(34, [81, false, ["beta minus"], 18.45, 0.001])],
  // Br (35) - Synthetic isotopes excluding natural 79,81
  [new Isotope(35, [77, false, ["electron capture"], 57.04, 0.001]), new Isotope(35, [80, false, ["beta minus", "electron capture"], 17856000, 0.001]), new Isotope(35, [82, false, ["beta minus"], 35.3, 0.001]), new Isotope(35, [83, false, ["beta minus"], 2.4, 0.001])],
  // Kr (36) - Synthetic isotopes excluding natural 78,80,82,83,84,86
  [new Isotope(36, [79, false, ["electron capture"], 35.04, 0.001]), new Isotope(36, [81, false, ["beta minus"], 229000, 0.001]), new Isotope(36, [85, false, ["beta minus"], 10.76, 0.001])],
  // Rb (37) - Synthetic isotopes excluding natural 85,87
  [new Isotope(37, [84, false, ["beta plus"], 32.82, 0.001]), new Isotope(37, [86, false, ["beta minus"], 18.65, 0.001]), new Isotope(37, [88, false, ["beta minus"], 17.78, 0.001])],
  // Sr (38) - Synthetic isotopes excluding natural 84,86,87,88
  [new Isotope(38, [83, false, ["beta plus", "electron capture"], 32.41, 0.001]), new Isotope(38, [85, false, ["electron capture"], 64.849, 0.001]), new Isotope(38, [89, false, ["beta minus"], 4957.2, 0.001]), new Isotope(38, [90, false, ["beta minus"], 10544000, 0.001])],
  // Y (39) - Synthetic isotopes excluding natural 89
  [new Isotope(39, [87, false, ["beta plus"], 79.8, 0.001]), new Isotope(39, [88, false, ["beta plus"], 106.63, 0.001]), new Isotope(39, [90, false, ["beta minus"], 2.667, 0.001]), new Isotope(39, [91, false, ["beta minus"], 58.51, 0.001])],
  // Zr (40) - Synthetic isotopes excluding natural 90,91,92,94,96
  [new Isotope(40, [89, false, ["beta plus"], 78.41, 0.001]), new Isotope(40, [93, false, ["beta minus"], 1580000, 0.001]), new Isotope(40, [95, false, ["beta minus"], 64.02, 0.001])],
  // Nb (41) - Synthetic isotopes excluding natural 93
  [new Isotope(41, [91, false, ["beta plus"], 680.0, 0.001]), new Isotope(41, [94, false, ["beta minus"], 20000000, 0.001]), new Isotope(41, [95, false, ["beta minus"], 86400, 0.001])],
  // Mo (42) - Synthetic isotopes excluding natural 92,94,95,96,97,98,100
  [new Isotope(42, [93, false, ["beta plus"], 14400, 0.001]), new Isotope(42, [99, false, ["beta minus"], 2.747, 0.001]), new Isotope(42, [101, false, ["beta minus"], 14.61, 0.001])],
  // Tc (43) - Synthetic isotopes (all are synthetic)
  [new Isotope(43, [96, false, ["beta plus"], 91440, 0.001]), new Isotope(43, [97, false, ["beta minus"], 2592000, 0.00001]), new Isotope(43, [98, false, ["beta minus"], 3600, 0.0001]), new Isotope(43, [99, false, ["beta minus"], 2106000000, 0.000001])],
  // Ru (44) - Synthetic isotopes excluding natural 96,98,99,100,101,102,104
  [new Isotope(44, [97, false, ["electron capture"], 2592000, 0.001]), new Isotope(44, [103, false, ["beta minus"], 39400000, 0.001]), new Isotope(44, [105, false, ["beta minus"], 1.847, 0.001]), new Isotope(44, [106, false, ["beta minus"], 373.6, 0.001])],
  // Rh (45) - Synthetic isotopes excluding natural 103
  [new Isotope(45, [99, false, ["electron capture"], 84.0, 0.001]), new Isotope(45, [100, false, ["beta plus"], 20.8, 0.001]), new Isotope(45, [101, false, ["beta minus"], 3.3, 0.001]), new Isotope(45, [102, false, ["beta minus"], 207.0, 0.001])],
  // Pd (46) - Synthetic isotopes excluding natural 102,104,105,106,108,110
  [new Isotope(46, [103, false, ["electron capture"], 16.991, 0.001]), new Isotope(46, [107, false, ["beta minus"], 6500000, 0.001]), new Isotope(46, [109, false, ["beta minus"], 13.701, 0.001]), new Isotope(46, [111, false, ["beta minus"], 23.4, 0.001])],
  // Ag (47) - Synthetic isotopes excluding natural 107,109
  [new Isotope(47, [105, false, ["beta minus"], 1620000, 0.001]), new Isotope(47, [106, false, ["beta minus"], 4032000, 0.001]), new Isotope(47, [108, false, ["beta minus"], 1440.0, 0.001]), new Isotope(47, [110, false, ["beta minus"], 24.6, 0.001])],
  // Cd (48) - Synthetic isotopes excluding natural 106,108,110,111,112,114,116
  [new Isotope(48, [109, false, ["beta minus"], 462.6, 0.001]), new Isotope(48, [113, false, ["beta minus"], 1044960000000000, 0.000000001]), new Isotope(48, [115, false, ["beta minus"], 432000000000000, 0.001])],
  // In (49) - Synthetic isotopes excluding natural 113,115
  [new Isotope(49, [111, false, ["electron capture"], 2.8047, 0.001]), new Isotope(49, [114, false, ["beta minus"], 71.9, 0.001]), new Isotope(49, [116, false, ["beta minus"], 14.1, 0.001])],
  // Sn (50) - Synthetic isotopes excluding natural 112,114,115,116,117,118,119,120,122,124
  [new Isotope(50, [121, false, ["beta minus"], 27000, 0.001]), new Isotope(50, [123, false, ["beta minus"], 129.2, 0.001]), new Isotope(50, [125, false, ["beta minus"], 9.64, 0.001])],
  // Sb (51) - Synthetic isotopes excluding natural 121,123
  [new Isotope(51, [124, false, ["beta plus"], 60.2, 0.001]), new Isotope(51, [125, false, ["beta minus"], 2.756, 0.001]), new Isotope(51, [126, false, ["beta minus"], 12.4, 0.001]), new Isotope(51, [127, false, ["beta minus"], 93.1, 0.001])],
  // Te (52) - Synthetic isotopes excluding natural 120,122,123,124,125,126,128,130
  [new Isotope(52, [121, false, ["electron capture"], 154800, 0.001]), new Isotope(52, [123, false, ["beta minus"], 7776000000000000, 0.000000001])],
  // I (53) - Synthetic isotopes excluding natural 127
  [new Isotope(53, [125, false, ["electron capture"], 1447200, 0.001]), new Isotope(53, [129, false, ["beta minus"], 5230000000000000000, 0.000000001]), new Isotope(53, [131, false, ["beta minus"], 694080, 0.001]), new Isotope(53, [133, false, ["beta minus"], 83000, 0.001])],
  // Xe (54) - Synthetic isotopes excluding natural 124,126,128,129,130,131,132,134,136
  [new Isotope(54, [123, false, ["beta plus"], 1.96, 0.001]), new Isotope(54, [127, false, ["beta minus"], 36, 0.001])],
  // Cs (55) - Synthetic isotopes excluding natural 133
  [new Isotope(55, [131, false, ["beta plus"], 103840.0, 0.001]), new Isotope(55, [134, false, ["beta minus"], 753.6, 0.001]), new Isotope(55, [135, false, ["beta minus"], 2300000, 0.001]), new Isotope(55, [137, false, ["beta minus"], 950000, 0.001])],
  // Ba (56) - Synthetic isotopes excluding natural 130,132,134,135,136,137,138
  [new Isotope(56, [131, false, ["beta plus"], 86400.0, 0.001]), new Isotope(56, [139, false, ["beta minus"], 82800, 0.001])],
  // La (57) - Synthetic isotopes excluding natural 138,139
  [new Isotope(57, [137, false, ["beta plus"], 60000, 0.001]), new Isotope(57, [140, false, ["beta minus"], 40.27, 0.001])],
  // Ce (58) - Synthetic isotopes excluding natural 136,138,140,142
  [new Isotope(58, [137, false, ["beta plus"], 9, 0.001]), new Isotope(58, [141, false, ["beta minus"], 32.5, 0.001])],
  // Pr (59) - Synthetic isotopes excluding natural 141
  [new Isotope(59, [140, false, ["beta plus"], 3.39, 0.001]), new Isotope(59, [142, false, ["beta minus"], 19.12, 0.001])],
  // Nd (60) - Synthetic isotopes excluding natural 142,143,144,145,146,148,150
  [new Isotope(60, [141, false, ["beta minus"], 2.49, 0.001])],
  // Pm (61) - Synthetic isotopes (all are synthetic)
  [new Isotope(61, [145, false, ["beta minus"], 2592000, 0.00001]), new Isotope(61, [146, false, ["beta minus"], 1865.76, 0.001]), new Isotope(61, [147, false, ["beta minus"], 954816000, 0.001]), new Isotope(61, [148, false, ["beta minus"], 5.369, 0.001])],
  // Sm (62) - Synthetic isotopes excluding natural 144,147,149,150,151,152,154
  [],
  // Eu (63) - Synthetic isotopes excluding natural 151,153
  [new Isotope(63, [150, false, ["beta minus"], 36.9, 0.001]), new Isotope(63, [152, false, ["beta plus"], 46800, 0.001])],
  // Gd (64) - Synthetic isotopes excluding natural 152,154,155,156,157,158,160
  [],
  // Tb (65) - Synthetic isotopes excluding natural 159
  [new Isotope(65, [157, false, ["beta minus"], 150, 0.001]), new Isotope(65, [158, false, ["beta plus"], 180, 0.001]), new Isotope(65, [160, false, ["beta minus"], 72.3, 0.001])],
  // Dy (66) - Synthetic isotopes excluding natural 156,158,160,161,162,163,164
  [new Isotope(66, [155, false, ["beta plus"], 600, 0.001]), new Isotope(66, [159, false, ["beta minus"], 144, 0.001]), new Isotope(66, [165, false, ["beta minus"], 139.8, 0.001])],
  // Ho (67) - Synthetic isotopes excluding natural 165
  [new Isotope(67, [163, false, ["beta plus"], 4680, 0.001]), new Isotope(67, [164, false, ["beta minus"], 29, 0.001]), new Isotope(67, [166, false, ["beta minus"], 26.83, 0.001])],
  // Er (68) - Synthetic isotopes excluding natural 162,164,166,167,168,170
  [new Isotope(68, [169, false, ["beta minus"], 138.6, 0.001]), new Isotope(68, [171, false, ["beta minus"], 7.516, 0.001])],
  // Tm (69) - Synthetic isotopes excluding natural 169
  [new Isotope(69, [167, false, ["beta plus"], 9.25, 0.001]), new Isotope(69, [170, false, ["beta minus"], 128.6, 0.001]), new Isotope(69, [171, false, ["beta minus"], 1.92, 0.001])],
  // Yb (70) - Synthetic isotopes excluding natural 168,170,171,172,173,174,176
  [new Isotope(70, [175, false, ["beta minus"], 4.185, 0.001]), new Isotope(70, [177, false, ["beta minus"], 1.911, 0.001])],
  // Lu (71) - Synthetic isotopes excluding natural 175,176
  [],
  // Hf (72) - Synthetic isotopes excluding natural 174,176,177,178,179,180
  [new Isotope(72, [182, false, ["beta minus"], 8.9e6, 0.001])],
  // Ta (73) - Synthetic isotopes excluding natural 180,181
  [new Isotope(73, [182, false, ["beta minus"], 114.43, 0.001])],
  // W (74) - Synthetic isotopes excluding natural 180,182,183,184,186
  [new Isotope(74, [187, false, ["beta minus"], 23.72, 0.001]), new Isotope(74, [188, false, ["beta minus"], 69.3, 0.001])],
  // Re (75) - Synthetic isotopes excluding natural 185,187
  [new Isotope(75, [186, false, ["beta plus"], 90.64, 0.001]), new Isotope(75, [188, false, ["beta minus"], 17.40, 0.001])],
  // Os (76) - Synthetic isotopes excluding natural 184,186,187,188,189,190,192
  [new Isotope(76, [189, false, ["beta minus"], 11.24, 0.001]), new Isotope(76, [191, false, ["beta minus"], 15.4, 0.001])],
  // Ir (77) - Synthetic isotopes excluding natural 191,193
  [new Isotope(77, [192, false, ["beta minus"], 73.83, 0.001]), new Isotope(77, [194, false, ["beta minus"], 19.28, 0.001])],
  // Pt (78) - Synthetic isotopes excluding natural 190,192,194,195,196,198
  [new Isotope(78, [193, false, ["beta minus"], 50, 0.001]), new Isotope(78, [197, false, ["beta minus"], 19.9, 0.001])],
  // Au (79) - Synthetic isotopes excluding natural 197
  [new Isotope(79, [198, false, ["beta minus"], 64.4, 0.001]), new Isotope(79, [199, false, ["beta minus"], 3.169, 0.001])],
  // Hg (80) - Synthetic isotopes excluding natural 196,198,199,200,201,202,204
  [new Isotope(80, [203, false, ["beta minus"], 46.612, 0.001]), new Isotope(80, [205, false, ["beta minus"], 301.8, 0.001])],
  // Tl (81) - Synthetic isotopes excluding natural 203,205
  [new Isotope(81, [204, false, ["beta minus"], 1.22, 0.001]), new Isotope(81, [206, false, ["beta minus"], 4.2, 0.001])],
  // Pb (82) - Synthetic isotopes excluding natural 204,206,207,208
  [new Isotope(82, [210, false, ["beta minus"], 22.3, 0.001]), new Isotope(82, [211, false, ["beta minus"], 36.1, 0.001]), new Isotope(82, [212, false, ["beta minus"], 38.6, 0.001])],
  // Bi (83) - Synthetic isotopes excluding natural 209
  [new Isotope(83, [210, false, ["beta minus"], 1296000, 0.001]), new Isotope(83, [211, false, ["beta minus"], 598.5, 0.001]), new Isotope(83, [212, false, ["beta minus"], 60.55, 0.001])],
  // Po (84) - Synthetic isotopes (excluding natural but all radioactive)
  [new Isotope(84, [210, false, ["alpha decay"], 13104000, 0.00001]), new Isotope(84, [211, false, ["alpha decay"], 324, 0.001]), new Isotope(84, [212, false, ["alpha decay"], 0.299, 0.001])],
  // At (85) - Synthetic isotopes (all are synthetic)
  [new Isotope(85, [210, false, ["beta minus"], 28800, 0.00001]), new Isotope(85, [211, false, ["alpha decay"], 25920, 0.001]), new Isotope(85, [219, false, ["alpha decay"], 0.056, 0.001])],
  // Rn (86) - Synthetic isotopes (all are synthetic)
  [new Isotope(86, [220, false, ["alpha decay"], 54.5, 0.001]), new Isotope(86, [221, false, ["alpha decay"], 25, 0.001])],
  // Fr (87) - Synthetic isotopes (all are synthetic)
  [new Isotope(87, [221, false, ["alpha decay"], 288, 0.001])],
  // Ra (88) - Synthetic isotopes (all are synthetic)
  [new Isotope(88, [224, false, ["alpha decay"], 259200, 0.001]), new Isotope(88, [228, false, ["beta minus"], 159408000, 0.001])],
  // Ac (89) - Synthetic isotopes (all are synthetic)
  [new Isotope(89, [228, false, ["beta minus"], 22032000, 0.001])],
  // Th (90) - Synthetic isotopes (all are synthetic)
  [new Isotope(90, [229, false, ["alpha decay"], 696960000000, 0.00001]), new Isotope(90, [230, false, ["alpha decay"], 2342400000000, 0.00001]), new Isotope(90, [231, false, ["beta minus"], 87840, 0.001])],
  // Pa (91) - Synthetic isotopes (all are synthetic)
  [new Isotope(91, [233, false, ["beta minus"], 2592000, 0.001])],
  // U (92) - Synthetic isotopes (all are synthetic)
  [new Isotope(92, [236, false, ["alpha decay"], 233280000000000, 0.001]), new Isotope(92, [234, false, ["beta minus"], 245700000000, 0.001])],
  // Np (93) - Synthetic isotopes (all are synthetic)
  [new Isotope(93, [236, false, ["beta minus"], 155448000, 0.001])],
  // Pu (94) - Synthetic isotopes (all are synthetic)
  [new Isotope(94, [239, false, ["alpha decay"], 761395200000000, 0.001]), new Isotope(94, [240, false, ["alpha decay"], 2165449600000000, 0.001])],
  // Am (95) - Synthetic isotopes (all are synthetic)
  [new Isotope(95, [241, false, ["alpha decay"], 1432108800000, 0.0001]), new Isotope(95, [242, false, ["beta minus"], 52272000, 0.001])],
  // Cm (96) - Synthetic isotopes (all are synthetic)
  [new Isotope(96, [244, false, ["alpha decay"], 1804262400000000, 0.0001]), new Isotope(96, [245, false, ["alpha decay"], 294057600000, 0.001])],
  // Bk (97) - Synthetic isotopes (all are synthetic)
  [new Isotope(97, [249, false, ["beta minus"], 86400, 0.001])],
  // Cf (98) - Synthetic isotopes (all are synthetic)
  [new Isotope(98, [249, false, ["beta minus"], 13000, 0.001]), new Isotope(98, [250, false, ["alpha decay"], 34020000000, 0.001])],
  // Es (99) - Synthetic isotopes (all are synthetic)
  [new Isotope(99, [254, false, ["beta minus"], 275.8, 0.001])],
  // Fm (100) - Synthetic isotopes (all are synthetic)
  [new Isotope(100, [255, false, ["beta minus"], 838.6, 0.001])],
  // Md (101) - Synthetic isotopes (all are synthetic)
  [new Isotope(101, [260, false, ["beta minus"], 31.8, 0.001])],
  // No (102) - Synthetic isotopes (all are synthetic)
  [new Isotope(102, [261, false, ["alpha decay"], 180, 0.001])],
  // Lr (103) - Synthetic isotopes (all are synthetic)
  [new Isotope(103, [262, false, ["alpha decay"], 216, 0.001])],
  // Rf (104) - Synthetic isotopes (all are synthetic)
  [new Isotope(104, [261, false, ["alpha decay"], 68, 0.001])],
  // Db (105) - Synthetic isotopes (all are synthetic)
  [new Isotope(105, [262, false, ["alpha decay"], 34, 0.001])],
  // Sg (106) - Synthetic isotopes (all are synthetic)
  [new Isotope(106, [264, false, ["alpha decay"], 31, 0.001])],
  // Bh (107) - Synthetic isotopes (all are synthetic)
  [new Isotope(107, [262, false, ["alpha decay"], 102, 0.001])],
  // Hs (108) - Synthetic isotopes (all are synthetic)
  [new Isotope(108, [265, false, ["alpha decay"], 1.8, 0.001])],
  // Mt (109) - Synthetic isotopes (all are synthetic)
  [new Isotope(109, [266, false, ["alpha decay"], 3.4, 0.001])],
  // Ds (110) - Synthetic isotopes (all are synthetic)
  [new Isotope(110, [269, false, ["alpha decay"], 0.17, 0.001])],
  // Rg (111) - Synthetic isotopes (all are synthetic)
  [new Isotope(111, [272, false, ["alpha decay"], 3.8, 0.001])],
  // Cn (112) - Synthetic isotopes (all are synthetic)
  [new Isotope(112, [277, false, ["alpha decay"], 0.69, 0.001])],
  // Nh (113) - Synthetic isotopes (all are synthetic)
  [new Isotope(113, [278, false, ["alpha decay"], 0.48, 0.001])],
  // Fl (114) - Synthetic isotopes (all are synthetic)
  [new Isotope(114, [288, false, ["alpha decay"], 0.8, 0.001])],
  // Mc (115) - Synthetic isotopes (all are synthetic)
  [new Isotope(115, [288, false, ["alpha decay"], 0.22, 0.001])],
  // Lv (116) - Synthetic isotopes (all are synthetic)
  [new Isotope(116, [292, false, ["alpha decay"], 0.08, 0.001])],
  // Ts (117) - Synthetic isotopes (all are synthetic)
  [],
  // Og (118) - Synthetic isotopes (all are synthetic)
  []
];

export const elements = oldElements.map(e => {
  if (fixedElementNames.includes(e.name)) return fixedElements[fixedElementNames.indexOf(e.name)];
  else return e;
}).map((e, idx) => new Element(e.protons, e.name, e.symbol, e.amu, e.isotopes, syntheticIsotopes[idx]));
export const elementIndexing = elements.map(e => e.symbol);
export const elementNameIndexing = elements.map(e => e.name);