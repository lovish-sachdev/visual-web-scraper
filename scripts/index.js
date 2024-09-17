let child1=null
let child2=null
let parent=null

let global_body=null
let global_html=null

document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.local.get(["all_elements", "single_html","single_body_html"], function(result) {
        const container = document.createElement('div');
        container.style.margin = '10px'; // Add some margin to the container
        document.body.appendChild(container); // Append container to the body
        child1=null;
        child2=null;
        // Display all_elements
        if (result.all_elements && Array.isArray(result.all_elements)) {
            
            result.all_elements.forEach(function(jsoon) {
                const html = jsoon.element_html;
                const css = jsoon.element_styles;
                
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;  // Insert the HTML
                wrapper.style.border = "2px solid black"; // Add a border to each element wrapper
                wrapper.style.margin = '5px'; // Add margin for spacing
                

                // Apply the corresponding styles to the wrapper
                // for (const [styleName, styleValue] of Object.entries(css)) {
                //     wrapper.firstChild.style[styleName] = styleValue;
                // }
                wrapper.style.width="100%";
                 // Ensure it covers full width
                wrapper.style.overflowY = "auto";

                // Append the wrapper to the container
                container.appendChild(wrapper);
                if (child1==null){
                    child1=wrapper.firstChild
                }
                else {
                    child2=wrapper.firstChild
                }
            });
        }

        // Display single_html with single_styles
        if (result.single_html) {
            const singleWrapper = document.createElement("div");
            singleWrapper.style.margin = "10px";
            singleWrapper.innerHTML = result.single_html;
            singleWrapper.style.overflowY = "auto";
            singleWrapper.style.border = "2px solid blue"; // Border for the single element wrapper
            singleWrapper.style.padding = "10px"; // Add padding for better appearance
            parent=singleWrapper
            global_html=singleWrapper
            console.log(parent)
        }
        if (result.single_body_html){
            const body_wraper= document.createElement("div")
            body_wraper.innerHTML=result.single_body_html
            console.log(body_wraper)
        }
    console.log(parent)
    // console.log(child1)
    // console.log(child2)

    selector1=generateQuerySelector(child1)
    selector2=generateQuerySelector(child2)
    console.log(selector1)
    console.log(selector2)
    childelement1=findExactElementByHTML(child1,parent)
    childelement2=findExactElementByHTML(child2,parent)
    console.log(childelement1)
    console.log(childelement2)
    path1=findPath(childelement1,parent)
    path2=findPath(childelement2,parent)
    
    path1.reverse()
    path2.reverse()
    maching_path=findMatchingPath(path1,path2)
    console.log(path1)
    console.log(path2)
    console.log(maching_path)
    
    display_elements=findPossibleElements(parent,maching_path)
    // console.log(display_elements)
    displayElementsWithFullWidth(display_elements)

    });
});
function findPath(currentElement, targetElement) {
    if (currentElement === targetElement) {
        // Base case: if the current element is the target element
        
        return [[currentElement.tagName.toLowerCase(), Array.from(currentElement.classList).filter(isValidClassName)]];
    }

    if (currentElement.parentElement) {
        // Recursively check each parent element
        const parentPath = findPath(currentElement.parentElement, targetElement);
        if (parentPath) {
            // If the path is found, prepend the current element to the path
            return [[currentElement.tagName.toLowerCase(), Array.from(currentElement.classList).filter(isValidClassName)], ...parentPath];
        }
    }

    // If no path is found, return null
    return null;
}
function generateQuerySelector(element) {
    if (!element) return null;

    let selector = element.tagName.toLowerCase(); // Start with the tag name

    // If the element has an ID, use it
    if (element.id) {
        selector += `#${CSS.escape(element.id)}`;
        return selector;
    }
    if (element.classList.length > 0) {
        let classNames = '';
        for (let i = 0; i < element.classList.length; i++) {
            
            classNames += `.${CSS.escape(element.classList[i])}`;
        }
        selector += classNames;
    }


    return selector;
}
function findExactElementByHTML(childelement, rootElement) {
    // Create a temporary DOM element to compare
    const tempElement = document.createElement('div');
    tempElement.innerHTML = childelement.outerHTML; // Trim to avoid unnecessary spaces

    const targetHTML = tempElement.firstElementChild.outerHTML; // Get the exact HTML to match

    // Get all elements in the document or within the provided rootElement
    const allElements = rootElement.querySelectorAll('*');

    // Loop through all elements and compare their outerHTML with the targetHTML
    for (let element of allElements) {
        if (element.outerHTML.trim() === targetHTML) {
            return element; // Return the exact matching element
        }
    }

    return null; // Return null if no matching element is found
}

