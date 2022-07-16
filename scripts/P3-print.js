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
         availableProcceses.push(amsDB[a].availableProcces[b]);
         option = null;
         done = true;
       }
     }
     availableRates.push(amsDB[a].rate);
   }
   document.querySelector('.prefered-conVar-input input').min=Math.min(...availableRates);
   document.querySelector('.prefered-conVar-input input').max=Math.max(...availableRates);
});

//creating an array of index from the AMS data
var indexDB = [];
for (i = 0; i < amsDB.length; i++) {
  indexDB[i]=i;
};

//get user location
var form = document.forms.namedItem("basic-formdata");
const pos = new Object();
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    pos.long = position.coords.latitude;
    pos.lat = position.coords.longitude;
  });
};

form.oninput = () => {
  z=0; //next and back varriable

  userInput = {
    process: document.querySelector('input[name="process"]:checked').value,
    location:pos,
    rate: document.querySelector('.prefered-conVar-input input').value
  };

  relvantIndexDB=[];
  irrelvantIndexDB=[];
  for (j=0;j<amsDB.length;j++) {
    if (amsDB[j].availableProcces.includes(userInput.process)) {
      relvantIndexDB.push(j);
    } else {
      irrelvantIndexDB.push(j);
    }
  }

  //now iterate over indexDBs and sort them out based on amsDB and userInput values
  bubbleSwap(relvantIndexDB);
  bubbleSwap(irrelvantIndexDB);
  suggestedIndexDB = relvantIndexDB.concat(irrelvantIndexDB);

  //suggest the AMS
  updateSuggestion()
};

//display next suggested vendor
document.querySelector('.next').onclick = () => {
    z++;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
};

//display previous suggested vendor
document.querySelector('.back').onclick = () => {
    z--;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
};

//onclick suggestion lead to whatsapp of vendor
document.querySelector('.suggestion-card').onclick = () => {
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
    document.querySelector('.AMSP-process').textContent=amsDB[suggestedIndexDB[z]].availableProcces[
      suggestionIndexDBCheck()];
    document.querySelector('.AMSP-rate span').innerText=amsDB[suggestedIndexDB[z]].rate;
    document.querySelector('.AMSP-distance span').innerText=Math.round(getDistance(
          userInput.location.lat,
          userInput.location.long,
          amsDB[suggestedIndexDB[z]].location.lat,
          amsDB[suggestedIndexDB[z]].location.long
        ));
    text="Salaam, I just looked into your additive manufacturing services on P3. I'd like to order an "+
    amsDB[suggestedIndexDB[z]].availableProcces[0]
    +" print for around Rs"+amsDB[suggestedIndexDB[z]].rate+
    "/g. Could you provide a price for that?";
    url = `https://wa.me/${amsDB[suggestedIndexDB[z]].contact}/?text=${text.replaceAll(' ', '%20')}`;
    document.querySelector('.AMSP-name').innerHTML=amsDB[suggestedIndexDB[z]].name;
//update the available colors
    while (document.querySelector('.available-colors-list').children.length>0) {
      document.querySelector('.available-colors-list').removeChild(
        document.querySelector('.available-colors-list>div')
      );
    }
    for (j=0;j<amsDB[z].availableColors.length;j++)
    {
      var colorElem = document.createElement('div');

      colorElem.style.cssText='border-radius: 50%;border: solid 2px;';
      colorElem.style.background=amsDB[z].availableColors[j];
      document.querySelector('.available-colors-list').appendChild(colorElem);
      colorElem = null;
    }
//update the available materials
    while (document.querySelector('.available-materials-list').children.length>0) {
      document.querySelector('.available-materials-list').removeChild(
        document.querySelector('.available-materials-list>div')
      );
    }
    for (j=0;j<amsDB[z].availableMaterial.length;j++)
    {
      var matElem = document.createElement('div');
      matElem.textContent=amsDB[z].availableMaterial[j];
      document.querySelector('.available-materials-list').appendChild(matElem);
      matElem = null;
    }
  }
};

//check if the index is out of bound or not
function suggestionIndexDBCheck() {
  if (amsDB[suggestedIndexDB[z]].availableProcces.indexOf(userInput.process)== -1) {
      return 0;} else {return amsDB[suggestedIndexDB[z]].availableProcces.indexOf(userInput.process);}
};

//bubble sort for jsonDB for the location
function bubbleSwap(arr) {
  for (i = 0; i < arr.length; i++) {
      for (j = 0; j < arr.length - i -1 ; j++) {
          if (sortBy(0,j,arr,userInput,amsDB)) {
                // swap the two entreies
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                temp = null;
          }
      }
  }
};

function sortBy(b,k,arr,userInput, amsDB) {
  if (b==0) {
    //console.log('Sorting by Cost')
    //find the closest rate between k and k+1
    //if k is close return false
    // if k + 1 is close return true
    r = [amsDB[arr[k]].rate,amsDB[arr[k+1]].rate]
    if (amsDB[arr[k]].rate==r.reduce(function(prev, curr) {
      return (Math.abs(curr - userInput.rate) < Math.abs(prev - userInput.rate) ? curr : prev);
    })) {
      return false;
    }
    else if (amsDB[arr[k+1]].rate==r.reduce(function(prev, curr) {
      return (Math.abs(curr - userInput.rate) < Math.abs(prev - userInput.rate) ? curr : prev);
    })) {
      return true;
    }
    else {
      return false;};
  } else if (b==1) {
    //console.log('Sorting by Distance')
    let loc = getDistance(
          userInput.location.lat,
          userInput.location.long,
          amsDB[k].location.lat,
          amsDB[k].location.long
        ) > getDistance(
          userInput.location.lat,
          userInput.location.long,
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
