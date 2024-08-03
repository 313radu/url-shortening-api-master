'use strict';

window.addEventListener("DOMContentLoaded", () => {
    console.log("Page Fully Loaded");
});

// Show Navbar on Mobile
const body = document.body;
const menuButton = document.getElementById("menuButton");
const navbar = document.getElementById("navbar");

menuButton.addEventListener("click", () => {
    navbar.classList.toggle("active-nav");
    console.log("active buttton");

    let pageHeight = window.innerHeight;

    if (navbar.classList.contains("active-nav")) {
        body.style.height = pageHeight;
        body.style.overflow = "hidden";
    } else {
        body.style.minHeight = "100vh";
        body.style.overflow = "auto";
    }
});


let shortenedUrlsList = []; // Array to store all shortened URLs

/**
 * Adds a unique query parameter to the given URL.
 * This helps in ensuring each request to the shortening service is unique.
 * @param {string} url - The original URL.
 * @return {string} - The URL with the added unique query parameter.
 */
function addUniqueQueryParameter(url) {
    const uniqueParam = 'unique=' + Date.now() + Math.random().toString(36).substring(2, 15);
    return url.includes('?') ? `${url}&${uniqueParam}` : `${url}?${uniqueParam}`;
}

/**
 * Shortens the given URL using the is.gd service.
 * Uses the same unique ID for the first URL and appends new URLs.
 * @param {string} url - The URL to be shortened.
 * @return {Promise<string|null>} - A promise that resolves to the shortened URL or null for failed attempt.
 */
async function shortenUrlIsGd(url) {
    try {
        // Generate unique short ID for the URL
        const uniqueUrl = addUniqueQueryParameter(url);
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(uniqueUrl)}`);
        if (response.ok) {
            const data = await response.json();
            return data.shorturl;
        } else {
            console.error("Error: Unable to shorten the URL with is.gd");
            return null;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

/**
 * Retrieves URLs from the textarea, shortens them using is.gd, and displays the results.
 * This function is triggered by clicking the "Shorten URLs" button.
 */
async function shortenUrls() {

    // Get URLs from the input, split by newline, and filter out any empty lines
    const urls = document.getElementById('urls').value.split('\n').filter(url => url.trim() !== '');
    // Update the results div to show that the URLs are being processed
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Shortening URLs...';

    const url = document.getElementById("urls");
    const inputUrlInfo = document.getElementById("inputUrlInfo");
    const urlPlaceholder = url.placeholder;

    // Get the current width of the browser window
    const getPageWidth = window.innerWidth;

    if (urls.length === 0) {
        url.style.border = "2px solid red";
        inputUrlInfo.style.cssText = "display: block; color: red; position: absolute; bottom: 20px; left: 45px;";
        url.classList.add("red-placeholder");


        // Check if the width is less than 800 pixels
        if (getPageWidth < 800) {
            // If the width is less than 800 pixels, apply these styles to the inputUrlInfo element
            inputUrlInfo.style.cssText = "display: block; color: red; position: absolute; top: 80px; left: 45px";
        } else {
            // If the width is 800 pixels or more, apply these styles to the inputUrlInfo element
            inputUrlInfo.style.cssText = "display: block; color: red; position: absolute; bottom: 4px; left: 45px;";
        }
    }

    url.addEventListener("click", () => {
        url.style.border = "none";
        inputUrlInfo.style.cssText = "display: none";
        url.classList.remove("red-placeholder");
    });

    // Shorten all URLs concurrently
    const shortenedUrls = await Promise.all(urls.map(async url => {
        const shortened = await shortenUrlIsGd(url);
        return { original: url, shortened };
    }));

    // Add new shortened URLs to the shortenedUrlsList
    shortenedUrlsList = [...shortenedUrlsList, ...shortenedUrls];

    // Clear the resultsDiv
    resultsDiv.innerHTML = '';

    // Display all shortened URLs in resultsDiv
    shortenedUrlsList.forEach(result => {
        // Parse the original URL to extract hostname and pathname
        const urlObj = new URL(result.original);
        const { hostname, pathname } = urlObj;

        const div = document.createElement('div');
        div.innerHTML = `
            <ul class="url-list">
                <li class="url">
                    <div class="url-info">
                    <div class="original-url-box">
                        <p class="original-url">${hostname}${pathname}</p>
                    </div>
                        <a class="short-url" href="${result.shortened}" target="_blank">${result.shortened}</a>
                    </div>
                    <button id="copy-btn" class="copy-btn" data-url="${result.shortened}">Copy</button>
                </li>
            </ul>`;
        resultsDiv.appendChild(div);
    });

    // const copyBtn = document.querySelectorAll("#copy-btn");

    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const url = event.target.getAttribute('data-url');
            navigator.clipboard.writeText(url).then(() => {
                event.target.style.backgroundColor = "hsl(257, 27%, 26%)";

            }).catch(err => {
                console.error('Error copying URL: ', err);
            });
        });
    });
}
