function PARSE_JWT_BRIGHTFOXNETWORK (token) {
    if (!token || !token.split) return {};
    var base64Url = token.split('.')[1];
    if (!base64Url.replace) return {};
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function BrightfoxNetwork (url) {
    this.url = url;
    this._JWT;
}

BrightfoxNetwork.prototype.setJWT = function setJWT (token) {
    this._JWT = token;
    this.useruuid = PARSE_JWT_BRIGHTFOXNETWORK(token).uuid;
};

BrightfoxNetwork.prototype.getPluginList = function getPluginList (cb) {
    fetch(this.url + '/plugins/list').then(function (res) { return res.json() }).then(function (data) {
        cb(null, data.plugins);
    });
};

BrightfoxNetwork.prototype.getVersions = function getVersions (uuid, unverified, cb) {
    fetch(this.url + '/versions/list/' + uuid + '/' + (unverified ? 'all' : '')).then(function (res) { return res.json() }).then(function (data) {
        cb(null, data.versions);
    });
};

BrightfoxNetwork.prototype.myPlugins = function myPlugins (cb) {
    fetch(this.url + '/plugins/my-plugins', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this._JWT,
        }
    }).then(function (res) { return res.json() }).then(function (data) {
        cb(null, data.plugins);
    });
};

/**
 * Get the the source for a certain version
 * @param uuid String The uuid of the plugin
 * @param version ??? The version of the plugin
 * @param cb function The callback which gets (err, data) where data is a string
 */ 
BrightfoxNetwork.prototype.getVersionSource = function getVersionSource (uuid, version, cb) {
    fetch(this.url + '/sources/' + uuid + "v" + version + '.js').then(res => res.text()).then((data) => {
        cb(null, data);
    });
};

BrightfoxNetwork.prototype.newPlugin = function newPlugin (dataToSend, cb) {
    dataToSend.bearer = this._JWT;
    fetch(this.url + '/plugins/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {        
        if (data && data.errors) {
            return cb(data.errors.map(el => el.msg).join(", "));
        }

        cb(null, data);
    })
    .catch((error) => {
        console.log("Newplugin error", error);
        cb(error);
    });
};

BrightfoxNetwork.prototype.newVersion = function newVersion (uuid, dataToSend, cb) {
    dataToSend.bearer = this._JWT;
    fetch(this.url + '/versions/new/' + uuid, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.errors) {
            return cb(data.errors.map(e => e.msg ).join(", "));
        }

        cb(null, data.newversion);
    })
    .catch((error) => {
        cb(error)
    });
};