// Function to match two elements based on tag and class list
function match(elementA, elementB,i,j) {
    if (elementA.length === 0 || elementB.length === 0) {
        return [0, 0];
    }

    if (elementA[0] === elementB[0]) {
        const setA = new Set(elementA[1]);
        const setB = new Set(elementB[1]);
        const intersection = new Set([...setA].filter(item => setB.has(item)));
        const union = new Set([...setA, ...setB]);
        const intersectionSize = intersection.size;
        const unionSize = union.size;

        // Return [1, elementA[0], []] if union size is zero
        if (unionSize === 0) {
            if (i==0 || j==0){
                return [1, [elementA[0], []]];
            }
            return [0,[0,0]]
        }

        const probability = intersectionSize
        return [probability, [elementA[0], Array.from(intersection)]];
    }

    return [0, 0];
}

// Function to find a matching path between two lists
function findMatchingPath(path1, path2) {
    let path = [];
    let prevIndex = 0;

    for (let i = 0; i < path1.length; i++) {
        let j = prevIndex;
        while (j < path2.length) {
            const [probability, matchValue] = match(path1[i], path2[j],i,j);
            if (probability > 0.5) {
                path.push(matchValue);
                prevIndex = j + 1;
                break;
            } else {
                j++;
            }
        }
    }

    return path;
}

function isValidClassName(name) {
    // Ensure class name is not empty and starts with a valid character
    if (!name.trim()) return false;

    // Class name should not start with a number and should follow general naming conventions
    const validPattern = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/;

    // Check if the class name contains an equals sign (invalid pattern)
    if (name.includes('=')) return false;

    // Ensure the name matches the pattern for valid class names
    return validPattern.test(name);
}


function tag_class_query(tag, classList) {
    tag=tag.toLowerCase()
    if (!tag || !classList || classList.length === 0) return [tag];

    // Create a query selector for each class combined with the tag
    const selectors = classList.map(cls => `${tag}.${cls}`);

    // Combine them using a comma to match elements with the tag and any of these classes
    // const query = selectors.join(',');

    return selectors;
}
let used_classes=new Set()
let count=0
let target=-1
function findPossibleElements(parent, matchingPath, ) {
    let possible = new Set([parent]);

    for (let i = 1; i < matchingPath.length; i++) {
        const [tag, classList] = matchingPath[i];
    

        if (count === target) {
            displayElementsWithFullWidth(possible);

        }

        count += 1;
        let possible_next = new Set();
        used_classes = new Set();  // To keep track of used classes for the current query only

        // Generate a list of queries based on tag and classList
        const queries = tag_class_query(tag, classList);  // Assume this returns an array of query strings
        
        if (count===target+1){
            return 
        }
        queries.forEach(query => {
            
            possible.forEach(element => {
                // Get all elements for the current query in the current 'possible' element
                const elements = element.querySelectorAll(query);
                
                elements.forEach(ele => {
                    let eleClassList = Array.from(ele.classList);
                    let ele_tag=ele.tagName
                    let compareQuerySet = new Set(tag_class_query(ele_tag, eleClassList)); // Convert list to Set
                    // console.log(compareQuerySet)
                    // console.log(used_classes)
                    
                    let intersection = new Set([...compareQuerySet].filter(x => used_classes.has(x))); // Find intersection with 'used_classes'
                    let intersectionLength = intersection.size; // Get the length of the intersection
                    // console.log(intersection)
                    // console.log(ele)
                    // console.log("A")
                    
                    // Check if the current query has all unique classes compared to used_classes
                    // console.log(intersection)
                    if (intersectionLength===0) {
                        // If unique, add to possible_next and add this query's classes to used_classes
                        possible_next.add(ele);

                        // Only add the current query's classes to used_classes
                        
            }});
            });
            if (query==="div.hfeed"){return}
            
            used_classes.add(query);

        });
        possible = possible_next;  // Move to next set of possible elements

}
return Array.from(possible);

}

function displayElementsWithFullWidth(elements) {
    // Create a container for the elements
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.overflowY = "auto";

    container.style.boxSizing = 'border-box'; // Ensure padding and border are included in width

    // Append each HTML string as a new element with 100% width
    elements.forEach(htmlString => {
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlString.outerHTML;
        const element = tempElement.firstElementChild; // Get the actual element from the temporary container
        element.style.width = '100%'; // Set width to 100%
        element.style.overflowY = "auto";
        
        container.appendChild(element); // Append the element to the container
    });

    // Append the container to the body or another element in your container
    document.body.appendChild(container);
}


