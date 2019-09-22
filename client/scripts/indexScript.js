const serverAddress = "http://localhost:1337"
let modules = [];
let modulesSidebarContainer = document.querySelector('.modulesSidebarContainer')

const getAllModules = () => {
    fetch(serverAddress + '/getAllModules', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then((res) => {
        return res.json()
    })
    .then((data) => {
        modules = data.modules
    })
    .then(() => {
        writeToHTML()
    })
}

const writeToHTML = () => {
    let htmlCode = ""
    modules.forEach((module) => {
        let image = "";
        if(module.logoSrc.length > 0){
            image = "<img src='" + module.logoSrc + "' class='moduleLogo'/>"
        }
        if(module.htmlSrc.length > 0){
            htmlCode += "<div class='module'><a href='" + serverAddress + module.htmlSrc + "'>" + image + "<div class='moduleTitle'>" + module.name + "</div></a></div>"
        }else{
            htmlCode += "<div class='module'>" + image + "<div class='moduleTitle'>" + module.name + "</div></div>"
        }
    })
    modulesSidebarContainer.innerHTML = htmlCode;
}

getAllModules();
