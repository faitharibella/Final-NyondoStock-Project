const express = require('express');
const app = express();

app.get('/',(req,res)=>{
    res.send('Finished setting up my server i hope sookya wabula')
})

//this is always the last line in the code
app.listen(3000,()=> console.log('listening on port 3000'))