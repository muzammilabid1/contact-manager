if (
  localStorage.getItem("currentUser") &&
  window.location.pathname.endsWith("index.html")
) {
  window.location.href = "dashboard.html";
}
//Dom elements
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const addForm = document.querySelector(".add-form");
const signupBtn = document.querySelector(".signup-btn");
const loginBtn = document.querySelector(".login-btn");
const logoutBtn = document.querySelector(".logout-btn");
const updateForm = document.querySelector(".edit-form");
const deleteBtn = document.querySelector(".delete-btn");
const updateBtn = document.querySelector(".update-btn");
const pasEye = document.querySelectorAll(".password-toggle");
const cardContainer = document.querySelector(".contact-list");



// ** password showing or hiding **
const passToggle = (e) => {
  const inp = e.target.closest(".input-field").querySelector("input");

  inp.type = inp.type === "password" ? "text" : "password";
}

//** generate a unique id (used for both users and contacts) **
const generateId = () => {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

//** users: get from / save to local storage **
// storage key "users" -> array of { id, fullName, email, pass }
const getUsers = () => {
  return JSON.parse(localStorage.getItem("users")) || [];
}

const saveUsers = (usersArr) => {
  try {
    localStorage.setItem("users", JSON.stringify(usersArr));
  } catch (err) {
    alert("❌ Error saving user: " + err.name);
    alert(err.message);
  }
}

//** contacts: get from / save to local storage **
// storage key "contacts" -> flat array of contact objects, each with its own id
// and a userId pointing back at the owning user
const getContacts = () => {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

const saveContacts = (contactsArr) => {
  try {
    localStorage.setItem("contacts", JSON.stringify(contactsArr));
  } catch (err) {
    alert("❌ Error saving contact: " + err.name);
    alert(err.message);
  }
}

//** find a single contact by its id **
const findContactById = (id) => {
  const contacts = getContacts();
  return contacts.find(c => c.id === id);
}

//**   signup **
const signup = (e) => {
  e.preventDefault();


  //?? sign up inputs values

  let fullName = document.querySelector("#full-name")
    .value.toLowerCase().trim().replaceAll(/\s+/g, " ");

  let email = document.querySelector("#email")
    .value.trim();

  let pass = document.querySelector("#password")
    .value.trim().replaceAll(/\s+/g, " ");

  let confirmPass = document.querySelector("#confirm-password")
    .value.trim().replaceAll(/\s+/g, " ");

  const users = getUsers();
  const isExistingEmail = users.some(elem => elem.email === email);
  if (isExistingEmail) {
    alert("The email is already existed!");
    return;
  }
  if (pass === confirmPass) {
    if (fullName !== "" && email !== "" && pass !== "") {
      const newUser = { id: generateId(), fullName, email, pass };
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem("currentUser", newUser.id);
      document.querySelector("#full-name").value = "";
      document.querySelector("#email").value = "";
      document.querySelector("#password").value = "";
      document.querySelector("#confirm-password").value = "";
    } else {
      // required fields missing - don't proceed to dashboard
      return;
    }
  } else {
    alert("Password isn't matched!");
    return;
  }
  window.location.href = "dashboard.html";
}

//** login */
const login = () => {
  const emailInp = document.querySelector("#email")
    .value.trim();
  const passInp = document.querySelector("#password")
    .value.trim();
  const users = getUsers();
  const user = users.find(elem => elem.email === emailInp && elem.pass === passInp)
  if (user) {
    localStorage.setItem("currentUser", user.id);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password!");
  }
}

//** logout */
const logout = () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}



//** to display */
const toDisplay = (obj) => {


  const article = document.createElement("article");
  article.classList.add("contact-card");
  article.dataset.id = obj.id;
  article.innerHTML = `<div class="contact-image">
                  <img src="${obj.imgUrl}" alt="Profile Picture" /> 
                </div>

                <div class="contact-details">
                  <h3> ${obj.firstName}  ${obj.lastName}</h3>

                  <p class="job-title">${obj.jobTitle}</p>

                  <div class="contact-info">
                    <p>
                      <i class="ri-mail-line"></i>

                      ${obj.email}
                    </p>

                    <p>
                      <i class="ri-phone-line"></i>

                      ${obj.phoneNum}
                    </p>

                    <p>
                      <i class="ri-phone-fill"></i>

                      ${obj.alternatePhoneNum}
                    </p>

                    <p>
                      <i class="ri-building-line"></i>

                      ${obj.jobTitle}
                    </p>

                    <p>
                      <i class="ri-map-pin-line"></i>

                      ${obj.city} , ${obj.country}
                    </p>
                  </div>
                </div>

                <!-- Actions -->

                <div class="contact-actions">
                  <button class="action-btn view-btn">
                    <i class="ri-eye-line"></i>

                    View
                  </button>

                  <button class="action-btn edit-btn">
                    <i class="ri-edit-line"></i>

                    Edit
                  </button>

                  <button class="action-btn delete-btn">
                    <i class="ri-delete-bin-line"></i>

                    Delete
                  </button>
                </div>`
  const contactList = document.querySelector(".contact-list");
  contactList?.append(article);
}

//** get value by selector */
const getValue = (s) => {
  return document.querySelector(s).value.trim().toLowerCase();
}

//** ADD contact */
const contactAdd = () => {
  const profile = document.querySelector("#profile-image");
  const email = getValue("#email");
  const phoneNum = getValue("#phone");
  const alternatePhoneNum = getValue("#alternate-phone");
  const file = profile.files[0];
  if (!file) {
    alert("Please upload a profile picture.");
    return;
  }
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image.");
    return;
  }
  if (file.size > 200000) {
    alert("Image must be less than 200KB");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {

    const currUserId = localStorage.getItem("currentUser");
    const users = getUsers();
    const user = users.find(elem => elem.id === currUserId);

    if (!user) {
      alert("User not found!");
      return;
    }

    const contacts = getContacts();
    const userContacts = contacts.filter(c => c.userId === currUserId);

    const isDuplicate = userContacts.some(elem => {
      return (elem.email === email || elem.phoneNum === phoneNum || elem.alternatePhoneNum === alternatePhoneNum);
    })
    if (isDuplicate) {
      alert("Email or phone number already exists!");
      return;
    }

    const contactObj = {
      id: generateId(),
      userId: currUserId,
      firstName: getValue("#first-name"),
      lastName: getValue("#last-name"),
      email: getValue("#email"),
      imgUrl: reader.result,
      phoneNum: getValue("#phone"),
      alternatePhoneNum: getValue("#alternate-phone"),
      dob: getValue("#dob"),
      gender: getValue("#gender"),
      company: getValue("#company"),
      jobTitle: getValue("#job-title"),
      address: getValue("#address"),
      city: getValue("#city"),
      country: getValue("#country"),
      notes: getValue("#notes")
    };
    contacts.push(contactObj);
    saveContacts(contacts);
    window.location.href = "dashboard.html";
  }
  reader.readAsDataURL(file);
}

//?? when contacts is empty show this
const toggleEmptyMessage = () => {
  if (window.location.pathname.endsWith("dashboard.html")) {
    const emptyMessage = document.querySelector(".contact-empty");

    const currUserId = localStorage.getItem("currentUser");
    const contacts = getContacts();
    const userContacts = contacts.filter(c => c.userId === currUserId);

    emptyMessage.style.display =
      userContacts.length === 0 ? "block" : "none";
  }
}

//** display contacts */
const displayContacts = () => {
  const contactList = document.querySelector(".contact-list");

  if (!contactList) return;

  contactList.innerHTML = "";

  const currUserId = localStorage.getItem("currentUser");
  const contacts = getContacts();
  const userContacts = contacts.filter(c => c.userId === currUserId);
  userContacts.forEach(contact => {
    toDisplay(contact);
  })
  toggleEmptyMessage();
}


//** appending user data in view.html */
const toView = (obj) => {
  const detailsWrapper = document.createElement("div");
  detailsWrapper.classList.add("details-wrapper");
  detailsWrapper.innerHTML = `<div class="details-header">
              <a href="dashboard.html" class="back-btn">
                <i class="ri-arrow-left-line"></i>
                Back
              </a>

              <h1>Contact Details</h1>
            </div>

            <!-- Profile -->

            <div class="profile-card">
              <div class="profile-image">
                <img src="${obj.imgUrl}" alt="Profile Picture" />
              </div>

              <h2>${obj.firstName} ${obj.lastName}</h2>

              <p class="job-title">${obj.jobTitle}</p>
            </div>

            <!-- Information -->

            <div class="info-grid">
              <div class="info-card">
                <h3>
                  <i class="ri-user-line"></i>
                  Personal Information
                </h3>

                <div class="info-list">
                  <p>
                    <strong>First Name:</strong>
                    ${obj.firstName}
                  </p>

                  <p>
                    <strong>Last Name:</strong>
                    ${obj.lastName}
                  </p>

                  <p>
                    <strong>Email:</strong>
                    ${obj.email}
                  </p>

                  <p>
                    <strong>Phone:</strong>
                    ${obj.phoneNum}
                  </p>

                  <p>
                    <strong>Alternate Phone:</strong>
                    ${obj.alternatePhoneNum}
                  </p>

                  <p>
                    <strong>Date Of Birth:</strong>
                    ${obj.dob}
                  </p>

                  <p>
                    <strong>Gender:</strong>
                    ${obj.gender}
                  </p>
                </div>
              </div>

              <div class="info-card">
                <h3>
                  <i class="ri-briefcase-line"></i>

                  Professional Information
                </h3>

                <div class="info-list">
                  <p>
                    <strong>Company:</strong>
                    ${obj.company}
                  </p>

                  <p>
                    <strong>Job Title:</strong>
                    ${obj.jobTitle}
                  </p>
                </div>
              </div>

              <div class="info-card">
                <h3>
                  <i class="ri-map-pin-line"></i>

                  Address Information
                </h3>

                <div class="info-list">
                  <p>
                    <strong>Address:</strong>
                    ${obj.address}
                  </p>

                  <p>
                    <strong>City:</strong>
                    ${obj.city}
                  </p>

                  <p>
                    <strong>Country:</strong>
                    ${obj.country}
                  </p>
                </div>
              </div>

              <div class="info-card notes-card">
                <h3>
                  <i class="ri-sticky-note-line"></i>

                  Notes
                </h3>

                <p>${obj.notes}</p>
              </div>
            </div>

            <!-- Actions -->

            <div class="details-actions">
              <a href="editcontact.html" class="btn btn-primary">
                <i class="ri-edit-line"></i>

                Edit Contact
              </a>

              <a href="dashboard.html" class="btn back-home"> Back Dashboard </a>
            </div>`
  document.querySelector(".container").append(detailsWrapper);
}


//** view contact full information */
const viewDetails = (e) => {
  const card = e.target.closest(".contact-card");
  const contactId = card.dataset.id;

  const dataToView = findContactById(contactId);
  if (!dataToView) {
    alert("Contact not found!");
    return;
  }
  localStorage.setItem("dataToView", contactId);
  //redirecting to contactdetails / view in details
  window.location.href = "contactdetails.html";
}
if (window.location.pathname.endsWith("contactdetails.html")) {
  const viewId = localStorage.getItem("dataToView");
  const data = getContacts().find(c => c.id === viewId);
  if (!data) {
    alert("Contact not found!");
    window.location.href = "dashboard.html";
  } else {
    toView(data);
  }
}

//?? a function return element by query selector;
const elem = query => document.querySelector(query);

//** fill input */
const fillInput = obj => {
  // console.log(obj);
  localStorage.setItem("cardToUpdate", obj.id);
  //show img by src. not fill input
  elem(".picture").src = obj.imgUrl;
  elem("#first-name").value = obj.firstName;
  elem("#last-name").value = obj.lastName;
  elem("#email").value = obj.email;
  elem("#phone").value = obj.phoneNum;
  elem("#alternate-phone").value = obj.alternatePhoneNum;
  elem("#dob").value = obj.dob;
  elem("#gender").value = obj.gender;
  elem("#company").value = obj.company;
  elem("#job-title").value = obj.jobTitle;
  elem("#address").value = obj.address;
  elem("#city").value = obj.city;
  elem("#country").value = obj.country;
  elem("#notes").value = obj.notes;

}

//** edit values */
const editValues = e => {
  const card = e.target.closest(".contact-card");
  const contactId = card.dataset.id;
  const dataToEdit = findContactById(contactId);
  if (!dataToEdit) {
    alert("Contact not found!");
    return;
  }
  localStorage.setItem("dataToEdit", contactId);
  window.location.href = "editcontact.html";
}
if (window.location.pathname.endsWith("editcontact.html")) {
  const editId = localStorage.getItem("dataToEdit");
  const data = getContacts().find(c => c.id === editId);

  if (!data) {
    alert("Contact not found!");
    window.location.href = "dashboard.html";
  } else {
    fillInput(data);
  }
}


//** update form */
const updateValues = () => {
  const contactId = localStorage.getItem("cardToUpdate");
  const contacts = getContacts();
  const userContactCard = contacts.find(c => c.id === contactId);
  if (!userContactCard) {
    alert("Contact not found!");
    window.location.href = "dashboard.html";
    return;
  }

  const updatedFields = {
    firstName: elem("#first-name").value,
    lastName: elem("#last-name").value,
    email: elem("#email").value,
    phoneNum: elem("#phone").value,
    alternatePhoneNum: elem("#alternate-phone").value,
    dob: elem("#dob").value,
    gender: elem("#gender").value,
    company: elem("#company").value,
    jobTitle: elem("#job-title").value,
    address: elem("#address").value,
    city: elem("#city").value,
    country: elem("#country").value,
    notes: elem("#notes").value
  };

  const isDuplicate = contacts.some(c => {
    if (c.id === userContactCard.id) return false;
    if (c.userId !== userContactCard.userId) return false;
    return (c.email === updatedFields.email || c.phoneNum === updatedFields.phoneNum || c.alternatePhoneNum === updatedFields.alternatePhoneNum);
  })

  if (isDuplicate) {
    alert("Email or phone number already exists!");
    return;
  }

  Object.assign(userContactCard, updatedFields);

  const pic = document.querySelector(".pic-input")
  const file = pic.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }
    if (file.size > 200000) {
      alert("Image must be less than 200KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      userContactCard.imgUrl = reader.result;
      saveContacts(contacts);
      window.location.href = "dashboard.html";
    }
    reader.readAsDataURL(file);
  } else {
    userContactCard.imgUrl = elem(".picture").src;
    saveContacts(contacts);
    window.location.href = "dashboard.html";
  }
}

