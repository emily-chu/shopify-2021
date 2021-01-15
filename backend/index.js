const app = require('express')();

app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend-from-heroku/public')))

console.log('hello');