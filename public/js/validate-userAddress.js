//User address add & edit form validation 

const setError = (element, message) => {
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

function validateAddressInputs() {
    const customerName = document.getElementById('customerName');
    const addressLine1 = document.getElementById('addressLine1');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const country = document.getElementById('country');
    const pincode = document.getElementById('pincode');
    const phone = document.getElementById('phone');
    const email = document.getElementById('email');
    setSuccess(customerName);
    setSuccess(addressLine1);
    setSuccess(city);
    setSuccess(state);
    setSuccess(country);
    setSuccess(pincode);
    setSuccess(phone);
    setSuccess(email);

    const customerNameValue = customerName.value.trim();
    const addressLine1Value = addressLine1.value.trim();
    const cityValue = city.value.trim();
    const stateValue = state.value.trim();
    const countryValue = country.value.trim();
    const pincodeValue = pincode.value.trim();
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();

    if(customerNameValue === '') {
        setError(customerName, 'Please enter customer name');
        customerName.focus();
        return false;
    } else{
        setSuccess(customerName);
    }
    
    if(addressLine1Value === '') {
        setError(addressLine1, 'Please enter address');
        addressLine1.focus();
        return false;
    } else{
        setSuccess(addressLine1);
    }

    if(cityValue === '') {
        setError(city, 'Please enter city');
        city.focus();
        return false;
    } else{
        setSuccess(city);
    }
    
    if(stateValue === '') {
        setError(state, 'Please enter state');
        state.focus();
        return false;
    } else{
        setSuccess(state);
    }
    
    const pincodeRegex = /^\d{6}$/;
    if(pincodeValue === '') {
        setError(pincode, 'Please enter pincode');
        pincode.focus();
        return false;
    } else if(!pincodeValue.match(pincodeRegex)){
        setError(pincode, 'Enter valid pincode');
        pincode.focus();
        return false;
    }
    else{
        setSuccess(pincode);
    }

    const phonenoRegex = /^\d{10}$/;
    if(phoneValue === ""){
        setError(phone, 'Enter phone number');
        phone.focus();
        return false;
    }
    else if(!phoneValue.match(phonenoRegex)){
        setError(phone, 'Enter valid number');
        phone.focus();
        return false;
    }
    else{
        setSuccess(phone);
    }

    if (!isValidEmail(emailValue)) {
        setError(email, 'Provide a valid email address');
        email.focus();
        return false;
    } 
    else{
        setSuccess(email);
    }

    return true;
}

function confirmEdit(form) {
    const button = document.getElementById('modal-save-btn');
    const btnAction = button.innerHTML;
    console.log('Address submit button recorded');
    if(validateAddressInputs()){
        console.log("VALIDATION Success");
        console.log("Action : " + btnAction);
        if(btnAction === "Save changes"){                    
            if (confirm('Save the changes made to the address ?')) {
                document.getElementById(form).submit();
            }
        }
        else{
            document.getElementById(form).submit();
        }
    } else{
        console.log("Validation FAILED!");
    }
}