//** delete Contact */
const deleteCon = e => {
  const card = e.target.closest(".contact-card");
  const contactId = card.dataset.id;
  const contacts = getContacts();
  const updatedContacts = contacts.filter(c => c.id !== contactId);
  saveContacts(updatedContacts);
  displayContacts();
}
let searchInp;
if (window.location.pathname.endsWith("dashboard.html")) {
  searchInp = document.querySelector(".search-box").lastElementChild;
}
// //** search function */]
const search = (e) => {
  const searchItem = searchInp.value.trim()
    .replaceAll(/\s+/g, " ")
    .toLowerCase();
  const currUserId = localStorage.getItem("currentUser");
  const contacts = getContacts();
  const userContacts = contacts.filter(c => c.userId === currUserId);
  const name = userContacts.filter(elem => (elem.firstName.includes(searchItem) || elem.lastName.includes(searchItem)) || (elem.phoneNum.includes(searchItem) || elem.alternatePhoneNum.includes(searchItem)));
  contactList.innerHTML = "";
  name.forEach(elem => toDisplay(elem));
}

//delete user when not login
if (
  !localStorage.getItem("currentUser") &&
  window.location.pathname.endsWith("dashboard.html")
) {
  window.location.href = "index.html";
}
//?? <----       ..........     --------->  ??//
//** event listener **//
//?? <----       ..........     --------->  ??//
signupForm?.addEventListener("submit", e => {
  e.preventDefault();
  signup(e);
})

