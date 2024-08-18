// app.js

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();




// User Sign Up
document.getElementById('signup-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Store user information in Firestore
            db.collection('users').doc(user.uid).set({
                email: email,
                barrels: 12, // Initial barrel allocation
                role: 'user' // Assign user role
            }).then(() => {
                alert('User registered successfully!');
            }).catch((error) => {
                console.error('Error writing document: ', error);
            });
        })
        .catch((error) => {
            console.error('Error signing up: ', error);
            alert(error.message);
        });
});


// app.js

// User Login
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Retrieve user information from Firestore
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    console.log('User data:', userData);

                    // Redirect to appropriate dashboard based on role
                    if (userData.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                } else {
                    console.log('No such document!');
                }
            }).catch((error) => {
                console.log('Error getting document:', error);
            });
        })
        .catch((error) => {
            console.error('Error logging in: ', error);
            alert(error.message);
        });
});








// admin-dashboard.js

// Display Users (Admin Only)
function displayUsers() {
    const usersList = document.getElementById('users-list');

    db.collection('users').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const userItem = document.createElement('div');
            userItem.innerHTML = `
                <p>Email: ${user.email}</p>
                <p>Barrels: ${user.barrels}</p>
                <button onclick="approveCylinder('${doc.id}')">Approve Extra Cylinder</button>
                <button onclick="denyCylinder('${doc.id}')">Deny Extra Cylinder</button>
            `;
            usersList.appendChild(userItem);
        });
    }).catch((error) => {
        console.error('Error retrieving users: ', error);
    });
}

function approveCylinder(userId) {
    db.collection('users').doc(userId).update({
        barrels: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        alert('Cylinder request approved');
    }).catch((error) => {
        console.error('Error approving cylinder:', error);
    });
}

function denyCylinder(userId) {
    alert('Cylinder request denied');
}

// Initialize display of users when admin dashboard loads
document.addEventListener('DOMContentLoaded', displayUsers);





// app.js

// Book a Cylinder
document.getElementById('book-cylinder').addEventListener('click', () => {
    const user = firebase.auth().currentUser;

    db.collection('users').doc(user.uid).get().then((doc) => {
        if (doc.exists && doc.data().barrels > 0) {
            // Proceed with booking
            db.collection('bookings').add({
                userId: user.uid,
                date: new Date(),
                status: 'Booked',
                paymentMethod: 'Paytm', // Example payment method
                cylinders: 1 // Number of cylinders booked
            }).then(() => {
                // Update user's remaining barrels
                db.collection('users').doc(user.uid).update({
                    barrels: firebase.firestore.FieldValue.increment(-1)
                });

                alert('Cylinder booked successfully!');
            }).catch((error) => {
                console.error('Error booking cylinder: ', error);
            });
        } else {
            alert('No barrels left or user not found.');
        }
    }).catch((error) => {
        console.error('Error retrieving user data: ', error);
    });
});




// user-dashboard.js

// Display Booking History
function displayBookingHistory() {
    const user = firebase.auth().currentUser;
    const bookingsList = document.getElementById('bookings-list');
    
    db.collection('bookings').where('userId', '==', user.uid).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const booking = doc.data();
            const bookingItem = document.createElement('div');
            bookingItem.innerHTML = `
                <p>Date: ${booking.date.toDate()}</p>
                <p>Status: ${booking.status}</p>
                <p>Payment: ${booking.paymentMethod}</p>
            `;
            bookingsList.appendChild(bookingItem);
        });
    }).catch((error) => {
        console.error('Error retrieving booking history: ', error);
    });
}

// Initialize display of booking history when user dashboard loads
document.addEventListener('DOMContentLoaded', displayBookingHistory);




// app.js

// Example Logging
function logAction(action) {
    console.log(`[LOG]: ${action} performed at ${new Date().toLocaleString()}`);
}

// Usage
logAction('User Login');
