const form = document.getElementById("search-form");
const countryInput = document.getElementById("country-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status");
const results = document.getElementById("results");

const countriesUrl = "https://api.worldbank.org/v2/country?format=json&per_page=400";
const universitiesUrl = "https://api.openalex.org/institutions";

let countries = null;

async function getCountries() {
    if (countries) {
        return countries;
    }

    const response = await fetch(countriesUrl);
    if (!response.ok) {
        throw new Error("Could not load the country list.");
    }

    const data = await response.json();
    if (!Array.isArray(data[1])) {
        throw new Error("The country list was not in the expected format.");
    }

    countries = data[1];
    return countries;
}

async function getCountryCode(countryName) {
    const countryList = await getCountries();
    const country = countryList.find(function (item) {
        return item.name.toLowerCase() === countryName.toLowerCase();
    });

    return country ? country.iso2Code : "";
}

function showUniversities(universityList) {
    results.innerHTML = "";

    universityList.forEach(function (university) {
        const card = document.createElement("article");
        card.className = "university";

        const name = document.createElement("h2");
        name.textContent = university.display_name;

        const region = document.createElement("p");
        const state = university.geo && university.geo.region;
        region.textContent = "State / region: " + (state || "Not listed");

        const websiteText = document.createElement("p");
        websiteText.textContent = "Website: ";

        if (university.homepage_url) {
            const website = document.createElement("a");
            website.href = university.homepage_url;
            website.textContent = university.homepage_url;
            website.target = "_blank";
            website.rel = "noopener noreferrer";
            websiteText.appendChild(website);
        } else {
            websiteText.append("Not listed");
        }

        card.append(name, region, websiteText);
        results.appendChild(card);
    });
}

async function searchUniversities(event) {
    event.preventDefault();

    const countryName = countryInput.value.trim();
    if (!countryName) {
        statusMessage.textContent = "Please enter a country name.";
        return;
    }

    searchButton.disabled = true;
    statusMessage.textContent = "Searching for universities...";
    results.innerHTML = "";

    try {
        const countryCode = await getCountryCode(countryName);
        if (!countryCode) {
            statusMessage.textContent = "Country not found. Check the spelling and try again.";
            return;
        }

        const url = new URL(universitiesUrl);
        url.searchParams.set("filter", "country_code:" + countryCode + ",type:education");
        url.searchParams.set("per-page", "50");
        url.searchParams.set("select", "display_name,homepage_url,geo");

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Could not load university data.");
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
            throw new Error("University data was not in the expected format.");
        }

        if (data.results.length === 0) {
            statusMessage.textContent = "No universities were found for " + countryName + ".";
            return;
        }

        showUniversities(data.results);
        statusMessage.textContent =
            "Showing " + data.results.length + " universities in " + countryName + ".";
    } catch (error) {
        console.error("University search failed:", error);
        statusMessage.textContent = "Could not load results. Check your internet connection and try again.";
    } finally {
        searchButton.disabled = false;
    }
}

form.addEventListener("submit", searchUniversities);
