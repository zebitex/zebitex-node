# zebitex-node
Node.js client for Zebitex exchange API

[API documentation](https://doc.zebitex.com/)

## Testing

1. Generate api keys: https://staging.zebitex.com/profile/api-tokens.
2. Install and use https://github.com/sloria/local-repl.
2.1. Modify `package.json`.
```
--- a/package.json
+++ b/package.json
@@ -4,7 +4,8 @@
   "description": "",
   "main": "index.js",
   "scripts": {
-    "test": "echo \"Error: no test specified\" && exit 1"
+    "test": "echo \"Error: no test specified\" && exit 1",
+    "repl": "local-repl"
   },
   "keywords": [],
   "author": "",
@@ -13,5 +14,8 @@
     "lodash": "^4.17.11",
     "request": "^2.88.0",
     "request-promise": "^4.2.2"
+  },
+  "devDependencies": {
+    "local-repl": "^4.0.0"
   }
 }
```

2.2. Create config file for `local-repl`.
`.replrc.js`:
```
module.exports = {
  context: [
    'lodash',
    'request',
    'request-promise',
    {name: 'ApiClient', module: './'}
  ],
  prompt: (context, pkg) => {
    return `${pkg.name} ${pkg.version} $ `
  },
}
```

3. Usage examples.

```client = new ApiClient('<Access key>', '<Secret key>', true)```

```client.newOrder('ltc', 'btc', 'ask', '0.321', '0.123', 'ltcbtc', 'limit').then(console.log)```

```client.cancelOrder(85).then(console.log)```
