firebase.initializeApp(config);

// Get ALL THE ELEMENTS
// Log in page
var emailField = document.getElementById('email')
var passField = document.getElementById('pass')
var loginBtn = document.getElementById('login')
var signupBtn = document.getElementById('signup')
var logoutBtn = document.getElementById('logout')
var form = document.getElementById('signinform')
var loggedin = document.getElementById('loggedin')
var signupLink = document.getElementById('signuplink')
var loginLink = document.getElementById('loginlink')
var dont = document.getElementById('dont')
// List funcitonality
var submitItem = document.getElementById('submititem')
var input = document.getElementById('input')
var inputDate = document.getElementById('inputdate')
var list = document.getElementById('list')
var noData = document.getElementById('no-data')

// Title functionality
var subTitle = document.getElementById('submittitle')
var inpTitle = document.getElementById('changetitle')
var listTitle = document.getElementById('listtitle')

// Basically the auth
var loading = document.getElementById('loading')
var online = document.getElementById('online')

var s = document.getElementById('s')
var listLength = document.getElementById('listlength')

var errorDiv = document.getElementById('error')
var listError = document.getElementById('list-error')

// Sign up / log in functionality
signupBtn.classList.add('hide')
loginLink.classList.add('hide')

signupLink.onclick = function(){
    signupBtn.classList.remove('hide')
    loginLink.classList.remove('hide')

    loginBtn.classList.add('hide')
    signupLink.classList.add('hide')
    dont.classList.add('hide')
}

loginLink.onclick = function(){
    loginBtn.classList.remove('hide')
    signupLink.classList.remove('hide')

    signup.classList.add('hide')
    loginLink.classList.add('hide')
    dont.classList.remove('hide')
}
// set the list elements
function setList(uid, listItem, dateFor){
    // Get today's date
    let now = new Date()
    // Setup year/month/day format
    let itemDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    // set list item and date in DB
	firebase.database().ref('lists/' + uid + '/list').push({
		text:listItem,
		dateAdded: itemDate,
        dateDue: dateFor
	})
	input.value = ""
}


// Change the title
function setTitle(uid, title){
    firebase.database().ref('lists/' + uid).update({listTitle: title})
    inpTitle.value = ""
}
function removeItem(uid, itemKey){
    firebase.database().ref('lists/' + uid + '/list/' + itemKey).set(null)
}
// BLESS STACK OVERFLOW
function isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--; ) {
        if (c[i].nodeType == 1) return true;
    }
    return false;
}
// Onclick login
loginBtn.addEventListener('click', e => {
	// Get email password values
	var email = emailField.value
	var pass = passField.value
	// Setup auth
	var auth = firebase.auth()
	// Try sign in
	var signin = auth.signInWithEmailAndPassword(email, pass)
	signin.catch(e => {
        if (e.code) {
            errorDiv.classList.remove("hide")
            errorDiv.innerText = e.message
        }
        else {
            errorDiv.classList.add("hide")
        }
    })
})
// Onclick sign up
signupBtn.addEventListener('click', e => {
	// get email password values
	var email = emailField.value
	var pass = passField.value
	// setup auth
	var auth = firebase.auth()
	// try sign up
	var signin = auth.createUserWithEmailAndPassword(email, pass)
	signin.catch(e => {
        if (e.code) {
            errorDiv.classList.remove("hide")
            errorDiv.innerText = e.message
        }
        else {
            errorDiv.classList.add("hide")
        }
    })
})
// Onclick log out
logoutBtn.addEventListener('click', e => {
	firebase.auth().signOut()
})
// check log in
firebase.auth().onAuthStateChanged(user => {
	if (user) {
		// Logged in!
		// reveal dashboard
		logoutBtn.classList.remove('hide')
		form.classList.add('hide')
		loggedin.classList.remove('hide')
		// Greeting with email
		document.getElementById('username').innerHTML = user.email

		// Setup onclicks for submitting list items and title changes
        let inputVal
		submitItem.onclick = function(){
			inputVal = input.value.trim()
            inDateVal = inputDate.value || "N/A"
            if (inputVal && !isHTML(inputVal)) {
                // Set the list
                setList(user.uid, inputVal, inDateVal)
                listError.classList.add("hide")
            }
            else {
                listError.classList.remove("hide")
                input.value = ""
                listError.innerText = "Invalid input"
            }
		}
        subTitle.onclick = function(){
            inputVal = inpTitle.value
            if (inputVal) {
            	// Same as above but sets title
                setTitle(user.uid, inputVal)
            }
        }
        var id = user.uid
        // Get the data
		var dbList = firebase.database().ref('lists/' + user.uid)
		// once we got it
		dbList.on('value', function(snapshot){
			// save in var
			var dbListData = snapshot.val()
			// clear list
            list.innerHTML = ""
            // if there is list data
            if (dbListData.list) {
    			var struct = dbListData.list
                var keyArr = []
                // create list of keys
    			for (var key in struct){
                    keyArr.push(key)
    			}
                // change number of items on UI
                if (keyArr.length > 1) {
                    s.innerText = "s"
                }
                else {
                    s.innerText = ""
                    if (keyArr.length) {
                        s.innerText = "s"
                        listLength.innerText = "0"
                    }
                }
                listLength.innerText = keyArr.length
                // iterate over the key array and write data using the snapshot from firebase and the key array
                keyArr.reverse().map(key => {
                    if (struct[key].text && struct[key].dateAdded) {
    				    list.innerHTML += `<tr id="${key}">
                            <td>${struct[key].text}</td>
                            <td>${struct[key].dateAdded}</td>
                            <td>${struct[key].dateDue}</td>
                            <td><button id="button-${key}" type="button" class="button-danger" onclick="removeItem('${id}','${key}')" title="Delete item?">X</button></td>
                        </tr>`
    				}
                })
            }
            // if no items in list
            else {
                listLength.innerText = "0"
                s.innerText = "s"
            }
            // if the list has a title
            if (dbListData.listTitle) {
                // Write list title and add an approptiate placeholder
            	document.getElementById('listtitle').innerText = dbListData.listTitle
                inpTitle.placeholder = "Change Title"
            }
            else {
                // Change placeholder to make sense
                inpTitle.placeholder = "Add a title to your list"
            }
		})
	}
    // If user not logged in
	else {
		form.classList.remove('hide')
		loggedin.classList.add('hide')
		logoutBtn.classList.add('hide')
	}
})
// Check connection
var connectedRef = firebase.database().ref(".info/connected");

connectedRef.on("value", function(snap) {
    // once connected remove loading screen
	if (snap.val()) {
		online.classList.remove('hide')
		loading.classList.add('hide')
	}
    // if not connected show loading screen
    else {
		online.classList.add('hide')
		loading.classList.remove('hide')
	}
});
