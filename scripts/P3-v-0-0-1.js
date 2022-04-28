//reading the json database uploaded on github
let amsDB = new Object();
fetch("https://jarfa.000webhostapp.com/AMS-Database.json")
.then((response) => {
   return response.json();
}).then((jsondata) => {
   amsDB = jsondata;
});

var i,j,k,z;

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
document.querySelector('select').value = 'SLA';

form.oninput = () => {
  z=0;
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
}

function suggestionIndexDBCheck() {
  if (amsDB[suggestedIndexDB[z]].availableProcces.indexOf(makerInput.process)== -1) {
      return 0;} else {return amsDB[suggestedIndexDB[z]].availableProcces.indexOf(makerInput.process);}
}

document.querySelector('.next p').onclick = () => {
    z++;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
}

function arrayIndexLoop(n, array) {
  if (n>(array.length-1)) {
    return 0;
  } else if (n<0) {
    return array.length-1;
  } else {
    return z;
  }
}

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
}

document.querySelector('.back p').onclick = () => {
    z--;
    z=arrayIndexLoop(z, suggestedIndexDB);
    updateSuggestion();
}

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
    return sortByCostCondition(k,arr,makerInput,amsDB);
  } else if (b==1) {
    //console.log('Sorting by Distance')
    return sortByDistanceCondition(k,makerInput, amsDB);
  }
}

//boleen function to swap (sort) when true for distance
function sortByDistanceCondition(k,makerInput, amsDB) {
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
};

//boleen function to swap (sort) when true for cost
function sortByCostCondition(k,arr, makerInput, amsDB) {
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
    return false;}
}

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
}

//onclick suggestion lead to whatsapp of vendor
document.querySelector('div.suggestions').onclick = () => {
  window.open(url, '_blank').focus();
}
