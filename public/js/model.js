const api_url = getServerURL();

function loadcheck() {
    $('.checkbox').each(function () {
        if ($(this).hasClass('positive')) {
            $(this).html('<svg class="ssvg" viewBox="0 0 32 32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 20 L12 28 30 4" /></svg>');
            $(this).next().addClass('delete');
        } else if ($(this).hasClass('negative')) {
            $(this).html('<svg class="ssvg" viewBox="0 0 32 32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>');
            $(this).next().addClass("wrong");
        } else if ($(this).hasClass('important')) {
            $(this).html('');
            $(this).next().addClass("imptext");
        }
    });
}

function updatecheck() {
    $('.checkbox').click(function () {
        let newtype = 0;
        if ($(this).hasClass('positive')) {
            newtype = 2;
            $(this).removeClass('positive');
            $(this).addClass('negative');
            $(this).html('<svg class="ssvg" viewBox="0 0 32 32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 30 L30 2 M30 30 L2 2" /></svg>');
            $(this).next().removeClass('delete');
            $(this).next().addClass("wrong");
        } else if ($(this).hasClass('negative')) {
            newtype = 3;
            $(this).removeClass('negative');
            $(this).addClass('important');
            $(this).html('');
            $(this).next().removeClass("wrong");
            $(this).next().addClass("imptext");
        } else if ($(this).hasClass('important')) {
            $(this).removeClass('important');
            $(this).html('');
            $(this).next().removeClass("imptext");
        } else {
            newtype = 1;
            $(this).addClass('positive');
            $(this).html('<svg class="ssvg" viewBox="0 0 32 32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10.9375%"><path d="M2 20 L12 28 30 4" /></svg>');
            $(this).next().addClass('delete');
        }
        // Sene request
        // Send check request
        let smsg = { "type": newtype };
        $.ajax(apilink(`/canvas/check/${this.id}`), {
            data: JSON.stringify(smsg),
            contentType: 'application/json',
            type: 'POST',
            headers: getAccessTokenHeaders(),
            error: function (data) {
                console.log(data)
            }
        });
    });
}

function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const jsonData = JSON.stringify({ username: "/", password: refreshToken, url: "/", bid: "/" });

    $.ajax(apilink(`/refresh`), {
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        headers: getAccessTokenHeaders(),
        data: jsonData,
        success: function (data) {
            console.log("Refreshed token at " + Date());
            localStorage.setItem('accessToken', data.new_access_token);
        },
        error: function (data) {
            console.log(data)
        }
    })
}

function loadppt() {
    $("ppt").click(function () {
        let defaultppt = "You can use copy the text!";
        if ($(this).is('[label]')) {
            defaultppt = $(this).attr("label");
        }
        window.prompt(defaultppt, $(this).text());
    });
}

function loadlink() {
    $("span.label").click(function () {
        window.open($(this).attr("url"));
    });
}

function loadupdate() {
    loadlink();
    loadppt();
    loadcheck();
    updatecheck();
}

function displaydata(data) {
    window.isupdating = 0;
    // One column
    $("#b1").html(data);
    loadupdate();
}

function getcache() {
    $.ajax(apilink('/canvas/dashboard?cache=true'), {
        type: 'GET',
        headers: getAccessTokenHeaders(),
        error: function (data) {
            $("#b1").text("Please check your Internet connection");
            window.isupdating = 0;
        }
    }).done(function (data) {
        data = data['data'];
        if (data.length > 5)
            displaydata(data);
    });
}

function sendreq() {
    // Precheck
    if (!window.udatap) return;
    $.ajax(apilink('/canvas/dashboard'), {
        type: 'GET',
        headers: getAccessTokenHeaders(),
        error: function (data) {
            $("#b1").text("Please check your Internet connection");
            window.isupdating = 0;
        }
    }).done(function (data) {
        data = data['data'];
        window.isonline = true;
        initScrollBar();
        $("#resizeicon").addClass("ftg");
        displaydata(data);
    });
}

