// let mouseOverListener, mouseOutListener, clickListener;
// let hovered_element=null;

// function intialize_highlighting(is_started){
//     if (is_started) {
//         stop_clicking();     // Disable clicking
//         start_hovering();    // Start hovering behavior
//     } else {   
//         removeEventListeners();  // Remove all custom event listeners
//     }
// }

// // Start hovering functionality
// function start_hovering(){
//     mouseOverListener = function(event) {    
//         if (event.target != document.body) {
//             event.stopPropagation();
//             event.preventDefault();
//             event.stopImmediatePropagation();
//             const target = event.target;
            
//             // Save the original background color
//             if (!target.dataset.originalColor) {
//                 target.dataset.originalColor = window.getComputedStyle(target).backgroundColor;
//             }
            
//             target.style.backgroundColor = 'grey';   
//             hovered_element=target 
//         }
//     };
    
//     mouseOutListener = function(event) {
//         event.stopPropagation();
//         event.preventDefault();
//         event.stopImmediatePropagation();
//         const target = event.target;
        
//         // Restore original background color
//         target.style.backgroundColor = target.dataset.originalColor || '';
//     };

//     // Attach the event listeners for hover
//     document.addEventListener('mouseover', mouseOverListener, true);
//     document.addEventListener('mouseout', mouseOutListener, true);
// }

// // Stop hovering functionality (remove hover listeners)
// function stop_hovering(){

//     if (mouseOverListener && mouseOutListener) {
//         hovered_element=null
//         document.removeEventListener('mouseover', mouseOverListener, true);
//         document.removeEventListener('mouseout', mouseOutListener, true);
//     }
// }

// // Disable clicking functionality
// function stop_clicking(){
    
//     clickListener = function(event) {
//         const button = document.getElementById('page-btn');
//         if (event.target === button) {
//             return; // Allow clicks on the button
//         }


//         event.stopImmediatePropagation();
//         event.stopPropagation();
//         event.preventDefault();

//         if (hovered_element){
//             hovered_element.style.backgroundColor = hovered_element.dataset.originalColor || '';
//             let hovered_element_html=hovered_element.outerHTML
//             let hovered_element_styles=get_computed_css(hovered_element)
//             let all_elements=get_simmilar_html_css(hovered_element)
//             console.log(all_elements.length,typeof(all_elements))
//             chrome.runtime.sendMessage({
//                 action:"opentab",
//                 All_Elements:all_elements,
//                 hovered_html:hovered_element_html,
//                 hovered_styles:hovered_element_styles


//             })
//         }
//         };

//     // Attach the event listener to stop clicking
//     document.addEventListener('click', clickListener, true);
// }

// // Remove all event listeners and revert custom behaviors
// function removeEventListeners(){
//     stop_hovering();  // Stop hover behavior
//     if (clickListener) {
//         document.removeEventListener('click', clickListener, true);  // Re-enable clicking
//     }
// }

// function selectSimilarElements(element) {
//     let similarElements = [];
    
//     // // Check if the element has a class
//     if (element.parentElement.classList.length > 0) {
//         // Select all elements that share any class with the target element
//         const classNames = Array.from(element.classList);
//         console.log(classNames)
//         console.log("classnames")
//         classNames.forEach(className => {
//             const elementsWithSameClass = document.querySelectorAll(`.${className}`);
//             similarElements = [...similarElements, ...elementsWithSameClass];
//         });

//         // Remove duplicates from the list of elements
//         similarElements = [...new Set(similarElements)];
//     } else {
//         // If there are no classes, select all elements by tag name (e.g., all <img> tags)
//         const tagName = element.parentElement.tagName.toLowerCase();
//         similarElements = Array.from(document.getElementsByTagName(tagName));
//     }

//     return similarElements;
// }

// function get_computed_css(element){
//     const computedstyle=window.getComputedStyle(element);
//     const elementstyles={};
//     for (let style of computedstyle){
//         elementstyles[style]=computedstyle.getPropertyValue(style);
//     }
//     return elementstyles
// }

// function get_simmilar_html_css(element){
//     let similar_elements = selectSimilarElements(element)
//     let html_css_vals = [];
//     for(let i=0;i<similar_elements.length;i++)
//     {
//         let css = get_computed_css(similar_elements[i]);
//         html_css_vals.push({
//             element_html:similar_elements[i].outerHTML,
//             element_styles:css
//         })
//     }
//     return html_css_vals
// }

