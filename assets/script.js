//todays date
let $cityDate = moment().format("llll");
$("#currentdate").text($cityDate);

/* City Search Functions */
let $clicked = $(".buttonsearch");
$clicked.on("click", citysearch);
$clicked.on("click", searchSave);
// add Enter key for searching as well
$("input").keyup(function () {
    if (event.key === "Enter") {
        $clicked.click();
    }
})
// Seachcityname function
function citysearch() {

    // saved citer enter by USer in a let
    let cityname = (($(this).parent()).siblings("#cityenter")).val().toLowerCase();
    // empty search bar with setTimeout() so the City name is not gonna stuck on input section
    function clear() {
        $("#cityenter").val("");
    }
    setTimeout(clear, 300);
    //current weather
    let firstQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
        cityname + "&units=imperial&appid=e7c303b6206e1039548ab3f11d2207b3";
    $.ajax({
        url: firstQueryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        // create var to hold city current information
        let $currentTemp = parseInt(response.main.temp) + "°F";
        let $currentHum = response.main.humidity + "%";
        let $currentWind = parseInt(response.wind.speed) + "mph";
        let $currentIcon = response.weather[0].icon;
        let $currentIconURL = "http://openweathermap.org/img/w/" + $currentIcon + ".png";

        // display in html
        $("#namecity").text(cityname);
        $("#tempcity").text( $currentTemp);
        $("#humcity").text( $currentHum);
        $("#windspeed").text( $currentWind);
        $("#weathericon").attr({ "src": $currentIconURL, "alt": "Current Weather Icon" });
        // lat & lon for secondQueryURL below
        let lat = response.coord.lat;
        let lon = response.coord.lon;
        /* Query for One Call API - this will give us our info for 5 Day Forecast cards */
        let secondQueryURL =
            "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon +
            "&exclude=hourly&units=imperial&appid=e7c303b6206e1039548ab3f11d2207b3";
        $.ajax({
            url: secondQueryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            let $uv = response.current.uvi;
            // var for displaying in html & grabbing the right color class
            let $uvIndex = $("#uv-index");
            $uvIndex.text($uv)
            if ($uv >= 0 && $uv <=3) {
            document.getElementById("Risk1").innerHTML = ("  Low Risk")
             }
            else if ($uv >=3.1 && $uv <=7.0){
                document.getElementById("Risk2").innerHTML = ("  Medium Risk")}
            else if ($uv >= 7.1) {
                document.getElementById("Risk3").interHTML = ("  High Risk" )
            }
            // Date Assignment - convert UNIX response to human readable
            // array to hold timestamps
            let days = [];
            // get UNIX dt from response, skipping [0] as it is current day
            for (i = 1; i < 6; i++) {
                days[i] = response.daily[i].dt;
            }
            days = days.filter(item => item);
            // convert, extract, display:
            for (i = 0; i < days.length; i++) {
                // first convert each index to moment Using Unix
                days[i] = moment.unix(days[i]);
                // Change date format 
                days[i] = days[i].format("ddd,ll");
                // display dates in HTML
                $("#day" + i).text(days[i]);
            }
            console.log(days);
            // array for highTemps on cards, parsed off decimals
            let highTemps = [];
            // same method for skipping and removing current day info as above
            for (i = 1; i < 6; i++) {
                highTemps[i] = parseInt(response.daily[i].temp.max) + "°F";
            }
            highTemps = highTemps.filter(item => item);
            // loop through and display
            for (i = 0; i < highTemps.length; i++) {
                $("#highday" + i).text("High: " + highTemps[i]);
            }
             // same process for lows as with highs
             let lowTemps = [];
             for (i = 1; i < 6; i++) {
                 lowTemps[i] = parseInt(response.daily[i].temp.min) + "°F";
             }
             lowTemps = lowTemps.filter(item => item);
             for (i = 0; i < lowTemps.length; i++) {
                 $("#lowday" + i).text("Low: " + lowTemps[i]);
             }
            // and again for humidity
            let hums = [];
            for (i = 1; i < 6; i++) {
                hums[i] = response.daily[i].humidity + "%";
            }
            hums = hums.filter(item => item);
            for (i = 0; i < hums.length; i++) {
                $("#humday" + i).text("Humidity: " + hums[i]);
            }
            // and again for icons, w/ extra step
            let icons = [];
            // each icon will need its own concatenated URL
            let iconsURL = [];
            for (i = 1; i < 6; i++) {
                icons[i] = response.daily[i].weather[0].icon;
            }
            icons = icons.filter(item => item);
            // filling iconsURL[] w/ unique URLs using icons[] indices
            for (i = 0; i < icons.length; i++) {
                iconsURL[i] = "http://openweathermap.org/img/w/" + icons[i] + ".png";
            }
            for (i = 0; i < iconsURL.length; i++) {
                $("#icon" + i).attr({ "src": iconsURL[i], "alt": "Daily Weather Icon" });
            }
            let windspeed2 =[];
            for (i = 1; i <6; i++) {
                windspeed2[i] =parseInt(response.daily[i].wind_speed) + "mph";
            }
            windspeed2 = windspeed2.filter(item => item);
            for (i = 0; i < windspeed2.length; i++) {
                $("#windday" + i).text("Wind: " + windspeed2[i]);
            }
        });
    });
}
// fillFromStorage fills sidebar with anthything in localStorage
$(document).ready(function () {
    // if localStorage is not empty, call fillFromStorage()
    if (localStorage.getItem("cities")) {
         // grab data, parse and push into searchHistory[] s
         historydisplay = localStorage.getItem("cities", JSON.stringify(historydisplay));
         historydisplay = JSON.parse(historydisplay);
         // iterate through searchHistory, displaying in HTML
         for (i = 0; i <= historydisplay.length - 1; i++) {
             $("#search" + i).text(historydisplay[i]);
         }
 
         let lastIndex = (historydisplay.length - 1);
         // concat a jQuery selector & click listener that calls savedsearch()
         $("#search" + lastIndex).on("click", savedsearch);
         // .trigger() method that 'clicks' on that #searchx
         $("#search" + lastIndex).trigger("click");
     }
 });
    
// Array to display the list of HISTORY
let historydisplay = [];
// Function to Load Seach In local Storage and Display on HTML page
function searchSave() {
    // same jQuery selector from citysearch() puts value into newcity
    let newcity = (($(this).parent()).siblings("#cityenter")).val().toLowerCase();
    console.log(newcity);
    historydisplay.push(newcity);
    historydisplay = [...new Set(historydisplay)];
    // put in localStorage
    localStorage.setItem("cities", JSON.stringify(historydisplay));
    // display in HTML
    for (i = 0; i <= historydisplay.length - 1; i++) {
        // iterate through, displaying in HTML
        $("#search" + i).text(historydisplay[i]);
        // add .past class to create listener (below),
        $("#search" + i).addClass("past");
    }
}

$("section").on("click", ".past", savedsearch);

function savedsearch() {
    // var for text of pastcityname
    let $oldCity = $(this).text();
    // put it in the input field
    $("#cityenter").val($oldCity);
    // this triggers the original click listener, above citysearch()
    $clicked.trigger("click");
}

// Function to reinitilaize the Hisory
let $clear = $("#clearhist");
$clear.on("click", function () {
    //clear local storage
    localStorage.clear();
    //clear the History Display
    historydisplay = []
    for (i = 0; i < 11; i++) {
        $("#search" + i).text("");
    }

}); 
