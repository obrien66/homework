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

// Onclick login
loginBtn.addEventListener('click', e => {
	// Get email password values
	var email = emailField.value
	var pass = passField.value
	// Setup auth
	var auth = firebase.auth()
	// Try sign in
	var signin = auth.signInWithEmailAndPassword(email, pass)
	signin.catch(e => console.log(e.message))
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
	signin.catch(e => console.log(e.message))
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
			inputVal = input.value
            inDateVal = inputDate.value || "N/A"
            if (inputVal) {
                // Set the list
                setList(user.uid, inputVal, inDateVal)
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
            console.log(dbListData)
			// clear list
            list.innerHTML = ""
            // if there is list data
            if (dbListData.list) {
            	// iterate and write data
				// dbListData.list.map(item => {
    //             	list.innerHTML += `<li>${item.text} ${item.date}</li>`
    //         	})
    			var struct = dbListData.list
                var keyArr = []
    			for (var key in struct){
                    keyArr.push(key)
    			}
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

                keyArr.reverse().map(key => {
                    if (struct[key].text && struct[key].dateAdded) {
    					// list.innerHTML += `<li id="${key}">${struct[key].text} <span class="badge" id="smaller">${struct[key].date}</span> <button type="button" class="button-danger">X</button></li>`
    				    list.innerHTML += `<tr id="${key}">
                            <td>${struct[key].text}</td>
                            <td>${struct[key].dateAdded}</td>
                            <td>${struct[key].dateDue}</td>
                            <td><button id="button-${key}" type="button" class="button-danger" onclick="removeItem('${id}','${key}')" title="Delete item?">X</button></td>
                        </tr>`
                        // console.log(document.getElementById(`button-${key}`).onclick)
    				}
                })
            }
            else {
                listLength.innerText = "0"
                s.innerText = "s"
            }
            // if the list has a title
            if (dbListData.listTitle) {
            	document.getElementById('listtitle').innerText = dbListData.listTitle
            }

		})
	}
	else {
		form.classList.remove('hide')
		loggedin.classList.add('hide')
		logoutBtn.classList.add('hide')
	}
})

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
