<%
'------------------------------------------------------------------------
' 請至 https://auth.ischool.com.tw/1campus/manage/ 註冊App
' 取得ClientID、ClientSecret
'
' RedirectURI 您註冊App時設定的OAuth RedirectURI
' EntryPoint 您的系統進入OAuth認證及授權的網址
'------------------------------------------------------------------------

Dim ClientId, ClientSecret, RedirectURI, EntryPoint

ClientId = "*******************************"
ClientSecret = "**********************************************"
RedirectURI = "http://localhost:26786/OAuthCallBack.asp"
EntryPoint = "http://localhost:26786/EntryPoint.asp"
%>