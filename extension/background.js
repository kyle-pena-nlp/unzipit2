chrome.downloads.onCreated.addListener(function(downloadItem) {
    console.log(`Download initiated: ${downloadItem.url}`);
});

chrome.downloads.onChanged.addListener(function(downloadDelta) {
    if (downloadDelta.state && downloadDelta.state.current === "complete") {
        console.log(`Download ${downloadDelta.id} has completed.`);
        chrome.downloads.search({id: downloadDelta.id}, function(results) {
            if (results.length) {
                var downloadItem = results[0];
                console.log(`Download ${downloadItem.id} from ${downloadItem.url} has completed.`);
                
            }
        });
    }
});