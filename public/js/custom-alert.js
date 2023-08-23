function customAlert(title, msg) {
  const overlay = document.getElementById("overlay");
  const popup = document.getElementById("popup");
  const titleLable = document.getElementById("alertTitle");
  const msgBox = document.getElementById("alertMsg");
  titleLable.innerHTML = title || "";
  msgBox.innerHTML = msg;
  overlay.classList.add("active");
  popup.classList.add("active");
}

function closePopup() {
  const overlay = document.getElementById("overlay");
  const popup = document.getElementById("popup");
  overlay.classList.remove("active");
  popup.classList.remove("active");
}
