var log = require('cllc')();
var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');

var URL = 'http://www.secfocus.ru/articles/187?PAGEN_2=2&PAGEN_9=3&SHOWALL_8=1&SHOWALL_3=1&PAGEN_4=2&SHOWALL_1=1#axzz4Fuo2iHV2';
var mainURL = 'http://www.secfocus.ru';

var results = [];
var img = [];

log('Начало работы');
log.start('Найдено новостей %s');

var q = tress(crawl);

q.success = function(){
    q.concurrency = 1;
}

q.retry = function(){
    q.concurrency = -10;
}
    
function crawl(url, callback){

    needle.get(url, function(err, res){ 

        if (err || res.statusCode !== 200) {
            q.concurrency === 1 && log.e((err || res.statusCode) + ' - ' + url);
            return callback(true);
            log.e((err || res.statusCode) + ' - ' + url);
            log.finish();
            process.exit();
        }

    var $ = cheerio.load(res.body);
        
            results.push({
                title: $('h1').text(),
                href: url,
                date: $('.news-detail>span').text(),
                content: $('.news-detail p').text(),
                size: $('.news-detail p').text().length
                
            });
        log.step();
            
// делаем q.push для ссылок на обработку
        //список новостей
        $('.news-list p.news-item > a').each(function() {
            q.push(mainURL+($(this).attr('href')));
            
        });
        
        $('.news-detail>img').each(function() {
            img.push({
                img: resolve(mainURL, $(this).attr('src')), 
                date: $('.news-detail>span').text(),
                href: url
            });
        })
        
        callback(); //вызываем callback в конце
    });
};

// эта функция выполнится, когда в очереди закончатся ссылки
q.drain = function(){
    log('Начало записи данных');
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
   fs.writeFileSync('./img.json', JSON.stringify(img, null, 4));
   log.finish();
    log('Работа закончена');
}
// добавляем в очередь ссылку на первую страницу списка
q.push(URL);