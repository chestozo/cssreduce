var cssreduce = {
    checkFile: function(url, callback) {
        var that = this;
        this.getFileContents(url, function(contents) {
            that.processStylesheet(contents, callback);
        });
    },

    getFileContents: function(url, callback) {
        var testStylesheetContents =
            'html { font-family: "Arial"; } \n' +
            '.menu a { color: red; font-size: 12px; } \n' +
            '.menu .menu-item:first-letter { font-weight: bold; }';

        setTimeout(function() {
            callback(testStylesheetContents);
        }, 100);
    },

    processStylesheet: function(contents, callback) {
        var selectors = this.getSelectors(contents);
        var hash = {};
        var sel;
        var selnorm;
        var nodes;

        for (var i = 0, len = selectors.length; i < len; i++) {
            sel = selectors[i];
            selnorm = this.normalizeSelector(sel);
            hash[sel] = hash[sel] || !!document.querySelectorAll(selnorm).length;
        }

        callback(this.getReport(hash));
    },

    getSelectors: function(contents) {
        return [];
    },

    normalizeSelector: function(sel) {
        return sel;
    },

    getReport: function(hash) {
        hash = hash || {};

        var selectors = Object.keys(hash);
        var report = {
            unused: []
        };

        for (var i = 0, len = selectors.length; i < len; i++) {
            if (!hash[selectors[i]]) {
                report.unused.push(selectors[i]);
            }
        }

        return report;
    }
};
