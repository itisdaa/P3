var i,j,k,z,a,b;
var done = false;
//reading the json database uploaded on github
let amsDB = new Object();
let availableProcceses = [];
let availableRates = [];
fetch("https://jarfa.000webhostapp.com/AMS-Database.json")
.then((response) => {
   return response.json();
}).then((jsondata) => {
   amsDB = jsondata;
   for (let a = 0; a < amsDB.length; a++) {
     for (b = 0; b < amsDB[a].availableProcces.length; b++) {
       if (!availableProcceses.includes(amsDB[a].availableProcces[b])) {
         var option = document.createElement('option');
         option.text = amsDB[a].availableProcces[b];
         option.value = amsDB[a].availableProcces[b];
         availableProcceses.push(amsDB[a].availableProcces[b]);
         document.querySelector('select').add(option);
         option = null;
         done = true;
       }
     }
     availableRates.push(amsDB[a].rate);
   }
   dropdownMDN();
   document.querySelector('.resolution input').min=Math.min(...availableRates);
   document.querySelector('.resolution input').max=Math.max(...availableRates);
   document.querySelector('select').value = availableProcceses[availableProcceses.length-1];
});



//creating an array of index from the AMS data
var indexDB = [];
for (i = 0; i < amsDB.length; i++) {
  indexDB[i]=i;
};


//get user location
var form = document.forms.namedItem("formdata");
const pos = new Object();
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    pos.long = position.coords.latitude;
    pos.lat = position.coords.longitude;
  });
};


form.oninput = () => {
  z=0; //next and back varriable
  makerInput = {
    process: document.querySelector('select').value,
    location:pos,
    rate: document.querySelector('.resolution input').value
  };
  relvantIndexDB=[];
  irrelvantIndexDB=[];
  for (j=0;j<amsDB.length;j++) {
    if (amsDB[j].availableProcces.includes(makerInput.process)) {
      relvantIndexDB.push(j);
    } else {
      irrelvantIndexDB.push(j);
    }
  }
  //now iterate over indexDBs and sort them out based on amsDB and makerInput values
  bubbleSwap(relvantIndexDB);
  bubbleSwap(irrelvantIndexDB);
  suggestedIndexDB = relvantIndexDB.concat(irrelvantIndexDB);

  //suggest the AMS
  updateSuggestion()
  document.querySelector('select').oninput = () => {
    document.querySelector('.resolution input').value=amsDB[suggestedIndexDB[0]].rate;
    document.querySelector('legend#rates-slider span').textContent='Rs '+amsDB[suggestedIndexDB[0]].rate;
  }
};


//display next suggested vendor
document.querySelector('.next p').onclick = () => {
    z++;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
};

//display previous suggested vendor
document.querySelector('.back p').onclick = () => {
    z--;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
};

//onclick suggestion lead to whatsapp of vendor
document.querySelector('div.suggestions').onclick = () => {
  window.open(url, '_blank').focus();
};

// loop the value of z so that when array ends clicking next will start from z=0
function arrayIndexLoop(n, array) {
  if (n>(array.length-1)) {
    return 0;
  } else if (n<0) {
    return array.length-1;
  } else {
    return n;
  }
};

//update the suggestion card
function updateSuggestion() {
  if (-1 < z && z < suggestedIndexDB.length) {
    document.getElementById('process').textContent=amsDB[suggestedIndexDB[z]].availableProcces[
      suggestionIndexDBCheck()];
    document.querySelector('#rate span').innerText=amsDB[suggestedIndexDB[z]].rate;
    document.querySelector('#distance span').innerText=Math.round(getDistance(
          makerInput.location.lat,
          makerInput.location.long,
          amsDB[suggestedIndexDB[z]].location.lat,
          amsDB[suggestedIndexDB[z]].location.long
        ));
    document.querySelector('legend#rates-slider span').textContent='Rs '+makerInput.rate;
    url = 'https://wa.me/'+amsDB[suggestedIndexDB[z]].contact+'/';
  }
};

//check if the index is out of bound or not
function suggestionIndexDBCheck() {
  if (amsDB[suggestedIndexDB[z]].availableProcces.indexOf(makerInput.process)== -1) {
      return 0;} else {return amsDB[suggestedIndexDB[z]].availableProcces.indexOf(makerInput.process);}
};

//bubble sort for jsonDB for the location
function bubbleSwap(arr) {
  for (i = 0; i < arr.length; i++) {
      for (j = 0; j < arr.length - i -1 ; j++) {
          if (sortBy(0,j,arr,makerInput,amsDB)) {
                // swap the two entreies
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                temp = null;
          }
      }
  }
};

