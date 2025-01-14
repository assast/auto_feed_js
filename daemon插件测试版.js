// ==UserScript==
// @name         daemon插件测试版
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  在右上角添加按钮并点击发布
// @author       Your name
// @match        http*://*/upload.php*
// @match        http*://*/details.php*
// @match        https://kp.m-team.cc/detail/*
// @match        https://*/torrents/*
// @match        https://totheglory.im/t/*

// @grant        GM_xmlhttpRequest
// @license MIT
// ==/UserScript==
// daemon接口配置
var apiurl = 'https://nc.lenoas.de:8443/api/add_torrent';
var fileapiurl = 'https://nc.lenoas.de:8443/api/upload';
var deployapiurl = 'https://nc.lenoas.de:8443/api/force_deploy';

// 页面加载完成后执行
var site_url = decodeURI(window.location.href);
if (site_url.match(/details.php\?id=\d+&uploaded=1/) || site_url.match(/torrents\/download_check/)) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
else if (site_url.match(/upload.php/)) {
    addButton(1, '点击发布', ()=>{
        const publishButton = document.querySelector('input[value="发布"]');
        if (publishButton) {
            publishButton.click();
        } else {
            addMsg('未找到发布按钮！');
        }
    });
}
// 添加按钮
if (site_url.match(/details.php/)) {
    addButton(1, '编辑种子', ()=>{
        debugger;
        const editButton = document.querySelector('a[href*="edit.php"]');
        if (editButton) {
            window.location.assign(editButton.href);
        } else {
            addMsg('未找到编辑按钮！');
        }
    });
}
if(site_url.match(/torrents/)){
    addButton(1, '编辑种子', ()=>{
        debugger;
        const editButton = document.querySelector('a[href*="edit"]');
        if (editButton) {
            window.location.assign(editButton.href);
        } else {
            addMsg('未找到编辑按钮！');
        }
    });
}
addButton(2, '推送链接', ()=>{
    pushDaemon(getUrl());
});
addButton(3, '推送文件', ()=>{
    getBlob(getUrl());
});
addButton(4, '强制发布', ()=>{
    deployDaemon();
});
// 初始化函数
function init() {
    // 等待目标元素加载完成
    waitForElement(processDownload);
}
// 等待元素出现的函数
function waitForElement(callback, maxTries = 30, interval = 1000) {
    let tries = 0;

    function check() {
        debugger;

        if (getUrl()){
            callback();
            return;
        }

        tries++;
        if (tries < maxTries) {
            setTimeout(check, interval);
        }
    }

    check();
}
function getUrl(){
    if(site_url.match(/torrents\/download_check/)){
        // 获取所有包含 "torrents/download" 的链接
        const links = document.querySelectorAll('a[href*="torrents/download"]');
        // 筛选包含 i 标签的链接
        const targetLink = Array.from(links).find(link => link.querySelector('i'));
        // 获取 href 属性
        return targetLink ? targetLink.getAttribute('href') : null;
    } else {
        const element = document.getElementById('tDownUrl');
        if (element && element.value) {
            return element.value;
        }
    }
    return null;
}
// 主处理函数
function processDownload() {
    debugger;
    // 检查是否同域
    try {
        const currentDomain = new URL(window.location.href).hostname;
        const urlDomain = new URL(getUrl()).hostname;

        if (currentDomain === urlDomain) {
            // 同域直接下载
            getBlob(getUrl());
        } else {
            addMsg('请刷新界面后重试！');
        }
    } catch (error) {
        console.error('URL解析错误:', error);
    }
}

function getBlob(url) {
    GM_xmlhttpRequest({
        method: "GET",
        url: url,
        overrideMimeType: "text/plain; charset=x-user-defined",
        onload: (xhr) => {
            try {
                // 转换数据
                var raw = xhr.responseText;
                var bytes = new Uint8Array(raw.length);
                for(var i = 0; i < raw.length; i++) {
                    bytes[i] = raw.charCodeAt(i) & 0xff;
                }

                // 创建 Blob
                var blob = new Blob([bytes], { type: 'application/x-bittorrent' });

                // 获取文件名
                const filename = 'file.torrent';

                // 创建 FormData
                var formData = new FormData();
                formData.append('file', blob, filename);

                // 上传文件
                uploadTorrentDaemon(formData);
            } catch(error) {
                console.error('Error processing torrent:', error);
                addMsg('处理种子文件失败: ' + error.message);
            }
        },
        onerror: function(res) {
            console.error('Download failed:', res);
            addMsg('下载种子文件失败');
        }
    });
}

