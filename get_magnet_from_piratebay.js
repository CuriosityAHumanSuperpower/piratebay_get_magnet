async function addCheckboxes() {
    const mainContent = document.querySelector("#main-content");
    if (!mainContent) {
        console.error("#main-content not found");
        return;
    }
    
    const rows = mainContent.querySelectorAll("table tr");
    rows.forEach(row => {
        const columns = row.querySelectorAll("td");
        if (columns.length >= 2) {
            // Add checkbox if not already added
            if (!columns[0].querySelector("input[type='checkbox']")) {
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.style.marginRight = "5px";
                columns[0].prepend(checkbox);
            }
        }
    });
}

async function highlightMatches(regex) {
    const mainContent = document.querySelector("#main-content");
    if (!mainContent) {
        console.error("#main-content not found");
        return;
    }
    
    const rows = mainContent.querySelectorAll("table tr");
    rows.forEach(row => {
        row.style.backgroundColor = ""; // Un-highlight all rows first
    });
    
    rows.forEach(row => {
        const columns = row.querySelectorAll("td");
        if (columns.length >= 2) {
            const link = columns[1].querySelector("a");
            if (link && new RegExp(regex).test(link.textContent)) {
                // Highlight matching row
                row.style.backgroundColor = "yellow";
            }
        }
    });
}

async function scrapeCheckedLinks() {
    const urlArray = [];
    const mainContent = document.querySelector("#main-content");
    if (!mainContent) {
        console.error("#main-content not found");
        return [];
    }
    
    const rows = mainContent.querySelectorAll("table tr");
    rows.forEach(row => {
        const columns = row.querySelectorAll("td");
        if (columns.length >= 2) {
            const link = columns[1].querySelector("a");
            const checkbox = columns[0].querySelector("input[type='checkbox']");
            if (link && checkbox && checkbox.checked) {
                urlArray.push(link.href);
            }
        }
    });
    
    return urlArray;
}

async function openLinks(urlArray, openDownloads = false) {
    const downloadLinks = [];
    
    for (const url of urlArray) {
        await new Promise(resolve => {
            const newTab = window.open(url, "_blank");
            if (!newTab) {
                console.error("Popup blocked: Unable to open ", url);
                return;
            }
            
            const checkForDownloadLink = setInterval(() => {
                try {
                    const downloadDiv = newTab.document.querySelector(".download");
                    if (downloadDiv) {
                        const downloadLink = Array.from(downloadDiv.querySelectorAll("a"))
                            .find(a => a.textContent.includes("Get this torrent"));
                        if (downloadLink) {
                            downloadLinks.push(downloadLink.href);
                            clearInterval(checkForDownloadLink);
                            newTab.close();
                            resolve();
                        }
                    }
                } catch (error) {
                    console.warn("Waiting for the page to load...");
                }
            }, 1000);
        });
        
        // Delay between opening download links
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
    }
    
    console.log(downloadLinks);
    
    if (openDownloads) {
        for (const link of downloadLinks) {
            await new Promise(resolve => {
                window.open(link, "_blank");
                setTimeout(resolve, 2000); // 2-second delay
            });
        }
    }
}

/**
https://tpb.party/search/white%20lotus%20/1/99/0
await addCheckboxes();
var reg = /White.Lotus.S03E...1080/g 
await highlightMatches(reg);
Check boxes
var links = await scrapeCheckedLinks();
await openLinks(links,true); 
**/
