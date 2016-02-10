var cssreduce = {
    checkFile: function(url, callback) {
        var that = this;
        this.getFileContents(url, function(contents) {
            that.processStylesheet(contents, callback);
        });
    },

    getFileContents: function(url, callback) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'text',
            success: function(contents) {
                callback(contents);
            },
        });
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
            try {
                hash[sel] = hash[sel] || !!document.querySelectorAll(selnorm).length;
            } catch (ex) {
                console.error(ex);
                hash[sel] = false;
            }
        }

        callback(this.getReport(hash));
    },

    getSelectors: function(contents) {
        contents = contents.replace('\n', '');
        contents = contents.replace('\r', '');
        contents = contents.replace('\0', '');

        var selectors = [];

        var selectorIterator = {
            [Symbol.iterator]: function*() {
                var curIndex = 0;
                var openBracketIndex;
                var closeBracketIndex;
                var level = 0;

                while (true) {
                    openBracketIndex = contents.indexOf('{', curIndex);
                    closeBracketIndex = contents.indexOf('}', curIndex);

                    // No more CSS blocks left.
                    if (openBracketIndex <= 0) {
                        break;
                    }

                    if (openBracketIndex < closeBracketIndex) {
                        if (level === 0) {
                            yield contents.substring(curIndex, openBracketIndex).trim();
                        }

                        level++;
                        curIndex = openBracketIndex + 1;
                    } else {
                        level--;
                        curIndex = closeBracketIndex + 1;
                    }
                }
            }
        };

        for (var selector of selectorIterator) {
            selectors.push(selector);
        }

        return selectors;
    },

    normalizeSelector: function(sel) {
        return sel;
    },

    getReport: function(hash) {
        hash = hash || {};

        var selectors = Object.keys(hash);
        var report = {
            totalSelectors: selectors.length,
            unused: []
        };

        for (var i = 0, len = selectors.length; i < len; i++) {
            if (!hash[selectors[i]]) {
                report.unused.push(selectors[i]);
            }
        }

        report.itsok = !report.unused.length;

        return report;
    }
};
