var server = {};

server.User = {
    url: 'http://localhost:8080/',
    isConnected: false,
    profile: {},
    connect: function (username, password) {

        $('#menu-logout').show();
    },

    disconnect: function () {
        this.isConnected = false;
        this.profile = {};
        setDisconnected();
    },

    login: function (data) {
        $.post(this.url + 'validate', data, null)
           .done(function (res) {
               server.User.isConnected = true;
               server.User.profile = res;
               setConnected();
           })
           .fail(function (xhr) {
               var response = xhr.responseJSON;
               alertUser(response.error);
           });
    },

    register: function (data) {
        $.post(this.url + 'user', data, function (res) {
            server.User.isConnected = true;
            server.User.profile = res;
            setConnected(data.firstName);
        })
            .fail(function (xhr) {
                var response = xhr.responseJSON;
                alertUser(response.error);
            });
    }
}

var view = {
    change: function (name) {
        var contentEle = $('#content-container');
        // handle default page
        if (!name || name == "/") {
            if (!server.User.isConnected) {
                name = "register";
            } else {
                // render control panel
                name = "home";
            }
        }

        $('#alerts-container').empty();

        var file = 'templates/' + name + '.tmpl.html';
        $.when($.get(file))
            .done(function (tmplData) {
                $.templates({ tmpl: tmplData });
                contentEle.html($.render.tmpl());
            });
    },

    home: function () {
        $.History.trigger('/');
    }
};

$.History.bind(function (state) {
    view.change(state);
});

// document ready
$(function () {
    init();
});

function alertUser(msg) {
    var newAlert = $('<div></div>').addClass('alert').text(msg);
    var dismiss = $('<span></span>').addClass('alert-dismiss').addClass('blue-link').text('dismiss');
    dismiss.on('click', function () {
        $(this).parent().remove();
    });
    newAlert.append(dismiss);
    
    $('#alerts-container').append(newAlert);
}

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function register() {
    var formData = $("#register-form").serializeObject();

    server.User.register(formData);

    return false;
}

function login() {
    var formData = $("#login-form").serializeObject();

    server.User.login(formData);

    return false;
}

function init() {
    var profile = $.cookie("user");
    if (profile) {
        server.User.isConnected = true;
        server.User.profile = profile;
        setConnected();
    } else {
        setDisconnected();
    }
}

function setConnected() {
    $.cookie("user", server.User.profile);
    $('#layout-user-box').text('Logged in as ' + server.User.profile.firstName);
    var logout = $('<a href="#/" id="user-box-link" onclick="server.User.disconnect()">Logout</a>');
    $('#layout-user-box').append(logout);
    view.home();
}

function setDisconnected() {
    $('#layout-user-box').empty();

    $.removeCookie("user");

    view.home();
}