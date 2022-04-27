//AMS Databse
let amsDB = [
  {
    name: 'ams1',
    availableProcces: ['FDM'],
    location: {
      long: 33.680240,
      lat: 73.110155
    },
    contact: 923106166593,
    rate: 15
  },
  {
    name: 'ams2',
    availableProcces: ['SLA','FDM'],
    location: {
      long: 33.641148,
      lat: 73.041471
    },
    contact: 923319579789,
    rate: 20
  },
  {
    name: 'ams3',
    availableProcces: ['FDM'],
    location: {
      long: 33.656487,
      lat: 72.961958
    },
    contact: 923110336007,
    rate: 70
  }
];

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
document.querySelector('select').value = 'SLA'

form.oninput = () => {
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
  document.getElementById('process').textContent=amsDB[suggestedIndexDB[0]].availableProcces[
    amsDB[suggestedIndexDB[0]].availableProcces.indexOf(makerInput.process)
  ];
  document.querySelector('#rate span').innerText=amsDB[suggestedIndexDB[0]].rate;
  document.querySelector('#distance span').innerText=Math.round(getDistance(
        makerInput.location.lat,
        makerInput.location.long,
        amsDB[suggestedIndexDB[0]].location.lat,
        amsDB[suggestedIndexDB[0]].location.long
      ));
document.querySelector('legend#rates-slider span').textContent='Rs '+makerInput.rate;
  url = 'https://wa.me/'+amsDB[suggestedIndexDB[0]].contact+'/';
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

function sortBy(b,k,arr,makerInput, amsDB)
{
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
