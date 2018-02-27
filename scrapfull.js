var needle = require('needle');
var fs = require('fs');
var URL = 'http://www.secfocus.ru/articles/';

needle.get(URL, function(err, res){
    if (err) throw err;
    fs.writeFileSync('fullData.html', res.body);
});