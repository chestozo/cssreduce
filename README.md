## cssreduce
This tool can help you to find unsed css selectors in your css files.
For now it can be used like this:

```js
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report));
```

### Persistent mode
If your website is not a singlepage one - you can use the persistent mode to collect information from different pages:
```js
cssreduce.setPersistentMode();
cssreduce.dropState(); // call this method before you start walking around your website pages
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report)); // first page call
cssreduce.checkFile('/my/local/style.css', (report) => console.log(report)); // second page call
```