// // Initialize the button and its behavior
// let is_started = false;
// let body = document.querySelector("body");

// let btn = document.createElement("button");
// btn.setAttribute("id", "page-btn");
// btn.textContent = "Toggle Highlighting";
// body.appendChild(btn);

// // Toggle between enabling and disabling highlighting
// btn.addEventListener("click", function(){
//     is_started = !is_started;
//     console.log(is_started)
//     intialize_highlighting(is_started);
// }, true);









let mouseOverListener, mouseOutListener, clickListener;
let hovered_element = null;
let selectedElements = []; // Array to store selected elements
let is_started = false; // Track the state of hovering

function initialize_highlighting(is_started) {
    if (is_started) {
        stop_clicking();     // Disable clicking
        start_hovering();    // Start hovering behavior
    } else {
        stop_hovering();     // Stop hovering behavior
        // console.log("sending_data")
        sendDataToBackend(); // Send data to the backend
        removeEventListeners();  // Remove all custom event listeners
    }
}

// Start hovering functionality
function start_hovering() {
    mouseOverListener = function(event) {
        if (event.target !== document.body) {
            event.stopPropagation();
            event.preventDefault();
            event.stopImmediatePropagation();
            const target = event.target;
            
            // Save the original background color
            if (!target.dataset.originalColor) {
                target.dataset.originalColor = window.getComputedStyle(target).backgroundColor;
            }
            
            target.style.backgroundColor = 'grey';   
            hovered_element = target;
        }
    };
    
    mouseOutListener = function(event) {
        event.stopPropagation();
        event.preventDefault();
        event.stopImmediatePropagation();
        const target = event.target;
        
        // Restore original background color
        target.style.backgroundColor = target.dataset.originalColor || '';
    };

    // Attach the event listeners for hover
    document.addEventListener('mouseover', mouseOverListener, true);
    document.addEventListener('mouseout', mouseOutListener, true);
}

// Stop hovering functionality (remove hover listeners)
function stop_hovering() {
    if (mouseOverListener && mouseOutListener) {
        hovered_element = null;
        document.removeEventListener('mouseover', mouseOverListener, true);
        document.removeEventListener('mouseout', mouseOutListener, true);
    }
}

// Disable clicking functionality
function stop_clicking() {
    clickListener = function(event) {
        const button = document.getElementById('page-btn');
        if (event.target === button) {
            return; // Allow clicks on the button
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        if (hovered_element) {
            hovered_element.style.backgroundColor = hovered_element.dataset.originalColor || '';
            if (selectedElements.length >= 2) {
                // Remove the oldest element if we already have two selected elements
                selectedElements.shift();
            }
            selectedElements.push(hovered_element); // Add to selected elements
        }
    };

    // Attach the event listener to stop clicking
    document.addEventListener('click', clickListener, true);
}

// Remove all event listeners and revert custom behaviors
function removeEventListeners() {
    stop_hovering();  // Stop hover behavior
    if (clickListener) {
        document.removeEventListener('click', clickListener, true);  // Re-enable clicking
    }
}

// Function to send data to the backend
function sendDataToBackend() {
    // Get the last two elements from the selectedElements array
    const lastTwoElements = selectedElements.slice(-2);

    const all_elements = lastTwoElements.map(element => {
        return {
            element_html: element.outerHTML,
            element_styles: get_computed_css(element)
        };
    });
    // console.log(all_elements)

    // Send data to the backend
    chrome.runtime.sendMessage({
        action: "opentab",
        all_elements: all_elements,
        single_html: document.documentElement.outerHTML,
        single_body_html:document.body.outerHTML
    });
}

// Function to get computed CSS styles of an element
function get_computed_css(element) {
    const computedStyle = window.getComputedStyle(element);
    const elementStyles = {};
    for (let style of computedStyle) {
        elementStyles[style] = computedStyle.getPropertyValue(style);
    }
    return elementStyles;
}

// Initialize the button and its behavior
let body = document.querySelector("body");

let btn = document.createElement("button");
btn.setAttribute("id", "page-btn");
btn.textContent = "Toggle Highlighting";
body.appendChild(btn);

// Toggle between enabling and disabling highlighting
btn.addEventListener("click", function() {
    is_started = !is_started;
    initialize_highlighting(is_started);
}, true);
