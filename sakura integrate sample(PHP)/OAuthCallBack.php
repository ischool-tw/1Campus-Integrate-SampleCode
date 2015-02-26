<?php
//本頁是完成OAuth授權後進入實際資料整合的頁面

require_once "config.php";

//註冊的ClientID 資料
$client_id = $ClientId;
//註冊的ClientID 資料
$client_secret = $ClientSecret;
//註冊的RedirectURI 資料
$redirect_uri = $RedirectURI;
//由傳入的state參數取得application
$application = explode('@', $_REQUEST["state"])[0];
//由傳入的state參數取得groupid
$groupid = explode('@', $_REQUEST["state"])[1];
//取得code
$code = $_REQUEST["code"];
//透過Server to Server呼叫由code換取AccessToken
$accessToken = "";


//取得AccessToken
$chAccessToken = curl_init();
curl_setopt($chAccessToken, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAccessToken, CURLOPT_SSL_VERIFYPEER, false);  //skip ssl verify
curl_setopt($chAccessToken, CURLOPT_ENCODING, '');//auto handle content-encoding ex: gzip
curl_setopt($chAccessToken, CURLOPT_URL,
    "https://auth.ischool.com.tw/oauth/token.php"
        . "?client_id=" . $client_id
        . "&client_secret=" . $client_secret
        . "&code=" . $code
        . "&grant_type=authorization_code"
        . "&redirect_uri=" . urlencode($redirect_uri) );
$resultAccessToken = curl_exec($chAccessToken);
curl_close ($chAccessToken);
$accessToken = json_decode($resultAccessToken, true)["access_token"];

//取得UserInfo
$chUserInfo = curl_init();
curl_setopt($chUserInfo, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chUserInfo, CURLOPT_SSL_VERIFYPEER, false);  //skip ssl verify
curl_setopt($chUserInfo, CURLOPT_ENCODING, '');//auto handle content-encoding ex: gzip
curl_setopt($chUserInfo, CURLOPT_URL,
    "https://auth.ischool.com.tw/services/me.php"
        . "?access_token=" . $accessToken );
$resultUserInfo = curl_exec($chUserInfo);
curl_close ($chUserInfo);

//取得Group
$chGroup = curl_init();
curl_setopt($chGroup, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chGroup, CURLOPT_SSL_VERIFYPEER, false);  //skip ssl verify

//設定自動處理http redirect，https://dsns.1campus.net 會redirect到真正的位置
curl_setopt($chGroup, CURLOPT_FOLLOWLOCATION, true );

curl_setopt($chGroup, CURLOPT_ENCODING, '');//auto handle content-encoding ex: gzip
curl_setopt($chGroup, CURLOPT_URL,
    "https://dsns.1campus.net/" . $application . "/sakura/GetMyGroup"
        . "?stt=PassportAccessToken"
        . "&AccessToken=" . $accessToken );
$resultGroup = curl_exec($chGroup);
curl_close ($chGroup);

//取得GroupMember
$chGroupMember = curl_init();
curl_setopt($chGroupMember, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chGroupMember, CURLOPT_SSL_VERIFYPEER, false);  //skip ssl verify

//設定自動處理http redirect，https://dsns.1campus.net 會redirect到真正的位置
curl_setopt($chGroupMember, CURLOPT_FOLLOWLOCATION, true );

curl_setopt($chGroupMember, CURLOPT_ENCODING, '');//auto handle content-encoding ex: gzip
curl_setopt($chGroupMember, CURLOPT_URL,
    "https://dsns.1campus.net/" . $application . "/sakura/GetGroupMember"
        . "?stt=PassportAccessToken"
        . "&AccessToken=" . $accessToken );
$resultGroupMember = curl_exec($chGroupMember);
curl_close ($chGroupMember);
?>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <style type="text/css">
        #TextArea1 {
            height: 238px;
            width: 905px;
        }

        #TextArea2 {
            height: 238px;
            width: 905px;
        }

        #TextArea3 {
            height: 238px;
            width: 905px;
        }
    </style>
</head>
<body>
        <div>
            UserInfo:<br />
            <textarea id="TextArea1" name="S1" ><?php echo $resultUserInfo ?></textarea><br />
            Group:<br />
            <textarea id="TextArea2" name="S2" ><?php echo $resultGroup ?></textarea><br />
            GroupMember:<br />
            <textarea id="TextArea3" name="S3" ><?php echo $resultGroupMember ?></textarea>
        </div>
</body>
</html>