//本頁是完成OAuth授權後進入實際資料整合的頁面
var config = require('./config.json');
exports.oAuthCallBack = function(req, res){
    //註冊的ClientID 資料
    var client_id = config.ClientId;
    //註冊的ClientID 資料
    var client_secret = config.ClientSecret;
    //註冊的RedirectURI 資料
    var redirect_uri = config.RedirectURI;
    //由傳入的state參數取得application
    //由傳入的state參數取得groupid
    var req_state = require('url').parse(req.url, true).query["state"];
    var application = req_state.split('@')[0];
    var groupid = req_state.split('@')[1];
    //取得code
    var code = require('url').parse(req.url, true).query["code"];
    //透過Server to Server呼叫由code換取AccessToken
    var accessToken = "";

    var https = require('https');
    var http = require('http');
    //取得AccessToken
    https.get(
        "https://auth.ischool.com.tw/oauth/token.php"
            + "?client_id=" + client_id
            + "&client_secret=" + client_secret
            + "&code=" + code
            + "&grant_type=authorization_code"
            + "&redirect_uri=" + encodeURIComponent(redirect_uri)
        , function(resAccessToken){
            resAccessToken.on('data', function(data) {
                //取得傳回的accessToken
                accessToken=JSON.parse(data).access_token;

                var getUserInfo, getGroup, getGroupMember;
                //取得userInfo
                https.get(
                    "https://auth.ischool.com.tw/services/me.php?access_token=" + accessToken
                    , function(resUserInfo){
                        resUserInfo.on('data', function(data) {
                            getUserInfo = data;
                            finish();
                        });
                    }
                );
                //取得Group
                https.get(
                    "https://dsns.1campus.net/" + application + "/sakura/GetMyGroup"
                        + "?stt=PassportAccessToken"
                        + "&AccessToken=" + accessToken
                    , function(rspRedirect){
                        //http redirect，https://dsns.1campus.net 會redirect到真正的位置
                        //抓dsns.1campus.net的redirect header再呼叫
                        if (rspRedirect.statusCode > 300 && rspRedirect.statusCode < 400 && rspRedirect.headers.location){
                            var protocolObj = (rspRedirect.headers.location.substring(0, 8) == 'https://') ? https : http;
                            protocolObj.get(
                                rspRedirect.headers.location
                                , function(resGroup){
                                    resGroup.on('data', function(data) {
                                        getGroup = data;
                                        finish();
                                    });
                                }
                            );
                        }
                    }
                );
                //取得GroupMember
                https.get(
                    "https://dsns.1campus.net/" + application + "/sakura/GroupMember"
                        + "?stt=PassportAccessToken"
                        + "&AccessToken=" + accessToken
                    , function(rspRedirect){
                        //http redirect，https://dsns.1campus.net 會redirect到真正的位置
                        //抓dsns.1campus.net的redirect header再呼叫
                        if (rspRedirect.statusCode > 300 && rspRedirect.statusCode < 400 && rspRedirect.headers.location){
                            var protocolObj = (rspRedirect.headers.location.substring(0, 8) == 'https://') ? https : http;
                            protocolObj.get(
                                rspRedirect.headers.location
                                , function(resGroupMember){
                                    resGroupMember.on('data', function(data) {
                                        getGroupMember = data;
                                        finish();
                                    });
                                }
                            );
                        }
                    }
                );
                //產生response，判斷三個response都有資料後產生
                var finish = function(){
                    if(getUserInfo && getGroup && getGroupMember){
                        res.writeHead( 200, { 'Content-Type': 'text/html' });
                        var html =
'<!DOCTYPE html>'
+ '<html xmlns="http://www.w3.org/1999/xhtml">'
+ '<head runat="server">'
+ '    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'
+ '    <title></title>'
+ '    <style type="text/css">'
+ '        #TextArea1 {'
+ '            height: 238px;'
+ '            width: 905px;'
+ '        }'

+ '        #TextArea2 {'
+ '            height: 238px;'
+ '            width: 905px;'
+ '        }'

+ '        #TextArea3 {'
+ '            height: 238px;'
+ '            width: 905px;'
+ '        }'
+ '    </style>'
+ '</head>'
+ '<body>'
+ '        <div>'
+ '            UserInfo:<br />'
+ '            <textarea id="TextArea1" name="S1" >'+getUserInfo+'</textarea><br />'
+ '            Group:<br />'
+ '            <textarea id="TextArea2" name="S2" >'+getGroup+'</textarea><br />'
+ '            GroupMember:<br />'
+ '            <textarea id="TextArea3" name="S3" >'+getGroupMember+'</textarea>'
+ '        </div>'
+ '</body>'
+ '</html>';
                        res.end(html);
                    }
                };
            });
        }
    );
};