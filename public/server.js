const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public')); // serve your public folder

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
