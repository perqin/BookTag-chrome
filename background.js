var optDefaults = {
    newIns: true
};
var legacyBookmarkIds = {
    bookmarksRoot: 0,
    bookmarksBar: 1,
    otherBookmarks: 2,
    mobileBookmarks: 3
};

function localGetWithPrefix() {
    var args = Array.from(arguments);
    var callback = args.pop();
    var keys = args.pop();
    var prefix = args.join('.');
    var prefixedKeys;
    var keysType = Object.prototype.toString.call(keys);
    if (keysType === '[object String]') {
        prefixedKeys = prefix + '.' + keys;
    } else if (keysType === '[object Array]') {
        prefixedKeys = keys.map(function (currentValue) {
            return prefix + '.' + currentValue;
        });
    } else {
        prefixedKeys = {};
        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                prefixedKeys[prefix + '.' + key] = keys[key];
            }
        }
    }
    chrome.storage.local.get(prefixedKeys, function (items) {
        callback(chrome.runtime.lastError, items);
    });
}

function localSetWithPrefix() {
    var args = Array.from(arguments);
    var callback = args.pop();
    var items = args.pop();
    var prefix = args.join('.');
    var prefixedItems = {};
    for (var key in items) {
        if (items.hasOwnProperty(key)) {
            prefixedItems[prefix + '.' + key] = items[key];
        }
    }
    chrome.storage.local.set(prefixedItems, function () {
        callback(chrome.runtime.lastError);
    });
}

function buildIndex(callback) {
    chrome.bookmarks.getTree(function (bookmarksArray) {
        if (bookmarksArray.length === 0) {
            throw new Error('No top bookmark root found!');
        }
        var bookmarksRoot = bookmarksArray[0];
        var bookmarks = _DumpNode(bookmarksRoot);
        var bkm = {};
        bookmarks.forEach(function (bookmark) {
            bkm[bookmark.id.toString()] = {
                tags: []
            };
        });
        localSetWithPrefix('bkm', bkm, callback);
    });
}

function _DumpNode(node) {
    var list = [];
    if (node.url) {
        list.push(node);
    }
    if (node.children) {
        node.children.forEach(function (child) {
            list = list.concat(_DumpNode(child));
        });
    }
    return list;
}

function _OnInit() {
    localGetWithPrefix('opt', { newIns: optDefaults.newIns }, function (err, items) {
        if (err) throw err;
        if (items['opt.newIns']) {
            buildIndex(function (err) {
                if (err) throw err;
                localSetWithPrefix('opt', { newIns: false }, function (err) {
                    if (err) throw err;
                    chrome.storage.local.get(null, console.log);
                });
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(_OnInit);

function isUrlBookmarked(url) {
    // TODO
}
