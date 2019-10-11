let tableContentContainerEl = document.querySelector('.tableContent');
const serverAddress = 'http://localhost:1337'

let users = [];

const init = async () => {
    let token = await window.sessionStorage.getItem('token');

    if(!token){
        document.location = serverAddress + '/mongoAuth/html/';
    }else{
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
                code += '<div class="tableItem"><div class="tableItemEmail">' + user.email + '</div><div class="tableItemName">' + user.firstName + ' ' + user.lastName + '</div><button class="roleRemoveBtn"><i class="material-icons">delete</i></button></div>'
            })

            tableContentContainerEl.innerHTML = code
        })
    }
}

init();