pasEye.forEach(elem => {
  elem.addEventListener("click", e => {
    passToggle(e);
  });
});

logoutBtn?.addEventListener("click", logout);

loginForm?.addEventListener("submit", e => {
  e.preventDefault();
  login();
})

addForm?.addEventListener("submit", e => {
  e.preventDefault();
  contactAdd();
});


//displaying contacts
const contactList = document.querySelector(".contact-list");
if (contactList) {
  displayContacts();
}

if (cardContainer) {
  cardContainer.addEventListener("click", e => {
    // e.preventDefault();
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      viewDetails(e);
    }

    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      editValues(e);
    }

    const deleteBtn = e.target.closest(".delete-btn");
    if (deleteBtn) {
      deleteCon(e);
    }
  })
}

if (updateForm) {
  updateForm.addEventListener("submit", e => {
    e.preventDefault();
    updateValues(e);
  })
}
if (searchInp) {
  searchInp.addEventListener("input", (e) => {
    e.preventDefault();
    search(e);
  })
}
//?? make dynamic name heading or greeting on dashboard
if (window.location.pathname.endsWith("dashboard.html")) {
  const currUserId = localStorage.getItem("currentUser");
  const users = getUsers();
  const user = users.find(elem => elem.id === currUserId);
  if (user) {
    document.querySelector(".user-name").textContent = user.fullName;
    document.querySelector(".user-greeting").textContent = `Welcome Back, ${user.fullName} 👋`;
  }
}

//?? a function to change pic when user enter pic;
const updatePicAtTime = (inp, pic) => {
  const fileInput = document.querySelector(inp);
  const previewImg = document.querySelector(pic);
  if (!fileInput || !previewImg) return;
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      previewImg.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

//?? for edit.html
if (window.location.pathname.endsWith("editcontact.html")) {
  updatePicAtTime(".pic-input", ".picture");
}
//?? for addcontact.html
if (window.location.pathname.endsWith("addcontact.html")) {
  updatePicAtTime("#profile-image", ".img-tag--addcontact");
}
