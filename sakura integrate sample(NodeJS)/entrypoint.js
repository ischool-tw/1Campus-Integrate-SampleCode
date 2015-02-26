//本頁是進入系統的第一個頁面，由本頁面進入OAuth的認證及授權的流程。
var config = require('./config.json');
exports.entryPoint = function(req, res){
    //取得由1Campus進入本頁時所帶的application參數，application代表與本App進行整合的"學校"主機，我們需要在OAuth取得授權時要求對此學校主機的授權。
    var application = require('url').parse(req.url, true).query["application"];
    //取得由1Campus進入本頁時所帶的groupid參數，groupid代表目前使用者所使用的群組編號
    var group_id = require('url').parse(req.url, true).query["groupid"];
    //註冊的ClientID 資料
    var client_id = config.ClientId;
    //註冊的RedirectURI 資料
    var redirect_uri = config.RedirectURI;
    //要求授權的內容，以,分隔
    var scope =
    "User.Mail"//使用者的email資訊
    + ",User.BasicInfo"//使用者的基本資料
    + "," + application + ":sakura";//使用者在學校的群組相關資料 ex:demo.ischool.j:sakura

    //進行http redirect進入OAuth流程
    res.writeHead(
        302
        , {
            'Location' : "https://auth.ischool.com.tw/oauth/authorize.php"
            + "?response_type=code"
            + "&client_id=" + client_id
            + "&redirect_uri=" + encodeURIComponent(redirect_uri)
            + "&scope=" + scope
            + "&state=" + application + '@' + group_id
        }
    );
    res.end();
};