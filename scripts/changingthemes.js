//change the theme of site
let themeDB = [
  {
    primaryColor: "white",
    secondaryColor: "black",
    teritoryColor: "whitesmoke"
  },
  {
    primaryColor: "rgb(18 18 18)",
    secondaryColor: "white",
    teritoryColor: "grey"
  }
];

let indexThemeDB = 0;
document.querySelector('#theme-change').onclick = () => {
  indexThemeDB++;
  if (indexThemeDB>(themeDB.length-1)) {
    indexThemeDB = 0;
  } else if (indexThemeDB<0) {
    return themeDB.length-1;
  } else {
    indexThemeDB = indexThemeDB;
  };
  document.querySelector(':root').style.setProperty('--colorP',themeDB[indexThemeDB].primaryColor);
  document.querySelector(':root').style.setProperty('--colorS',themeDB[indexThemeDB].secondaryColor);
  document.querySelector(':root').style.setProperty('--colorT',themeDB[indexThemeDB].teritoryColor);
}
