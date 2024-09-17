console.log("inside background")

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "opentab") {
//         // Get the URL of 'index.html' located inside the 'scripts' folder
        

        chrome.storage.local.set({
            all_elements:message.all_elements,
            single_html:message.single_html,
            single_body_html:message.single_body_html

        },function(){
            const indexUrl = chrome.runtime.getURL("scripts/index.html");
        
            // Open a new tab with the 'index.html' file
            chrome.windows.create({
                url: indexUrl
        }
        )
        });
    }
});
