//Database to read from
let ammDB = [
  {
    model: "Play",
    maker: "OBJEXYZ",
    price: 90,
    config: ["cartesian"],
    tagKeys: [
      ["Extruder Temperature", "250°C"],
      ["Communication Interface","USB"],
      ["Print Resolution", "75μm"],
      ["Configuration","Cartesian"],
      ["Structure Material","Steel"],
      ["Power","150W"],
      ["Filament Diameter", "1.75mm"],
      ["Size","Standard"]
    ],
    location: {
      long: 24.829434,
      lat: 67.099230
    },
    image: "https://objexyz.com/wp-content/uploads/2022/04/OBJEXYZ-PLAY-COMPLETE-e1650450049455.png",
    url: "https://objexyz.com/product/objexyz-play-3d-printer/"
  }
];

//finding process and rates available in the ammDB to add only those options that available
//config is use less as we're only dealing with FDM and SLA
let availableConfig = [];
let availablePrices = [];
for (let a = 0; a < ammDB.length; a++) {
  for (b = 0; b < ammDB[a].config.length; b++) {
    if (!availableConfig.includes(ammDB[a].config[b])) {
      availableConfig.push(ammDB[a].config[b]);
      option = null;
      done = true;
    }
  }
  availablePrices.push(ammDB[a].price);
}

//setting min and max values from the slider
//document.querySelector('.prefered-conVar-input input').min=Math.min(...availablePrices);
//document.querySelector('.prefered-conVar-input input').max=Math.max(...availablePrices);

//Take Inputs from Users
var form = document.forms.namedItem("basic-formdata");
var z;
form.oninput = () => {
  z=0; //varriable for navigating between suggestions

  //Storing Inputs
  userInput = {
    config: document.querySelector('input[name="config"]:checked').value,
    price: document.querySelector('.prefered-conVar-input input').value
  };
  //respond to Slider Inputs
  // document.querySelector('legend#prefered-conVar-legend span').textContent='Rs '+userInput.price+'k';

  //-----Suggest Printer from Inputs---------------//
  //first sort and then suggest first one in sorted DB copy

  //discrete variable based sorting
  relvantIndexDB=[];
  irrelvantIndexDB=[];
  for (j=0;j<ammDB.length;j++) {
    if (ammDB[j].config.includes(userInput.config)) {
      relvantIndexDB.push(j);
    } else {
      irrelvantIndexDB.push(j);
    }
  }

  //now iterate over indexDBs and sort them out based on ammDB and userInput values
  bubbleSwap(relvantIndexDB);
  bubbleSwap(irrelvantIndexDB);
  suggestedIndexDB = relvantIndexDB.concat(irrelvantIndexDB);

  //-----Update the Card for Suggested Printer-----//
  updateSuggestionCard();
  //----------------------------------------------//

  //----------------------------------------------//
}

//display next suggested vendor
document.querySelector('.next').onclick = () => {
    z++;
    if (z>(suggestedIndexDB.length-1)) {
      z=0;
    } else if (z<0) {
      return suggestedIndexDB.length-1;
    } else {
      z=z;
    };
    updateSuggestionCard();
};

//display previous suggested vendor
document.querySelector('.back').onclick = () => {
    z--;
    if (z>(suggestedIndexDB.length-1)) {
      z=0;
    } else if (z<0) {
      return suggestedIndexDB.length-1;
    } else {
      z=z;
    };
    updateSuggestionCard();
};

//goto url (provided by vendor) as price button is clicked
document.querySelector('.s-AMM-price').onclick = () => {
  window.open(ammDB[suggestedIndexDB[z]].url, '_blank').focus();
}

//-----Update the Card for Suggested Printer-----//
function updateSuggestionCard() {
  document.querySelector('.s-AMM-model').textContent=ammDB[suggestedIndexDB[z]].model;
  document.querySelector('.s-AMM-maker').textContent=ammDB[suggestedIndexDB[z]].maker;
  document.querySelector('.s-AMM-price #price').textContent=`Rs ${ammDB[suggestedIndexDB[z]].price}k`;
  document.querySelector('.s-AMM-preview').style.background=`url(${ammDB[suggestedIndexDB[z]].image})`;
  document.querySelector('.s-AMM-preview').style.backgroundRepeat="no-repeat";
  document.querySelector('.s-AMM-preview').style.backgroundPosition="center";
  document.querySelector('.s-AMM-preview').style.backgroundSize="contain";

  //remove existing tags
  while (document.querySelector('.s-AMM-tags').hasChildNodes()) {
    document.querySelector('.s-AMM-tags').removeChild(
      document.querySelector('.s-AMM-tags').firstChild
    );
  };

  for (var i = 0; i < ammDB[suggestedIndexDB[z]].tagKeys.length; i++) {
    //create element and attribute
    var tag=document.createElement("div");
    var tagToolTip=document.createAttribute("title");
    //set attribute value and text content of element
    tag.innerHTML=ammDB[suggestedIndexDB[z]].tagKeys[i][1];
    tagToolTip.value=ammDB[suggestedIndexDB[z]].tagKeys[i][0];
    //set attribute to element and append element to .s-AMM-tags
    tag.setAttributeNode(tagToolTip);
    document.querySelector('.s-AMM-tags').appendChild(tag);
  };
};

//bubble swap sort for array based on price closest
function bubbleSwap(arr) {
  for (i = 0; i < arr.length; i++) {
      for (j = 0; j < arr.length - i -1 ; j++) {
          if (sortBy(j,arr,userInput, ammDB)) {
                // swap the two entreies
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                temp = null;
          }
      }
  }
};

function sortBy(j,arr,userInput, ammDB) {
  {
    //find the closest price between j and j+1
    //if j is close return false
    // if j + 1 is close return true
    r = [ammDB[arr[j]].price,ammDB[arr[j+1]].price]
    if (ammDB[arr[j]].price==r.reduce(function(prev, curr) {
      return (Math.abs(curr - userInput.price) < Math.abs(prev - userInput.price) ? curr : prev);
    })) {
      return false;
    }
    else if (ammDB[arr[j+1]].price==r.reduce(function(prev, curr) {
      return (Math.abs(curr - userInput.price) < Math.abs(prev - userInput.price) ? curr : prev);
    })) {
      return true;
    }
    else {
      return false;
    };
  }
}
