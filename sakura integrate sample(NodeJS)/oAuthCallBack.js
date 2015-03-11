//�����O����OAuth���v��i�J��ڸ�ƾ�X������
var config = require('./config.json');
exports.oAuthCallBack = function(req, res){
    //���U��ClientID ���
    var client_id = config.ClientId;
    //���U��ClientID ���
    var client_secret = config.ClientSecret;
    //���U��RedirectURI ���
    var redirect_uri = config.RedirectURI;
    //�ѶǤJ��state�Ѽƨ��oapplication
    //�ѶǤJ��state�Ѽƨ��ogroupid
    var req_state = require('url').parse(req.url, true).query["state"];
    var application = req_state.split('@')[0];
    var groupid = req_state.split('@')[1];
    //���ocode
    var code = require('url').parse(req.url, true).query["code"];
    //�z�LServer to Server�I�s��code����AccessToken
    var accessToken = "";

    var https = require('https');
    var http = require('http');
    //���oAccessToken
    https.get(
        "https://auth.ischool.com.tw/oauth/token.php"
            + "?client_id=" + client_id
            + "&client_secret=" + client_secret
            + "&code=" + code
            + "&grant_type=authorization_code"
            + "&redirect_uri=" + encodeURIComponent(redirect_uri)
        , function(resAccessToken){
            resAccessToken.on('data', function(data) {
                //���o�Ǧ^��accessToken
                accessToken=JSON.parse(data).access_token;

                var getUserInfo, getGroupMember;
                //���ouserInfo
                https.get(
                    "https://auth.ischool.com.tw/services/me.php?access_token=" + accessToken
                    , function(resUserInfo){
                        resUserInfo.on('data', function(data) {
                            getUserInfo = data;
                            finish();
                        });
                    }
                );

                //���oGroupMember
                https.get(
                    "https://dsns.1campus.net/" + application + "/sakura/GetGroupMember"
                        + "?stt=PassportAccessToken"
                        + "&AccessToken=" + accessToken
                        + "&parser=spliter&content=GroupId:" + groupid
                    , function(rspRedirect){
                        //http redirect�Ahttps://dsns.1campus.net �|redirect��u������m
                        //��dsns.1campus.net��redirect header�A�I�s
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
                //����response�A�P�_�G��response������ƫᲣ��
                var finish = function(){
                    if(getUserInfo && getGroupMember){
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
+ '    </style>'
+ '</head>'
+ '<body>'
+ '        <div>'
+ '            UserInfo:<br />'
+ '            <textarea id="TextArea1" name="S1" >'+getUserInfo+'</textarea><br />'
+ '            GroupMember:<br />'
+ '            <textarea id="TextArea2" name="S2" >'+getGroupMember+'</textarea>'
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