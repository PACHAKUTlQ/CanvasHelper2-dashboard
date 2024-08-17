var loginEndpoint = getServerURL() + '/login';

function onDomReady(callback) {
    if (document.readyState === 'complete') {
        // If the DOM is already ready, execute the callback function.
        callback();
    } else {
        // Otherwise, wait for the DOMContentLoaded event.
        document.addEventListener('DOMContentLoaded', callback);
    }
}

onDomReady(function () {
    // DOM-dependent code
    const body = document.body;
    const width = window.innerWidth;
    const halfHeight = window.innerHeight / 2;

    const eye = document.querySelector('.eye');
    const passwordInput = document.getElementById('password');

    // Mouse move event
    body.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        let rad = Math.atan2(width - mouseX, mouseY - halfHeight);
        let deg = 30 * rad - 45;
        // Custom CSS property: --beam-deg (angle of beam)
        body.style.setProperty('--beam-deg', deg + 'deg');
    });

    // Event for clicking the eye
    eye.addEventListener('click', function (e) {
        e.preventDefault();
        body.classList.toggle('show-password');
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        eye.className = 'eye fa ' + (passwordInput.type === 'password' ? 'fa-eye-slash' : 'fa-eye');
        passwordInput.focus();
    });

    // Tab switching logic
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Form').classList.add('active');
        });
    });

    // Prevent default form submission for login form
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        submit();
    });

    // Sign up form submission
    $('#signupForm').on('submit', function (event) {
        event.preventDefault();
        var jsonData = JSON.stringify({
            username: $('#signup-username').val(),
            password: $('#signup-password').val(),
            url: $('#signup-url').val(),
            bid: $('#signup-bid').val()
        });

        $.ajax({
            url: getServerURL() + '/signup',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            headers: getAccessTokenHeaders(),
            data: jsonData,
            success: function (data) {
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
                console.log('Successfully signed up:', data.message);
                setTimeout(`location.href = './login'`, 1000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Sign up failed:', textStatus, errorThrown);
            }
        });
    });
});

function submit() {
    var jsonData = JSON.stringify({ username: $('#username').val(), password: $('#password').val(), url: "/", bid: "/" });
    $.ajax({
        url: loginEndpoint,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: getAccessTokenHeaders(),
        data: jsonData,
        success: function (data) {
            // Save tokens to local storage
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            console.log('Login successful:', data.message);
            location.reload();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert('Login failed:', textStatus, errorThrown);
        }
    });
}

function checkPasswordMatch() {
    var password = document.getElementById("signup-password").value;
    var confirmPassword = document.getElementById("signup-password2").value;
    if (password != confirmPassword) {
        document.getElementById("signup-password2").setCustomValidity("Passwords don't match");
        showWarningBanner();
        document.getElementById("signup-password2").value = "";
        document.getElementById("signup-password2").focus();
    } else {
        document.getElementById("signup-password2").setCustomValidity('');
    }
}

function showWarningBanner() {
    $('#warning-banner').text('Passwords do not match!').css('background-color', 'red');
    $('#warning-banner').show();
    setTimeout(function () {
        $('#warning-banner').hide();
    }, 3000);
}