function sortBy(b,k,arr,makerInput, amsDB) {
  if (b==0) {
    //console.log('Sorting by Cost')
    //find the closest rate between k and k+1
    //if k is close return false
    // if k + 1 is close return true
    r = [amsDB[arr[k]].rate,amsDB[arr[k+1]].rate]
    if (amsDB[arr[k]].rate==r.reduce(function(prev, curr) {
      return (Math.abs(curr - makerInput.rate) < Math.abs(prev - makerInput.rate) ? curr : prev);
    })) {
      return false;
    }
    else if (amsDB[arr[k+1]].rate==r.reduce(function(prev, curr) {
      return (Math.abs(curr - makerInput.rate) < Math.abs(prev - makerInput.rate) ? curr : prev);
    })) {
      return true;
    }
    else {
      return false;};
  } else if (b==1) {
    //console.log('Sorting by Distance')
    let loc = getDistance(
          makerInput.location.lat,
          makerInput.location.long,
          amsDB[k].location.lat,
          amsDB[k].location.long
        ) > getDistance(
          makerInput.location.lat,
          makerInput.location.long,
          amsDB[k+1].location.lat,
          amsDB[k+1].location.long
        );
    return loc;
  }
};

//distance between tow locations in km
function getDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1)*(Math.PI/180);
  var dLon = (lon2-lon1)*(Math.PI/180);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos((Math.PI/180)*(lat1)) * Math.cos((Math.PI/180)*(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
};

//custome dropdown js by mozila MDN select
function dropdownMDN() {
  console.log('MDN Start');
  const selects = custom.querySelectorAll('select');
  const event = document.createEvent('Event');
  event.initEvent('input', true, true);
  for (const select of selects) { // goes through iteratable select elements in object selects
      const div = document.createElement('div');
      const header = document.createElement('div');
      const datalist = document.createElement('datalist');
      const optgroups = select.querySelectorAll('optgroup');
      const span = document.createElement('span');
      const options = select.options;
      const parent = select.parentElement;
      const multiple = select.hasAttribute('multiple');
      const onclick = function(e) {
          const disabled = this.hasAttribute('data-disabled');
          select.value = this.dataset.value;
          span.innerText = this.dataset.label;
          if (disabled) return;
          if (multiple) {
              if (e.shiftKey) {
                  const checked = this.hasAttribute("data-checked");
                  if (checked) {
                      this.removeAttribute("data-checked");
                  } else {
                      this.setAttribute("data-checked", "");
                  };
              } else {
                  const options = div.querySelectorAll('.option');
                  for (i = 0; i < options.length; i++) {
                      const option = options[i];
                      option.removeAttribute("data-checked");
                  };
                  this.setAttribute("data-checked", "");
              };
          };
      };
      const onkeyup = function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.keyCode === 13) { //on press of enter make a click
              this.click();
          }
      };
      div.classList.add('select');
      header.classList.add('header');
      div.tabIndex = 1;
      select.tabIndex = -1;
      span.innerText = select.label; //set the span value to slected

      header.appendChild(span);
      for (attribute of select.attributes) div.dataset[attribute.name] = attribute.value;
      for (i = 0; i < options.length; i++) {
          const option = document.createElement('div');
          const label = document.createElement('div');
          const o = options[i];
          for (attribute of o.attributes) option.dataset[attribute.name] = attribute.value;
          option.classList.add('option');
          label.classList.add('label');
          label.innerText = o.label;
          option.dataset.value = o.value;
          option.dataset.label = o.label;
          option.onclick = onclick;
          option.onkeyup = onkeyup;
          option.tabIndex = i + 1;
          option.appendChild(label);
          datalist.appendChild(option);
      }
      div.appendChild(header);
      for (o of optgroups) {
          const optgroup = document.createElement('div');
          const label = document.createElement('div');
          const options = o.querySelectorAll('option');
          Object.assign(optgroup, o);
          optgroup.classList.add('optgroup');
          label.classList.add('label');
          label.innerText = o.label;
          optgroup.appendChild(label);
          div.appendChild(optgroup);
          for (o of options) {
              const option = document.createElement('div');
              const label = document.createElement('div');
              for (attribute of o.attributes) option.dataset[attribute.name] = attribute.value;
              option.classList.add('option');
              label.classList.add('label');
              label.innerText = o.label;
              option.tabIndex = i + 1;
              option.dataset.value = o.value;
              option.dataset.label = o.label;
              option.onclick = onclick;
              option.onkeyup = onkeyup;
              option.tabIndex = i + 1;
              option.appendChild(label);
              optgroup.appendChild(option);
          };
      };
      div.onclick = function(e) {
          e.preventDefault();
      }
      parent.insertBefore(div, select);
      header.appendChild(select);
      div.appendChild(datalist);
      datalist.style.top = header.offsetTop + header.offsetHeight + 'px';
      div.onclick = function(e) {
          if (multiple) {

          } else {
              const open = this.hasAttribute("data-open");
              e.stopPropagation();
              if (open) {
                  this.removeAttribute("data-open");
                  document.forms.namedItem("formdata").dispatchEvent(event); //trigering oninput event
              } else {
                  this.setAttribute("data-open", "");
              }
          }

      };
      div.onkeyup = function(event) {
          event.preventDefault();
          if (event.keyCode === 13) {
              this.click();
          }
      };
      document.addEventListener('click', function(e) {
          if (div.hasAttribute("data-open")) {
            div.removeAttribute("data-open");
          };
      });
      const width = Math.max(...Array.from(options).map(function(e) { //setting width equalto max length of option
          span.innerText = e.label;
          return div.offsetWidth;
      }));
      //div.style.width = width + 'px';
  };
  console.log('MDN End');
};
