# encoding: utf-8
load 'config.rb'
require 'cgi'
require 'net/http'
require 'uri'
require 'json'

class OnecampusController < ApplicationController
    def entry_point
        #------------------------------------------------------------------------
        # 進入系統的第一個頁面，由本頁面進入OAuth的認證及授權的流程。
        #
        # request['application']：
        # 代表與本App進行整合的"學校"主機(ex: demo.ischool.j)，
        # 我們需要在OAuth取得授權時要求使用者對此學校主機的授權。
        #
        # request['groupid']：
        # 代表目前使用者所使用的群組編號
        #
        # 要求使用者授權的內容：
        # ※ User.Mail 使用者的email資訊
        # ※ User.BasicInfo 使用者的基本資料
        # ※ 使用者在學校的群組相關資料 ex:demo.ischool.j:sakura
        #------------------------------------------------------------------------

        # 取得由1Campus進入本頁時所帶的application參數
        req_app = request['application']
        # 取得由1Campus進入本頁時所帶的groupid參數
        req_group_id = request['groupid']
        # 註冊的ClientID 資料
        client_id = ClientId
        # 註冊的RedirectURI 資料
        redirect_uri = RedirectURI
        # 要求授權的內容，以「,」分隔
        scope = "User.Mail,User.BasicInfo," + req_app + ":sakura"

        # 進行http redirect進入OAuth流程
        url = "https://auth.ischool.com.tw/oauth/authorize.php" +
            "?response_type=code" +
            "&client_id=" + client_id +
            "&redirect_uri=" + CGI::escape(redirect_uri) +
            "&scope=" + scope +
            "&state=" + req_app + "@" + req_group_id

        redirect_to url
    end


    def fetch(uri_str, limit = 10)
        raise ArgumentError, 'HTTP redirect too deep' if limit == 0

        url = URI.parse(uri_str)
        http = Net::HTTP.new(url.host, url.port)
        if url.scheme == 'https'
            http.use_ssl = true
            http.verify_mode = OpenSSL::SSL::VERIFY_NONE
        end
        request = Net::HTTP::Get.new(url.request_uri)
        response = http.request(request)
        case response
        when Net::HTTPSuccess     then response
        when Net::HTTPRedirection then fetch(response['location'], limit - 1)
        else
            response.error!
        end
    end

    def oauth_callback
        #------------------------------------------------------------------------
        # 完成OAuth授權後進入實際資料整合
        #------------------------------------------------------------------------

        # 註冊的ClientID 資料
        client_id = ClientId
        # 註冊的ClientID 資料
        client_secret = ClientSecret
        # 註冊的RedirectURI 資料
        redirect_uri = RedirectURI
        # 由傳入的state參數取得application
        req_app = request["state"].split('@')[0]
        # 由傳入的state參數取得groupid
        req_group_id = request["state"].split('@')[1]
        # 取得code
        code = request["code"]
        # 透過Server to Server呼叫由code換取AccessToken
        accessToken = ""


        # 取得AccessToken
        url = "https://auth.ischool.com.tw/oauth/token.php" +
            "?grant_type=authorization_code" +
            "&client_id=" + client_id +
            "&client_secret=" + client_secret +
            "&redirect_uri=" + CGI::escape(redirect_uri) +
            "&code=" + code

        response = fetch(url, limit = 10)
        if response.code == '200'
            parsed = JSON.parse(response.body)
            accessToken = parsed["access_token"]
        end


        # 取得UserInfo
        url = "https://auth.ischool.com.tw/services/me.php" +
            "?access_token=" + accessToken
        response = fetch(url, limit = 10)
        @resultUserInfo = response.body if response.code == '200'


        # 取得Group
        # 設定自動處理http redirect，https://dsns.1campus.net 會redirect到真正的位置
        url = "https://dsns.1campus.net/" + req_app + "/sakura/GetMyGroup" +
            "?stt=PassportAccessToken" +
            "&AccessToken=" + accessToken
        response = fetch(url, limit = 10)
        @resultGroup = response.body if response.code == '200'


        # 取得GroupMember
        # 設定自動處理http redirect，https://dsns.1campus.net 會redirect到真正的位置
        url = "https://dsns.1campus.net/" + req_app + "/sakura/GetGroupMember" +
            "?stt=PassportAccessToken" +
            "&AccessToken=" + accessToken

        response = fetch(url, limit = 10)
        @resultGroupMember = response.body if response.code == '200'
    end
end