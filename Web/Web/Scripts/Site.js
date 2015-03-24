var server = {
    prefixUrl:'http://alsvm.cloudapp.net:8080/',
    user: {
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
            $.post(server.prefixUrl + 'validate', data, null)
                .done(function (res) {
                    server.user.isConnected = true;
                    server.user.profile = res;
                    setConnected();
                })
                .fail(function (xhr) {
                    var response = xhr.responseJSON;
                    alerts.add(response.error);
                });
        },

        register: function (data) {
            $.post(server.prefixUrl + 'user', data, function (res) {
                server.user.isConnected = true;
                server.user.profile = res;
                setConnected(data.firstName);
            })
                .fail(function (xhr) {
                    var response = xhr.responseJSON;
                    alerts.add(response.error);
                });
        }
    }
};

var view = {
    dataHandlers: {},
    change: function (name) {
        var contentEle = $('#content-container');
        // handle default page
        if (!name || name == "/") {
            if (!server.user.isConnected) {
                name = "register";
            } else {
                // render control panel
                name = "home";
            }
        }

        alerts.clear();

        var file = 'templates/' + name + '.tmpl.html';
        $.when($.get(file))
            .done(function (tmplData) {
                var data = {};
                if (view.dataHandlers.hasOwnProperty(name) != -1) {
                    $.get(server.prefixUrl + view.dataHandlers[name], function(result) {
                        data = result;
                    });
                }

                $.templates({ tmpl: tmplData });
                contentEle.html($.render.tmpl(data));
            });
    },

    home: function () {
        $.History.trigger('/');
    },

    registerDataHandler: function (name, url) {
        view.dataHandlers[name] = url;
    },

    removeDataHandler: function (name) {
        delete view.dataHandlers[name];
    },

    clearViewHandlers: function() {
        view.dataHandlers = {};
    }
};

$.History.bind(function (state) {
    view.change(state);
});

// document ready
$(function () {
    init();
});

var alerts = {
    add: function (msg) {
        var newAlert = $('<div></div>').addClass('alert').text(msg);
        var dismiss = $('<span></span>').addClass('alert-dismiss').addClass('blue-link').text('dismiss');
        dismiss.on('click', function () {
            $(this).parent().remove();
        });
        newAlert.append(dismiss);

        $('#alerts-container').append(newAlert);
    },

    clear: function () {
        $('#alerts-container').empty();
    }
};

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

    server.user.register(formData);

    return false;
}

function login() {
    var formData = $("#login-form").serializeObject();

    server.user.login(formData);

    return false;
}

function init() {
    var profile = JSON.parse($.cookie("user"));
    if (profile) {
        server.user.isConnected = true;
        server.user.profile = profile;
        setConnected();
    } else {
        setDisconnected();
    }
}

function setConnected() {
    $.cookie("user", JSON.stringify(server.user.profile));
    $('#layout-user-box').text('Logged in as ' + server.user.profile.firstName);
    var logout = $('<a href="#/" id="user-box-link" onclick="server.user.disconnect()">Logout</a>');
    $('#layout-user-box').append(logout);
    view.home();
    registerUserViewHandlers();
}

function setDisconnected() {
    $('#layout-user-box').empty();

    $.removeCookie("user");

    view.home();
}

function registerUserViewHandlers() {
    view.registerDataHandler('home', 'signals/' + server.user.profile['_id']);
}

function unregisterUserViewHandlers() {
    view.clearViewHandlers();
}