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
    })

    // Event for clicking the eye
    eye.addEventListener('click', function (e) {
        e.preventDefault();
        body.classList.toggle('show-password');
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        eye.className = 'eye fa ' + (passwordInput.type === 'password' ? 'fa-eye-slash' : 'fa-eye');
        passwordInput.focus();
    })
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
