var cssreduce = {
    getHash: function(url) {
        this.hashes || (this.hashes = {});
        this.hashes[url] || (this.hashes[url] = {});
        return this.hashes[url];
    },

    checkFile: function(url, callback) {
        var that = this;
        this.getFileContents(url, function(contents) {
            that.processStylesheet(url, contents, callback);
        });
    },

    getFileContents: function(url, callback) {
        jQuery.ajax({
            url: url,
            type: 'GET',
            dataType: 'text',
            success: function(contents) {
                callback(contents);
            },
        });
    },

    processStylesheet: function(url, contents, callback) {
        var selectors = this.getSelectors(contents);
        var hash = this.getHash(url);
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
        contents = contents.replace(/[\n\r\0]/g, '');

        var selectors = [];

        var selectorIterator = {
            [Symbol.iterator]: function*() {
                var curIndex = 0;
                var openBracketIndex;
                var closeBracketIndex;
                var level = 0;
                var selector;
                var isMediaQuery;

                while (true) {
                    openBracketIndex = contents.indexOf('{', curIndex);
                    closeBracketIndex = contents.indexOf('}', curIndex);

                    // No more CSS blocks left.
                    if (openBracketIndex <= 0) {
                        break;
                    }

                    if (openBracketIndex < closeBracketIndex) {
                        selector = contents.substring(curIndex, openBracketIndex).trim();

                        if (level === 0) {
                            if (selector.startsWith('@media')) {
                                isMediaQuery = true;
                            } else if (selector.startsWith('@-webkit-keyframes')) {
                                isMediaQuery = false;
                            } else if (selector.startsWith('@-moz-keyframes')) {
                                isMediaQuery = false;
                            } else if (selector.startsWith('@-o-keyframes')) {
                                isMediaQuery = false;
                            } else if (selector.startsWith('@keyframes')) {
                                isMediaQuery = false;
                            } else if (selector.startsWith('@font-face')) {
                                isMediaQuery = false;
                            } else {
                                isMediaQuery = false;
                                yield selector;
                            }
                        } else {
                            // Selector nested inside the @media query.
                            if (isMediaQuery) {
                                yield selector;
                            }
                        }

                        level++;
                        curIndex = openBracketIndex + 1;
                    } else {
                        level--;
                        curIndex = closeBracketIndex + 1;
                        isMediaQuery = false;
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
        return sel
            .replace(/::\-moz\-focus\-inner/g, '')
            .replace(/:\-o\-prefocus/g, '')
            .replace(/::\-ms\-expand/g, '')
            .replace(/^,/, '')
            .replace(/,$/, '');
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
