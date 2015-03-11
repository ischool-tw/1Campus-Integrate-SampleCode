<%@ CodePage=65001 Language="VBScript"%>
<!--#include file="config.inc"-->
<!--#include file="aspJSON.asp"-->
<%
'------------------------------------------------------------------------
' 本頁是完成OAuth授權後進入實際資料整合的頁面
'------------------------------------------------------------------------
Dim client_id, client_secret, redirect_uri, req_app, code
Dim accessToken, url
Dim token_status, token_text

' 註冊的ClientID 資料
client_id = ClientId
' 註冊的ClientID 資料
client_secret = ClientSecret
' 註冊的RedirectURI 資料
redirect_uri = RedirectURI
' 由傳入的state參數取得application
req_app = Split(Request("state"), "@")(0)
' 由傳入的state參數取得groupid
req_group_id = Split(Request("state"), "@")(1)
' 取得code
code = Request("code")
' 透過Server to Server呼叫由code換取AccessToken
accessToken = ""


Set xmlHttp = Server.CreateObject("MSXML2.ServerXMLHTTP")

' 取得AccessToken
url = "https://auth.ischool.com.tw/oauth/token.php" &_
    "?grant_type=authorization_code" &_
    "&client_id=" & client_id &_
    "&client_secret=" & client_secret &_
    "&redirect_uri=" & Server.URLEncode(redirect_uri) &_
    "&code=" & code
xmlHttp.Open "GET", url, false
xmlHttp.Send
If xmlHttp.status = 200 Then
    Set oJSON = New aspJSON
    oJSON.loadJSON(xmlHttp.responseText)
    accessToken = oJSON.data("access_token")
    Set oJSON = Nothing
End If

' 取得UserInfo
url = "https://auth.ischool.com.tw/services/me.php" &_
    "?access_token=" & accessToken
xmlHttp.Open "GET", url, false
xmlHttp.Send
If xmlHttp.status = 200 Then
    resultUserInfo = xmlHttp.responseText
End If

' 取得GroupMember
' 設定自動處理http redirect，https://dsns.1campus.net 會redirect到真正的位置
url = "https://dsns.1campus.net/" & req_app & "/sakura/GetGroupMember" &_
    "?stt=PassportAccessToken" &_
    "&AccessToken=" & accessToken &_
    "&parser=spliter&content=GroupId:" & req_group_id
xmlHttp.Open "GET", url, false
xmlHttp.Send
If xmlHttp.status = 200 Then
    resultGroupMember = xmlHttp.responseText
    Set objXMLDoc = Server.CreateObject("MSXML2.DOMDocument.3.0")
    objXMLDoc.async = False
    objXMLDoc.loadXML(resultGroupMember)
    Dim xmlGroup
    For Each xmlGroup In objXMLDoc.documentElement.selectNodes("/Body/Group[GroupId=" & req_group_id & "]")
        Dim isTeacher : isTeacher = xmlGroup.selectSingleNode("IsTeacher").text
        Dim isStudent : isStudent = xmlGroup.selectSingleNode("IsStudent").text
        ' 透過 isTeacher, isStudent 知道登入者在群組中的身分，並驗證與登入身份是否符合
        ' Response.Write Server.HTMLEncode(isTeacher) & " "
        ' Response.Write Server.HTMLEncode(isStudent) & "<br>"
        ' 開始驗證...
        ' 開始同步...
    Next
    Set objXMLDoc = Nothing
End If
Set xmlHttp = Nothing
%>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
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
    </style>
</head>
<body>
    <div>
        UserInfo:<br />
        <textarea id="TextArea1" name="S1" ><%=resultUserInfo%></textarea><br />
        GroupMember:<br />
        <textarea id="TextArea2" name="S2" ><%=resultGroupMember%></textarea>
    </div>
</body>
</html>