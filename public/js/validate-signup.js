const form = document.getElementById('signupForm'); 
const username = document.getElementById('username');
const genderRadio = document.getElementsByName('genderRadio');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const password = document.getElementById('password');
const repassword = document.getElementById('repassword');

const setError = (element, message, e) => {
    e.preventDefault();
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};
const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};
const isValidEmail = email => {
    //const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const re =/[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}/;
    return re.test(String(email).toLowerCase());
}

const setVisible = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'block'; 
}
  
const setHide = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'none'; 
}

function validateInputs(e) {
    setSuccess(username);
    setSuccess(phone);
    setSuccess(email);
    setSuccess(password);
    setSuccess(repassword);

    const usernameValue = username.value.trim();
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const repasswordValue = repassword.value.trim();

    if(usernameValue === '') {
        setError(username, 'Please enter name', e);
        username.focus();
        return false;
    }  
    else{
        setSuccess(username);
    }

    const phonenoRegex = /^\d{10}$/;
    if(phoneValue === ""){
        setSuccess(phone);
    }
    else if(!phoneValue.match(phonenoRegex)){
        setError(phone, 'Enter valid number', e);
        phone.focus();
        return false;
    }
    else{
        setSuccess(phone);
    }

    if(emailValue === '') {
        setError(email, 'Please enter email', e);
        email.focus();
        return false;
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address', e);
        email.focus();
        return false;
    } 
    else{
        setSuccess(email);
    }

    const passwordRegex  = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if(passwordValue === '') {
        setError(password, 'Please enter password', e);
        password.focus();
        return false;
    }
    else if(!passwordValue.match(passwordRegex)){
        setError(password, 'Min 6 characters', e);
        password.focus();
        return false;
    }
    else{
        setSuccess(password);
    }

    if(repasswordValue === '') {
        setError(repassword, 'Please confirm password', e);
        repassword.focus();
        return false;
    } else if(repasswordValue !== passwordValue){
        setError(repassword, 'Password incorrect', e);
        repassword.focus();
        return false;
    }
    else{
        setSuccess(repassword);
    }

    return true;
}

form.addEventListener('submit', function(e) {
    console.log('form submit was recorded');
    validateInputs(e);
})
