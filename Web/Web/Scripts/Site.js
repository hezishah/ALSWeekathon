var server = {
    prefixUrl: 'http://alsvm.cloudapp.net:8080/',
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
                name = "/register";
            } else {
                // render control panel
                name = "/home";
            }

            $.History.go(name);
            return;
        }

        alerts.clear();
        view.setLoading();

        name = name.slice(1);
        var params = {};
        if (name.indexOf('?') != -1) {
            var paramsString = name.substring(name.indexOf('?'), name.length);
            paramsString = paramsString.slice(1);
            var splittedKV = paramsString.split('&');
            for (var i = 0; i < splittedKV.length; i++) {
                var item = splittedKV[i];
                var kv = item.split('=');
                params[kv[0]] = kv[1];
            }

            name = name.substring(0, name.indexOf('?'));
        }

        var file = 'templates/' + name + '.tmpl.html';
        $.when($.get(file))
            .done(function (tmplData) {
                if (view.dataHandlers.hasOwnProperty(name)) {
                    var dataUrl = getFinalDataUrl(view.dataHandlers[name], params);
                    $.get(server.prefixUrl + dataUrl, function (result) {
                        $.templates({ tmpl: tmplData });
                        contentEle.html($.render.tmpl(result));
                    });
                } else {
                    $.templates({ tmpl: tmplData });
                    contentEle.html($.render.tmpl());
                }
            });
    },

    home: function () {
        $.History.go('/');
    },

    registerDataHandler: function (name, url) {
        view.dataHandlers[name] = url;
    },

    removeDataHandler: function (name) {
        delete view.dataHandlers[name];
    },

    clearViewHandlers: function () {
        view.dataHandlers = {};
    },

    setLoading: function () {
        var contentEle = $('#content-container');
        contentEle.empty();
        var loading = $('<div id="loading"></div>');
        contentEle.append(loading);
    }
};

function getFinalDataUrl(templ, params) {
    while (templ.indexOf('{') != -1) {
        var start = templ.indexOf('{');
        var end = templ.indexOf('}');
        var token = templ.substring(start + 1, end);

        if (token == "userid") {
            templ = templ.replace('{userid}', server.user.profile['_id']);
        } else {
            var val = params[token];
            templ = templ.replace('{' + token + '}', val);
        }
    }

    return templ;
}

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
    var profile;
    var cookieData = $.cookie("user");
    if (cookieData) {
        profile = JSON.parse(cookieData);
    }
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
    view.registerDataHandler('home', 'signals/batches/{userid}');
    view.registerDataHandler('signals', 'signals/{userid}');
}

function unregisterUserViewHandlers() {
    view.clearViewHandlers();
}

function loadAnalysisGraph() {
    $("#graph-btn").attr('disabled', '1');
    var url = $("#batchSelect").val();
    var newElemId = 'graph' + $('#batchSelect')[0].selectedIndex;
    if ($('#' + newElemId).length > 0) {
        $('#' + newElemId).empty();
        $('#' + newElemId).addClass('loading');
    } else {
        var graph = $('<div></div>').attr('id', newElemId).addClass('graph');
        graph.addClass('loading');
        $('#signals').append(graph);
    }
    
    var chart = c3.generate({
        bindto: '#' + newElemId,
        data: {
            xs: {
                'Left': 'x1',
                'Right': 'x2',
            },
            columns: [
                ['x1'],
                ['x2'],
                ['Left'],
                ['Right']
            ]
        }
    });

    $.get(url, function (data) {
        var x1 = ['x1'], x2 = ['x2'], left = ['Left'], right = ['Right'];

        for (var i = 10; i < data.left.length; i++) {
            x1.push(data.left[i].timeStamp);
            left.push(data.left[i].stepDuration);
        }

        for (var i = 10; i < data.right.length; i++) {
            x2.push(data.right[i].timeStamp);
            right.push(data.right[i].stepDuration);
        }

        var newData = {
            xs: {
                'Left': 'x1',
                'Right': 'x2',
            },
            columns: [
                x1,
                x2,
                left,
                right
            ]
        };
        $('#' + newElemId).removeClass('loading');
        chart.load(newData);
        $("#graph-btn").removeAttr('disabled');
    });
}