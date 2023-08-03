//User login form validation 

const form = document.getElementById('loginForm'); 
const email = document.getElementById('email');
const password = document.getElementById('password');

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
    const passwordValue = password.value.trim();
    const emailValue = email.value.trim();

    if(emailValue === '') {
        setError(email, 'Please enter your email', e);
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

    if(passwordValue === '') {
        setError(password, 'Please enter password', e);
        password.focus();
        return false;
    }
    else{
        setSuccess(password);
    }

    return true;
}

form.addEventListener('submit', function(e) {
    //e.preventDefault();
    console.log('Login submit button recorded');
    if(validateInputs(e)){
        console.log("VALIDATION Success");
    }
})
