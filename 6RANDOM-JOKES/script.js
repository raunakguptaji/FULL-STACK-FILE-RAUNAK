const jokeText = document.getElementById("joke-text");
const jokeButton = document.getElementById("joke-button");
const apiUrl = "https://v2.jokeapi.dev/joke/Any?safe-mode";

async function getJoke() {
    jokeButton.disabled = true;
    jokeButton.textContent = "Loading...";
    jokeText.textContent = "Loading a joke...";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("The joke service returned an error.");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message);
        }

        if (data.type === "single") {
            jokeText.textContent = data.joke;
        } else {
            jokeText.textContent = data.setup + "\n\n" + data.delivery;
        }
    } catch (error) {
        console.error("Could not load a joke:", error);
        jokeText.textContent = "Couldn't load a joke. Check your internet connection and try again.";
    }

    jokeButton.disabled = false;
    jokeButton.textContent = "Get another joke";
}

jokeButton.addEventListener("click", getJoke);
getJoke();
