let emailEl = document.querySelector('.emailInput');
let passwordEl = document.querySelector('.passwordInput');
let loginBtnEl = document.querySelector('.loginBtn');

loginBtnEl.addEventListener("click", async () => {
    let user = {
        email: emailEl.value,
        password: passwordEl.value
    }

    await fetch('http://localhost:1337/mongoAuth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(user)})
    .then((res) => {
        return res.json(res);
    })
    .then((res) => {
        window.sessionStorage.setItem("token", res.token);
        window.sessionStorage.setItem("email", res.user.email);
        window.sessionStorage.setItem("_id", res.user._id);
        document.location.href = "http://localhost:1337/mongoAuth/html/pages/accounts.html"
    })
})