function pushDaemon(url){
    // 准备请求数据
    const data = {
        torrent_link: url
    };

    // 发送请求
    fetch(apiurl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
        if (data.code === 200) {
            addMsg('推送成功：' + JSON.stringify(data));
        } else {
            addMsg('推送失败：' + JSON.stringify(data));
        }
    }).catch((error) => {
        addMsg('推送异常：' + error + '\n详细信息：' + JSON.stringify(error));
    });
}

function uploadTorrentDaemon(formData) {
    GM_xmlhttpRequest({
        method: "POST",
        url: fileapiurl,  // 替换为实际的上传接口
        data: formData,
        headers: {
            'Authorization': 'Bearer your-token-here'  // 替换为实际的认证信息
        },
        onload: function(response) {
            try {
                debugger;
                var result = JSON.parse(response.responseText);
                if (result.code === 200) {
                    addMsg('推送成功：' + JSON.stringify(result));
                } else {
                    addMsg('推送失败：' + JSON.stringify(result));
                }
            } catch(error) {
                addMsg('解析响应失败: ' + error.message);
            }
        },
        onerror: function(error) {
            addMsg('上传失败: 网络错误');
        },
        onprogress: function(progress) {
            if (progress.lengthComputable) {
                var percentComplete = (progress.loaded / progress.total) * 100;
                console.log('上传进度: ' + percentComplete.toFixed(2) + '%');
            }
        }
    });
}
function deployDaemon(){
    // 准备请求数据
    const data = {};

    // 发送请求
    fetch(deployapiurl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data)
    }).then(response => response.json()).then(data => {
        if (data.code === 200) {
            addMsg('成功：' + JSON.stringify(data));
        } else {
            addMsg('失败：' + JSON.stringify(data));
        }
    }).catch((error) => {
        addMsg('推送异常：' + error + '\n详细信息：' + JSON.stringify(error));
    });
}
function addMsg(msg) {
    // 移除已存在的消息框（如果有）
    const existingMsg = document.getElementById('addMsg');
    if (existingMsg) {
        existingMsg.remove();
    }

    const textarea = document.createElement('textarea');
    textarea.value = msg;
    textarea.readOnly = true;
    textarea.id = 'addMsg';

    // 设置样式
    Object.assign(textarea.style, {
        position: 'fixed',
        top: '10px',
        left: '50%', // 设置左边距为50%
        transform: 'translateX(-50%)', // 使用transform将元素向左移动自身宽度的一半
        zIndex: '9999',
        width: '500px',
        padding: '5px',
        border: '1px solid rgba(204, 204, 204, 0.5)',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color: '#000',
        fontSize: '12px',
        resize: 'none',
        overflow: 'auto',
        wordWrap: 'break-word',
        lineHeight: '1.4',
        minHeight: '80px',
        maxHeight: '200px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    });

    // 自动调整高度
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';

    document.body.appendChild(textarea);
}
function addButton(idx, label, callback) {
    var toppx = 70 * (idx - 1) + 150;
    // 创建按钮
    const button = document.createElement('button');
    button.textContent = label;
    button.style.position = 'fixed';
    button.style.top = toppx + 'px';
    button.style.right = '150px';
    button.style.zIndex = '9999';
    button.style.padding = '20px';
    button.style.backgroundColor = 'rgba(135, 206, 235, 0.3)';
    button.style.color = '#000000'; // 黑色文字
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';
    button.style.fontWeight = 'bold'; // 文字加粗
    button.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.5)'; // 添加白色文字阴影
    button.style.fontSize = '16px'; // 添加这行来设置文字大小

    // 添加悬停效果
    button.addEventListener('mouseover', function() {
        this.style.backgroundColor = 'rgba(0, 123, 255, 0.5)'; // 悬停时增加到50%不透明度
    });
    button.addEventListener('mouseout', function() {
        this.style.backgroundColor = 'rgba(0, 123, 255, 0.3)'; // 恢复30%不透明度
    });

    // 点击事件
    button.addEventListener('click', function() {
        callback();
    });

    // 将按钮添加到页面
    document.body.appendChild(button);
}
