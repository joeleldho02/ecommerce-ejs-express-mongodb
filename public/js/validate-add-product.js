const tagContainer = document.getElementById('tags');
const tagInput = document.getElementById('tag-input');
const tagsArray = [];
tagInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter' || event.key === ',') {
        let inputValue;
        if (event.key === ',') {
            inputValue = tagInput.value.trim().slice(0, -1);
        } else {
            inputValue = tagInput.value.trim();
        }

        console.log(inputValue[inputValue.length - 1]);
        console.log(inputValue);
        if (inputValue) {
            const tagElement = document.createElement('div');
            tagElement.classList.add('tag');
            tagElement.innerHTML = `
                <span class="tag-text">${inputValue}</span>
                <span class="tag-remove" onclick="removeTag(this)">x</span>
            `;

            tagsArray.push(inputValue);
            tagContainer.style.display = 'flex';
            tagContainer.appendChild(tagElement);
            tagInput.value = '';
        }
    }
});
function removeTag(tagElement) {
    const tagText = tagElement.previousElementSibling.textContent;
    const index = tagsArray.indexOf(tagText);

    if (index !== -1) {
        tagsArray.splice(index, 1);
    }

    tagContainer.removeChild(tagElement.parentElement);

    if (tagsArray.length === 0) {
        tagContainer.style.display = 'none';
    }
}
//prevent form submitting when enter key is pressed.
$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

//User login form validation 
const form = document.getElementById('newProductForm'); 
const productName = document.getElementById('productName');
const shortDescription = document.getElementById('shortDescription');
const description = document.getElementById('description');
const regularPrice = document.getElementById('regularPrice');
const salePrice = document.getElementById('salePrice');
const stock = document.getElementById('stock');
const productImage = document.getElementById('productImage');
const category = document.getElementById('category');
const productID = document.getElementById('productID');

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
const setVisible = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'block'; 
}  
const setHide = (x) => {
    var element = document.getElementById(x);
    element.style.display = 'none'; 
}
const isValidNumber = (number) => {
    const re =/[0-9]{1,3}/;
    return re.test(String(number).toLowerCase());
}
const isValidText = (text) => {
    const re =/[a-zA-Z0-9]/;
    return re.test(String(text).toLowerCase());
}
function validateInputs() {
    const productNameValue = productName.value.trim();
    const shortDescriptionValue = shortDescription.value.trim();
    const descriptionValue = description.value.trim();
    const regularPriceValue = regularPrice.value.trim();
    const salePriceValue = salePrice.value.trim();
    const stockValue = stock.value.trim();
    const productImageValue = productImage.value.trim();

    if(productNameValue === '') {
        setError(productName, 'Please enter product name');
        productName.focus();
        return false;
    } else if (!isValidText(productNameValue)) {
        setError(productName, 'Provide a valid product name');
        productName.focus();
        return false;
    } 
    else{
        setSuccess(productName);
    }

    if(shortDescriptionValue === '') {
        setError(shortDescription, 'Please enter short description');
        shortDescription.focus();
        return false;
    }
    else{
        setSuccess(shortDescription);
    }

    if(descriptionValue === '') {
        setError(description, 'Please enter description');
        description.focus();
        return false;
    }
    else{
        setSuccess(description);
    }
    
    if(category.value === "select"){
      setError(category, 'Please select a category');
      return false;
    }
    else{
      setSuccess(category);
    }

    if(regularPriceValue === '') {
        setError(regularPrice, 'Enter regular price');
        regularPrice.focus();
        return false;
    } else if (!isValidNumber(regularPriceValue)) {
        setError(regularPrice, 'Provide a valid price');
        regularPrice.focus();
        return false;
    } 
    else{
        setSuccess(regularPrice);
    }

    if(salePriceValue === '') {
      setError(salePrice, 'Enter sale price');
      salePrice.focus();
      return false;
    } else if (!isValidNumber(salePriceValue)) {
      setError(salePrice, 'Provide a valid price');
      salePrice.focus();
      return false;
    } else if(salePriceValue > regularPriceValue){
      setError(salePrice, 'Price must be less than regular price');
      salePrice.focus();
      return false;
    }
    else{
      setSuccess(salePrice);
    }

    if(stockValue === '') {
      setError(stock, 'Enter stock');
      stock.focus();
      return false;
    } else if (!isValidNumber(stockValue)) {
      setError(stock, 'Provide a valid stock');
      stock.focus();
      return false;
    } 
    else{
      setSuccess(stock);
    }

    if(productID === null){
      if(productImageValue === '') {
        setError(productImage, 'Please upload images');
        productImage.focus();
        return false;
      }
      else{
        setSuccess(productImage);
      }
    }    

    return true;
}
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Login submit button recorded');
    if(validateInputs()){
        console.log("VALIDATION Success");
    }
})

function submitForm() {
    //submitSelectedFiles();
    const tagsString = tagsArray.join(', ');
    document.getElementById('productTags').value = tagsString;
    //console.log('Tags as comma-separated string:', tagsString);
    //.preventDefault();
    console.log('Login submit button recorded');
    if(validateInputs()){
      console.log("VALIDATION Success");
      console.log("Form submitted!");   
      document.getElementById('newProductForm').submit();
    }
}
  
let selectedFiles = [];
  
let imagesPreview = function(placeToInsertImagePreview) {
  $(placeToInsertImagePreview).empty();
    
  if (selectedFiles) {
    for (let i = 0; i < selectedFiles.length; i++) {
      let reader = new FileReader();
      reader.onload = function(event) {
        let imagePreview = document.createElement('div');
        imagePreview.classList.add('preview-image');
  
        let img = document.createElement('img');
        img.src = event.target.result;
  
        let removeButton = document.createElement('span');
        removeButton.classList.add('remove-button');
        removeButton.innerHTML = 'x';
  
        removeButton.addEventListener('click', () => {
          imagePreview.remove();
          selectedFiles = selectedFiles.filter((file, index) => index !== i);
          imagesPreview(".preview-images");
          updateInputValue();
        });
  
        imagePreview.appendChild(img);
        imagePreview.appendChild(removeButton);
  
        $(placeToInsertImagePreview).append(imagePreview);
      };
      reader.readAsDataURL(selectedFiles[i]);
    }
  }
};
  
function updateInputValue() {
  let label = document.querySelector('.custom-input-label');
  let span = label.querySelector('span');
  if (selectedFiles.length > 0) {
    span.textContent = `${selectedFiles.length} files selected`;
  } else {
    span.textContent = 'Select Files';
  }
  console.log(selectedFiles);
}
  
$("#productImage").on("change", function() {
  selectedFiles = Array.from(this.files);
  imagesPreview(".preview-images");
  updateInputValue();
});