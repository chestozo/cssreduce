## cssreduce
This tool can help you to find unsed css selectors in your css files.

The idea is simple:
- download stylesheet file
- extract css selectors from the stylesheet
- for each selector - check if there is something on the page that matches that selector
- if not - collect all such selectors in `report.unused` array for a later on analysis

For now it can be used like this:

```js
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report));
```

### Persistent mode
If your website is not a singlepage one - you can use the persistent mode to collect information from different pages:
```js
// First time call
cssreduce.setPersistentMode();
cssreduce.dropState(); // call this method before you start walking around your website pages
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report)); // first page call

// Second time call
cssreduce.setPersistentMode();
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report)); // second page call
```

### Report object format
For now it is a simple object that has only one usefull property that is `report.unused` (an array of selectors that were not found on the page).
