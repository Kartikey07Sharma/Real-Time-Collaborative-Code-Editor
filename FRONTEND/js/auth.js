const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleSelect = document.getElementById("role");

const submitBtn = document.getElementById("submitBtn");
const toggleBtn = document.getElementById("toggleBtn");
const formTitle = document.getElementById("formTitle");
const errorMsg = document.getElementById("errorMsg");

let isLogin = true;

//  TOGGLE LOGIN / REGISTER
toggleBtn.addEventListener("click", () => {
  isLogin = !isLogin;

  if (isLogin) {
    formTitle.innerText = "Login";
    submitBtn.innerText = "Login";
    roleSelect.style.display = "none";
    toggleBtn.innerText = "Register";
  } else {
    formTitle.innerText = "Register";
    submitBtn.innerText = "Register";
    roleSelect.style.display = "block";
    toggleBtn.innerText = "Login";
  }

  errorMsg.innerText = "";
});

//  SUBMIT
submitBtn.addEventListener("click", async () => {

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleSelect.value;

  if (!username || !password) {
    errorMsg.innerText = "All fields are required";
    return;
  }

  const url = isLogin ? "/api/auth/login" : "/api/auth/register";

  try {

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
        isLogin
          ? { username, password }
          : { username, password, role }
      )
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.innerText = data.error || "Something went wrong";
      return;
    }

    //  LOGIN SUCCESS
    if (isLogin) {
      localStorage.setItem("token", data.token);

      // redirect to main app
      window.location.href = "app.html";
    } else {
      errorMsg.style.color = "green";
      errorMsg.innerText = "Registered successfully. Please login.";
    }

  } catch (err) {
    errorMsg.innerText = "Server error";
  }

});