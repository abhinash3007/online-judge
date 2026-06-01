const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const codeRoutes = require('./routes/codeRoutes');

app.use('/code', codeRoutes);

app.listen(8080, () => {
    console.log("Execution service running on port 8080");
});
