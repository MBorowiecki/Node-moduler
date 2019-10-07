let tableContentContainerEl = document.querySelector('.tableContent');
let serverAddress = 'http://localhost:1337'

let users = [];

fetch(serverAddress + '/mongoAuth/users', {method: 'GET'})
    .then((res) => {
        return res.json()
    })
    .then((response) => {
        users = response
    })
    .then(() => {
        let code = ""

        users.forEach(user => {
            code += '<div class="tableItem"><div class="tableItemEmail">' + user.email + '</div><div class="tableItemName">' + user.firstName + ' ' + user.lastName + '</div></div>'
        })

        tableContentContainerEl.innerHTML = code
    })

//console.log(users)