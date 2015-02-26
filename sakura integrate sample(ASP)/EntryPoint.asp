<!--#include file="config.inc"-->
<%
'------------------------------------------------------------------------
' 本頁是進入系統的第一個頁面，由本頁面進入OAuth的認證及授權的流程。
'
' Request("application")：
' 代表與本App進行整合的"學校"主機(ex: demo.ischool.j)，
' 我們需要在OAuth取得授權時要求使用者對此學校主機的授權。
'
' 要求使用者授權的內容：
' ※ User.Mail 使用者的email資訊
' ※ User.BasicInfo 使用者的基本資料
' ※ 使用者在學校的群組相關資料 ex:demo.ischool.j:sakura
'------------------------------------------------------------------------

Dim req_app, client_id, redirect_uri, url

' 取得由1Campus進入本頁時所帶的application參數
req_app = Request("application")
' 取得由1Campus進入本頁時所帶的groupid參數
req_group_id = Request("groupid")
' 註冊的ClientID 資料
client_id = ClientId
' 註冊的RedirectURI 資料
redirect_uri = RedirectURI
' 要求授權的內容，以「,」分隔
scope = "User.Mail,User.BasicInfo," & req_app & ":sakura"

' 進行http redirect進入OAuth流程
url = "https://auth.ischool.com.tw/oauth/authorize.php" &_
    "?response_type=code" &_
    "&client_id=" & client_id &_
    "&redirect_uri=" & Server.URLEncode(redirect_uri) &_
    "&scope=" & scope &_
    "&state=" & req_app & "@" & req_group_id

Response.Redirect url
%>