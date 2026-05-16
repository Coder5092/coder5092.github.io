import { Element, Isotope, elements, elementIndexing, elementNameIndexing, autoConvert } from "./modules/data.mjs";

var tracking = false;

document.addEventListener("DOMContentLoaded", () => {
  let showElementInCreateTab = (data, targetAmu) => {
    // if (!element.classList.contains('earned')) return;

    let idx = isFinite(parseInt(data)) ? data - 1 : elementIndexing.indexOf(data.querySelector('.symbol').innerText);
    let el = elements[idx];

    let eConfig = Element.electronConfig(idx + 1);
    let eConfigS = Element.electronConfigSimple(idx + 1);
    let maxSubshell = Math.max(...eConfig.split(' ').map(s => parseInt(s[0])));
    for (let i = 1; i <= 7; i++) {
      document.getElementById('subshell' + i).style.visibility = i <= maxSubshell ? 'visible' : 'hidden';
      for (let j = 1; j <= Element.electronShellMaxes[i - 1]; j++) {
        document.getElementById('electronSS' + i + 'N' + j).style.visibility = j <= eConfigS[i - 1] ? 'visible' : 'hidden';
      }
    }

    document.getElementById("innerBohr").innerHTML = `p=${idx + 1}<br />n=${Math.round(el.amu) - idx - 1}`;

    let isotopes = document.getElementById("isotopeSelection");
    isotopes.querySelectorAll("*").forEach(e => e.remove());
    el.allIsotopes.map(i => `${el.name}-${i.amu}`).forEach(v => {
      let isotope = document.createElement('option');
      isotope.innerText = v;
      if (isFinite(targetAmu)) {
        if (parseInt(v.split('-')[1]) == targetAmu) isotope.selected = true;
      } else if (parseInt(v.split('-')[1]) == Math.round(el.amu)) isotope.selected = true;

      isotopes.appendChild(isotope);
    });

    document.getElementById("elementName").innerText = isotopes.value + " (" + eConfig + ")";
    isotopes.dispatchEvent(new Event('change', { bubbles: true }));
  }

  let tableContainer = document.getElementById("table");
  let elementNo = 0;

  let addElement = (i, j) => {
    let element = document.createElement('div');
    element.style.gridArea = i + " / " + j;

    let periodicElement = elements[elementNo++].symbol;

    let symbol = document.createElement('span');
    symbol.innerText = periodicElement;
    symbol.classList.add('symbol');

    let number = document.createElement('span');
    number.innerText = elementNo;
    number.classList.add('number');

    element.appendChild(symbol);
    element.appendChild(number);

    element.onmouseenter = event => {
      let idx = elementIndexing.indexOf(event.target.querySelector('.symbol').innerText);
      let el = elements[idx];
      document.querySelector("#tableInfoDiv > .symbol").innerText = el.symbol;
      // document.querySelector("#tableInfoDiv > .weight").innerText = el.name;
      document.querySelector("#tableInfoDiv > .weight").innerText = el.amu == Math.floor(el.amu) ? `(${el.amu})` : el.amu;
      document.querySelector("#tableInfoDiv > .number").innerText = (idx + 1).toString();
    };

    element.onclick = event => {
      if (! tracking) showElementInCreateTab(element);
    };

    tableContainer.appendChild(element);
  };

  for (let i = 1; i <= 7; i++) {
    let continueNext = false;
    for (let j = 1; j <= 18; j++) {
      if (continueNext) {
        continueNext = false;
        continue;
      } else if (i == 1 && j > 1 && j < 18) continue;
      else if ((i == 2 || i == 3) && j > 2 && j < 13) continue;

      addElement(i, j);

      if (elementNo == 56 || elementNo == 88) {
        for (let k = 1; k <= 15; k++) {
          addElement(i + 3, k + 2);
        }

        continueNext = true;
      }
    }
  }

  for (let i = 1; i <= 7; i++) {
    let subshell = document.getElementById('subshell' + i);
    let capacity = Element.electronShellMaxes[i - 1];

    for (let j = 1; j <= capacity; j++) {
      let electron = document.createElement('div');
      electron.id = 'electronSS' + i + 'N' + j;
      electron.classList.add('bohrElectron');

      let angle = (i == 1 && j == 2) ? 180 : 360 * j / capacity + (j % 2 == 0 ? 0 : 180);
      electron.style.transform = `rotate(${angle}deg)`;

      subshell.appendChild(electron);
    }
  }

  document.querySelector("#table > div:nth-child(2)").classList.add('earned');
  document.querySelector("#table > div:nth-child(3)").classList.add('earned');

  document.getElementById("isotopeSelection").addEventListener('change', event => {
    let elementName = event.target.value.split('-')[0];
    let isotopeNum = parseInt(event.target.value.split('-')[1]);

    let element = document.getElementById("elementName");
    element.innerText = event.target.value + element.innerText.replace(elementName, '').replace(/-[0-9]*/, '');

    let idx = elementNameIndexing.indexOf(elementName);
    document.getElementById("innerBohr").innerHTML = `p=${idx + 1}<br />n=${isotopeNum - idx - 1}`;

    let isotope = elements[idx].allIsotopes[event.target.selectedIndex];
    let infoString = isotope.stable == null ? 'Unkown properties' : (isotope.stable ? "Stable" : `Unstable (half-life: ${autoConvert(isotope.halfLife, 's', 'time')})     Decay methods: ${isotope.decayTypes.join(', ')}`);
    document.getElementById('elementInfoIcons').innerText = infoString;

    document.querySelectorAll("#decaySelection, #decaySelectionLabel, #decayButton").forEach(e => e.style.visibility = (isotope.stable ?? true) ? 'hidden' : 'visible');
    let decaySelect = document.getElementById('decaySelection');
    decaySelect.querySelectorAll('*').forEach(e => e.remove());
    isotope.decayTypes.forEach(v => {
      let decayType = document.createElement('option');
      decayType.innerText = v;

      decaySelect.appendChild(decayType);
    });

    document.getElementById('decayButton').onclick = event => {
      let newIsotope = Element.decay(isotope, decaySelect.value);
      if (newIsotope == null || newIsotope == undefined) console.error('failed to decay');
      else showElementInCreateTab(newIsotope.protons, newIsotope.amu);
    };
  });

  document.getElementById('trackButton').onclick = event => {
    if (event.target.innerText.includes('Begin Tracking')) {
      event.target.innerHTML = event.target.innerHTML.replace("Begin Tracking", "Stop");
      tracking = true;
    } else if (event.target.innerText.includes("Stop")) {
      event.target.innerHTML = event.target.innerHTML.replace("Stop", "Begin Tracking");
      tracking = false;
    }
  };
});