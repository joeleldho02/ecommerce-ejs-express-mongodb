  function closePopup() {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    overlay.classList.remove("active");
    popup.classList.remove("active");
  }
  
  function customConfirm(title, message, yesCallback, formID) {
    const overlay = document.getElementById("overlay");
    const popup = document.getElementById("popup");
    overlay.classList.add("active");
    popup.classList.add("active");
  
    $('#alertTitle').text(title);
    $('#alertMsg').text(message);
  
    $('#btnYes').click(function() {
        console.log("ACCEPPTEDDDDDDDDDD!!");
        closePopup();
        yesCallback(formID);
    });
    $('#btnNo').click(function() {
        console.log("DECLINED!!");
        closePopup();
    });
  }