// main.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed ✅");

    // Example: Load markdown file (mark.md) dynamically
    fetch("Javascript/mark.md")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load mark.md");
            return response.text();
        })
        .then(markdown => {
            console.log("Markdown loaded ✅");
            // Assuming you have a global function to convert and render markdown
            if (typeof renderMarkdown === "function") {
                renderMarkdown(markdown);
            } else {
                console.warn("renderMarkdown function not found");
            }
        })
        .catch(err => console.error("Error fetching markdown:", err));
});