function getIndex(str, s) {
    let flag = false;
    let pa = [];
    for (let i = 0; i < str.length - s.length + 1; i++) {
        if (str.substring(i, s.length + i) == s) {
            pa.push(i);
            flag = true;
        }
    }
    if (flag === false) {
        return [];
    }
    return pa;
}

function add_bg() {
    if (window.udatap['background_image']) {
        const bgv = window.udatap['background_image'];
        $('head').append('<style>body, .box::before{background: url(' + apilink('/file/' + bgv) + ') 0 / cover fixed;}</style>');
    }
}

function setVideobg() {
    if (window.udatap['video']) {
        $("body").append('<video class="bgvideo" playsinline autoplay muted loop><source src="' + apilink('/file/' + window.udatap['video']) + '" type="video/ogg"></video>');
    }
}

function apilink(apipath) {
    return api_url + apipath;
}

function setupConfig() {
    // Set background images/video according to config
    if (!window.udata) {
        // Verify
        $.ajax({
            url: apilink('/config/verify'),
            type: 'GET',
            headers: getAccessTokenHeaders(),
            success: function () {
                // Success callback
            },
            error: function () {
                $("#b1").html("Cannot contact with the server. Is the server running?");
                showerrer();
            }
        });

        $.ajax({
            url: apilink('/config'),
            type: 'GET',
            dataType: 'text',
            headers: getAccessTokenHeaders(),
            success: function (data) {
                window.udata = data;
                try {
                    window.udatap = JSON.parse(data);
                } catch (e) {
                    $("#b1").html("<b>user_data parse error</b>\n<p>" + e + "</p>");
                    showerrer();
                    return;
                }
                add_bg();
                showup();
                setVideobg();
                $("#b1").html("Updating...");
                getcache();
                window.isupdating = 1;
                sendreq();
            },
            error: function () {
                $("#b1").html("Cannot contact with the server. Is the server running?");
                $('.config').click();
                showerrer();
            }
        });
    }
    // One Right
    $("#c1").css("position", "absolute");
    $("#c1").addClass("rightbox");
}

function showerrer() {
    $(".box").css("visibility", "visible");
    clearDrag(document.getElementById("hd"));
    clearDrag(document.getElementById("c1"));
}

function showup() {
    $(".box").css("visibility", "visible");
    $("#hd").css("visibility", "visible");
    $("#rfsbox").css("visibility", "visible");
}

let initScrollBar = function () {
    if (document.querySelector('.foo').fakeScroll && (!document.querySelector('.fakeScroll__content'))) {
        document.querySelector('.foo').fakeScroll({
            track: "smooth"
        });
        console.log("Initialize Scrollbar Done!");
    } else {
        console.log("Cannot initialize scrollbar");
    }
}

$(document).ready(function () {
    // Init

    setupConfig();
    dragElement_no(document.getElementById("hd"));
    dragElement(document.getElementById("c1"));

    $("#rfsbox").click(function () {
        if (window.isupdating) {
            $("#b1").html("It's updating now...");
            return;
        }
        window.isupdating = 1;
        $("#b1").html("Updating...");
        sendreq();
    });

    setInterval(soft_refresh, 60 * 1000);       // Update list every minute
    setInterval(refreshToken, 30 * 60 * 1000);  // Refresh auth_token every 30 minutes
});

function soft_refresh() {
    // Soft refresh
    if (window.isupdating) {
        return;
    }
    window.isupdating = 1;
    sendreq();
}

function clearDrag(elmnt) {
    // Cleaer the drug event
    elmnt.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        if (pos3 > elmnt.offsetLeft + elmnt.offsetWidth - 50 || pos3 < elmnt.offsetLeft + 70) {
            return;
        }
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function dragElement_no(elmnt) {
    let mydiv = document.getElementById("c1");
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        if (mydiv.offsetWidth - pos1 < 100 || mydiv.offsetHeight - pos2 < 100) {
            closeDragElement();
            return;
        }
        // set the element's new position:
        mydiv.style.width = (mydiv.offsetWidth - pos1) + "px";
        mydiv.style.height = (mydiv.offsetHeight - pos2) + "px";
    }
}
