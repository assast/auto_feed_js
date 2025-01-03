// ==UserScript==
// @name         SpringSunday-Torrent-Assistant 测试版魔改
// @namespace    SpringSunday-Torrent-Assistant-assast
// @version      1.2.35
// @description  春天审种助手
// @author       SSD
// @include      http*://springsunday.net/details.php*
// @include      http*://springsunday.net/torrents.php*
// @include      http*://springsunday.net/offers.php*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      movie.douban.com
// @connect      cmct.xyz
// @connect      static.hdcmct.org
// @connect      gifyu.com
// @connect      imgbox.com
// @connect      pixhost.to
// @connect      ptpimg.me
// @connect      ibb.pics
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    //种审判断
    //=====================================
    var isEditor;
    if (GM_info.script.name === "SpringSunday-Torrent-Assistant 测试版魔改") {
        isEditor= GM_getValue('isEditor', true);
    }else {
        isEditor= GM_getValue('isEditor', false);
    }

    if (window.location.href.includes("/details.php")) {

        $('#outer').prepend('<div style="display: inline-block; padding: 10px 30px; color: white; background: red; font-weight: bold;" id="assistant-tooltips"></div>');

        // 查找目标div
        var targetDiv = document.querySelector('#assistant-tooltips');
        if (targetDiv) {
            // 创建多选框和标签
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'editorModeCheckbox';
            checkbox.checked = isEditor;

            var label = document.createElement('label');
            label.htmlFor = 'editorModeCheckbox';
            label.textContent = '种审模式';

            // 创建包含多选框和标签的新div
            var containerDiv = document.createElement('div');
            containerDiv.style.cssText = 'display: inline-block; margin-left: 20px; vertical-align: top;';
            containerDiv.appendChild(checkbox);
            containerDiv.appendChild(label);

            // 创建换行元素并插入
            var breakElement = document.createElement('br');
            targetDiv.parentNode.insertBefore(breakElement, targetDiv.nextSibling);
            targetDiv.parentNode.insertBefore(containerDiv, breakElement.nextSibling);

            // 添加事件监听器来更新isEditor变量、存储状态并刷新页面
            checkbox.addEventListener('change', function () {
                GM_setValue('isEditor', this.checked);
                window.location.reload();  // 刷新页面
            });
        }
        if (isEditor) {
            $('#assistant-tooltips').after('<br/><div style="display: inline-block; padding: 10px 30px; color: white; background: DarkSlateGray; font-weight: bold;" id="editor-tooltips"></div>');
        }

        var cat_constant = {
            501: 'Movies(电影)',
            502: 'TV Series(剧集)',
            503: 'Docs(纪录)',
            505: 'TV Shows(综艺)',
            506: 'Sports(体育)',
            507: 'MV(音乐视频)',
            508: 'Music(音乐)',
            509: 'Others(其他类型)'
        };

        var type_constant = {
            1: 'Blu-ray',
            2: 'MiniBD',
            3: 'DVD',
            4: 'Remux',
            5: 'HDTV',
            6: 'BDRip',
            7: 'WEB-DL',
            8: 'WEBRip',
            9: 'TVRip',
            10: 'DVDRip',
            11: 'CD',
            99: 'Other'
        };

        var encode_constant = {
            1: 'H.265/HEVC',
            2: 'H.264/AVC',
            3: 'VC-1',
            4: 'MPEG-2',
            99: 'Other'
        };

        var audio_constant = {
            1: 'DTS-HD',
            2: 'TrueHD',
            3: 'DTS',
            4: 'AC-3',
            5: 'AAC',
            6: 'LPCM',
            7: 'FLAC',
            8: 'APE',
            9: 'WAV',
            10: 'MP3',
            11: 'E-AC-3',
            99: 'Other'
        };

        var resolution_constant = {
            1: '2160p',
            2: '1080p',
            3: '1080i',
            4: '720p',
            5: 'SD',
            99: ' 未检测到分辨率 '
        };

        var area_constant = {
            1: 'Mainland(大陆)',
            2: 'Hongkong(香港)',
            3: 'Taiwan(台湾)',
            4: 'West(欧美)',
            5: 'Japan(日本)',
            6: 'Korea(韩国)',
            7: 'India(印度)',
            8: 'Russia(俄国)',
            9: 'Thailand(泰国)',
            99: 'Other(其他地区)'
        }

        var group_constant = {
            1: 'CMCT',
            8: 'CMCTA',
            9: 'CMCTV',
            3: 'DIY',
            6: '个人原创',
        }

        var title = $('#torrent-name').text();
        var exclusive = 0;
        if (title.indexOf('禁转') >= 0) {
            exclusive = 1;
        }

        title = title.trim();
        console.log(title);

        var title_lowercase = title.toLowerCase();
        var title_type, title_encode, title_audio, title_resolution, title_group, title_is_complete;

        // 格式
        if (/\.minibd/.test(title_lowercase)) {
            title_type = 2;
        } else if (/\.remux/.test(title_lowercase)) {
            title_type = 4;
        } else if (/\.bdrip/.test(title_lowercase) || (/(\.bluray|\.blu-ray)/.test(title_lowercase) && /\.x26[45]/.test(title_lowercase))) {
            title_type = 6;
        } else if (/(\.bluray|\.blu-ray)/.test(title_lowercase)) {
            title_type = 1;
        } else if (/\.webrip/.test(title_lowercase) || (/\.web\./.test(title_lowercase) && /\.x26[45]/.test(title_lowercase))) {
            title_type = 8;
        } else if (/(\.web-dl|\.webdl|\.web\.)/.test(title_lowercase)) {
            title_type = 7;
        } else if (/\.tvrip/.test(title_lowercase)) {
            title_type = 9;
        } else if (/(\.hdtv|\.hdtv\.)/.test(title_lowercase)) {
            title_type = 5;
        } else if (/\.dvdrip/.test(title_lowercase) || ((/(\.dvd|\.dvd\.)/.test(title_lowercase)) && /\.x26[45]/.test(title_lowercase))) {
            title_type = 10;
        } else if (/(\.dvd|\.dvd\.)/.test(title_lowercase)) {
            title_type = 3;
        }


        // codec
        if (/(\.x265|\.h265|\.h\.265|\.hevc)/.test(title_lowercase)) {
            title_encode = 1;
        } else if (/(\.x264|\.h264|\.h\.264|\.avc)/.test(title_lowercase)) {
            title_encode = 2;
        } else if (/(\.vc-1|\.vc1)/.test(title_lowercase)) {
            title_encode = 3;
        } else if (/(mpeg2|mpeg-2)/.test(title_lowercase)) {
            title_encode = 4;
        }

        // audiocodec
        if (/\.(dts-hd|dtshd|dts-x|dts:x)/.test(title_lowercase)) {
            title_audio = 1;
        } else if (/\.truehd/.test(title_lowercase)) {
            title_audio = 2;
        } else if (/\.lpcm|\.pcm/.test(title_lowercase)) {
            title_audio = 6;
        } else if (/\.dts/.test(title_lowercase)) {
            title_audio = 3;
        }else if (/\.ddp|\.dd\+|\.e-ac-3|\.eac3/.test(title_lowercase)) {
            title_audio = 11;
        } else if (/\.ac3|\.ac-3|\.dd2|\.dd5|\.dd\.2|\.dd\.5/.test(title_lowercase)) {
            title_audio = 4;
        } else if (/\.aac/.test(title_lowercase)) {
            title_audio = 5;
        } else if (/\.flac/.test(title_lowercase)) {
            title_audio = 7;
        }
        console.log("title_audio"+title_audio)
        // standard
        if (!/remastered/.test(title_lowercase) && (/\.2160p/.test(title_lowercase) || (/\.uhd/.test(title_lowercase) && !/\.1080p/.test(title_lowercase)) || /\.4k\./.test(title_lowercase))) {
            title_resolution = 1;
        } else if (/\.1080p/.test(title_lowercase)) {
            title_resolution = 2;
        } else if (/\.1080i/.test(title_lowercase)) {
            title_resolution = 3;
        } else if (/\.720p/.test(title_lowercase)) {
            title_resolution = 4;
        } else {
            title_resolution = 99;
        }
        if (/complete/.test(title_lowercase)) {
            title_is_complete = true;
        }
        // 发布组选择
        if (/cmctv/.test(title_lowercase)) {
            title_group = 9;
        } else if (/cmcta/.test(title_lowercase)) {
            title_group = 8;
        } else if (/cmct/.test(title_lowercase)) {
            title_group = 1;
        }

        console.log('title_type:', title_type, 'title_encode:', title_encode, 'title_audio:', title_audio, 'title_resolution:', title_resolution, 'title_group:', title_group, 'title_is_complete:', title_is_complete);


        var subtitle, cat, type, encode, audio, resolution, area, group, anonymous;
        var poster;
        var fixtd, douban, imdb, mediainfo_title, mediainfo_s, torrent_extra, douban_raw;
        var sub_chinese, audio_chinese, is_complete, is_chinese, is_dovi, is_hdr10, is_hdr10p, is_hlg, is_hdr_vivid,
            is_c_dub, is_bd, is_cc,is_anime,is_contest;
        var tdlist = $('#outer table:first').find('td');

        // Mediainfo 信息
        let mediainfoElement = document.querySelector('.mediainfo-short .codemain');
        if (mediainfoElement) {
            mediainfo_s = mediainfoElement.innerHTML.replace(/<br\s*\/?>/gi, '\n').trim();
        } else {
            $('#assistant-tooltips').append('无「MediaInfo」信息，请检查<br/>');
            mediainfo_s = '   '
        }

        mediainfo_title = $('.mediainfo-raw .codemain').text();
        for (var i = 0; i < tdlist.length; i++) {
            var td = $(tdlist[i]);

            if (td.text() === '副标题' || td.text() === '副標題') {
                subtitle = td.parent().children().last().text();
            }

            if (td.text() === '添加') {
                let text = td.parent().children().last().text();
                if (text.indexOf('匿名') >= 0) {
                    anonymous = 1;
                }
            }

            if (td.text() === '基本信息') {

                var catText = $('span[title="类型"]').text();
                var typeText = $('span[title="格式"]').text();
                var encodeText = $('span[title="视频编码"]').text();
                var audioText = $('span[title="音频编码"]').text();
                var resolutionText = $('span[title="分辨率"]').text();
                var areaText = $('span[title="地区"]').text();
                var authorText = $('span[title="制作组"]').text();
                console.log(catText + typeText + encodeText + audioText + resolutionText + areaText + authorText)

                // 类型
                if (/Movies\(电影\)/.test(catText)) {
                    cat = 501;
                } else if (/TV Series\(剧集\)/.test(catText)) {
                    cat = 502;
                } else if (/Docs\(纪录\)/.test(catText)) {
                    cat = 503;
                } else if (/TV Shows\(综艺\)/.test(catText)) {
                    cat = 505;
                } else if (/Sports\(体育\)/.test(catText)) {
                    cat = 506;
                } else if (/MV\(音乐视频\)/.test(catText)) {
                    cat = 507;
                } else if (/Music\(音乐\)/.test(catText)) {
                    cat = 508;
                } else if (/Other\(其他类型\)/.test(catText)) {
                    cat = 509;
                }


                // 地区
                if (/Mainland\(大陆\)/.test(areaText)) {
                    area = 1;
                } else if (/Hongkong\(香港\)/.test(areaText)) {
                    area = 2;
                } else if (/Taiwan\(台湾\)/.test(areaText)) {
                    area = 3;
                } else if (/West\(欧美\)/.test(areaText)) {
                    area = 4;
                } else if (/Japan\(日本\)/.test(areaText)) {
                    area = 5;
                } else if (/Korea\(韩国\)/.test(areaText)) {
                    area = 6;
                } else if (/India\(印度\)/.test(areaText)) {
                    area = 7;
                } else if (/Russia\(俄国\)/.test(areaText)) {
                    area = 8;
                } else if (/Thailand\(泰国\)/.test(areaText)) {
                    area = 9;
                } else if (/Other\(其他地区\)/.test(areaText)) {
                    area = 99;
                }

                // 格式
                if (/Blu-ray/.test(typeText)) {
                    type = 1;
                } else if (/Remux/.test(typeText)) {
                    type = 4;
                } else if (/MiniBD/.test(typeText)) {
                    type = 2;
                } else if (/BDRip/.test(typeText)) {
                    type = 6;
                } else if (/WEB-DL/.test(typeText)) {
                    type = 7;
                } else if (/WEBRip/.test(typeText)) {
                    type = 8;
                } else if (/HDTV/.test(typeText)) {
                    type = 5;
                } else if (/TVRip/.test(typeText)) {
                    type = 9;
                } else if (/DVDRip/.test(typeText)) {
                    type = 10;
                } else if (/DVD/.test(typeText)) {
                    type = 3;
                } else if (/CD/.test(typeText)) {
                    type = 11;
                } else if (/Other/.test(typeText)) {
                    type = 99;
                }

                // 视频编码
                if (/H\.265\/HEVC/.test(encodeText)) {
                    encode = 1;
                } else if (/H\.264\/AVC/.test(encodeText)) {
                    encode = 2;
                } else if (/VC-1/.test(encodeText)) {
                    encode = 3;
                } else if (/MPEG-2/.test(encodeText)) {
                    encode = 4;
                } else if (/Other/.test(encodeText)) {
                    encode = 99;
                }

                // 音频编码
                if (/DTS-HD/.test(audioText)) {
                    audio = 1;
                } else if (/DTS/.test(audioText)) {
                    audio = 3;
                } else if (/TrueHD/.test(audioText)) {
                    audio = 2;
                } else if (/LPCM/.test(audioText)) {
                    audio = 6;
                } else if (/E-AC-3/.test(audioText)) {
                    audio = 11;
                } else if (/AC-3/.test(audioText)) {
                    audio = 4;
                } else if (/AAC/.test(audioText)) {
                    audio = 5;
                } else if (/FLAC/.test(audioText)) {
                    audio = 7;
                } else if (/APE/.test(audioText)) {
                    audio = 8;
                } else if (/WAV/.test(audioText)) {
                    audio = 9;
                } else if (/MP3/.test(audioText)) {
                    audio = 10;
                } else if (/Other/.test(audioText)) {
                    audio = 99;
                }

                // 视频分辨率
                if (/2160p/.test(resolutionText)) {
                    resolution = 1;
                } else if (/1080p/.test(resolutionText)) {
                    resolution = 2;
                } else if (/1080i/.test(resolutionText)) {
                    resolution = 3;
                } else if (/720p/.test(resolutionText)) {
                    resolution = 4;
                } else if (/SD/.test(resolutionText)) {
                    resolution = 5;
                } else if (/Other/.test(resolutionText)) {
                    resolution = 99;
                }

                // 制作组
                if (/CMCTV/.test(authorText)) {
                    group = 9;
                } else if (/CMCTA/.test(authorText)) {
                    group = 8;
                } else if (/CMCT/.test(authorText)) {
                    group = 1;
                } else if (/DIY/.test(authorText)) {
                    group = 3;
                } else if (/个人原创/.test(authorText)) {
                    group = 6;
                }
                console.log('cat:', cat, 'type:', type, 'encode:', encode, 'audio:', audio, 'resolution:', resolution, 'area:', area, 'group:', group);

            }

            if (td.text() === '行为') {
                fixtd = td.parent().children().last();
            }

            if (td.text().trim() === '海报') {
                poster = $('#kposter').children().attr('src');
            }

            if (td.text() === '标签') {
                let text = td.parent().children().last().text();

                // 使用正则表达式进行匹配
                if (/合集/.test(text)) {
                    is_complete = true;
                }
                if (/中字/.test(text)) {
                    is_chinese = true;
                }
                if (/HDR10\+/.test(text)) {
                    is_hdr10p = true;
                }
                if (/HDR10(?!\+)/.test(text)) {
                    is_hdr10 = true;
                }
                if (/DoVi/.test(text)) {
                    is_dovi = true;
                }
                if (/HLG/.test(text)) {
                    is_hlg = true;
                }
                if (/菁彩HDR/.test(text)) {
                    is_hdr_vivid = true;
                }
                if (/国配/.test(text)) {
                    is_c_dub = true;
                }
                if (/原生/.test(text)) {
                    is_bd = true;
                }
                if (/cc/.test(text)) {
                    is_cc = true;
                }
                if (/动画/.test(text)) {
                    is_anime = true;
                }
                if (/活动/.test(text)) {
                    is_contest = true;
                }
            }
            if (td.text().trim() === '附加信息') {
                torrent_extra = $('.extra-text').html();
            }
            if (td.text() === '字幕') {
                var lastChild = td.parent().children().last();
                var img = lastChild.find('div img[title="简体中文"]');
                // 查找 lastChild 内的第一个超链接并获取其文本内容
                var firstLinkText = lastChild.find('a:first').text();
                // 检查文本内容是否包含"chs"或"cht"
                let sub = firstLinkText.includes('chs') || firstLinkText.includes('cht');
                if (img.length > 0 || sub || /字\s*幕(.|\n)*?Chinese/i.test(mediainfo_s) || /字\s*幕(.|\n)*?Mandarin/i.test(mediainfo_s) || /Subtitle:\s*?Chinese/i.test(mediainfo_s)|| /字\s*幕(.|\n)*?简体中文/i.test(mediainfo_s)) {
                    sub_chinese = true;
                } else {
                    sub_chinese = false;
                }
            }
            if (td.text().trim().startsWith('豆瓣')) {
                douban_raw = td.parent().children().last();
            }
        }


        // 豆瓣
        $('td.douban_info .title .name a').each(function (index, element) {
            if ($(element).attr('href').indexOf('douban') >= 0) {
                douban = $(element).attr('title');
            }
            if ($(element).attr('href').indexOf('imdb') >= 0) {
                imdb = $(element).attr('title');
            }
        });
        // 中文音轨识别
        console.log(mediainfo_s)
        if ((/音\s频:(?:(?!字\s幕).|\n)*?(?:chinese|mandarin)/i.test(mediainfo_s) && type !== 1) || (/Audio:\s?(?:Chinese|Mandarin)/i.test(mediainfo_s) && type === 1)) {
            audio_chinese = true;
        }
        var screenshot = '';
        var pngCount = 0;
        $('.screenshots-container img').each(function (index, element) {
            var src = $(element).attr('src');
            if (src !== undefined) {
                if (index !== 0) {
                    screenshot += '\n';
                }
                screenshot += src.trim();
            }
            if (src.indexOf('.png') >= 0) {
                pngCount++;
            }
        });


        //==============================
        let error = false;
        if (/\s+/.test(title)) {
            $('#assistant-tooltips').append('主标题包含空格<br/>');
            error = true;
        }
        if (/[\u4e00-\u9fa5\uff01-\uff60]+/.test(title)) {
            $('#assistant-tooltips').append('主标题包含中文或中文字符<br/>');
            error = true;
        }
        if(/(-|@)(CTRLHD)/.test(title_lowercase)){
            $('#assistant-tooltips').append('主标题包含禁发小组，请检查<br/>');
            error = true;
        }
        if(/(-|@)(FGT|NSBC|BATWEB|GPTHD|DreamHD|BlackTV|CatWEB|Xiaomi|Huawei|MOMOWEB|DDHDTV|SeeWeb|TagWeb|SonyHD|MiniHD|BitsTV|ALT|NukeHD|ZeroTV|HotTV|EntTV|GameHD|SmY|SeeHD|VeryPSP|DWR|XLMV|XJCTV|Mp4Ba|GodDramas|FRDS|BeiTai|Ying|VCB-Studio|toothless)/i.test(title_lowercase)){
            $('#assistant-tooltips').append('主标题包含禁发小组，请检查<br/>');
            error = true;
        }
        if(/-(.*?@)?(Eleph|HDH|HDS(?!TV)|HDHome|HDSky|HDSWEB|Dream(?!Ru)|DYZ-Movie)/i.test(title_lowercase)){
            $('#assistant-tooltips').append('主标题包含不受信小组，请检查<br/>');
            error = true;
        }
        if (!subtitle) {
            $('#assistant-tooltips').append('副标题为空<br/>');
            error = true;
        }
        if (/[【】]/.test(subtitle)) {
            $('#assistant-tooltips').append('副标题包含【】，请修改为 []<br/>');
            error = true;
        }
        if (!cat) {
            $('#assistant-tooltips').append('未选择分类<br/>');
            error = true;
        }
        if (!type) {
            $('#assistant-tooltips').append('未选择格式<br/>');
            error = true;
        } else {
            if (title_type && title_type !== type) {
                $('#assistant-tooltips').append("标题检测格式为" + type_constant[title_type] + "，选择格式为" + type_constant[type] + '<br/>');
                error = true;
            }
        }
        if (!encode) {
            $('#assistant-tooltips').append('未选择主视频编码<br/>');
            error = true;
        } else {
            if (title_encode && title_encode !== encode) {
                $('#assistant-tooltips').append("标题检测视频编码为" + encode_constant[title_encode] + "，选择视频编码为" + encode_constant[encode] + '<br/>');
                error = true;
            } else if (encode === 99 && group !== 8) {
                $('#assistant-tooltips').append('视频编码选择为 other，请人工检查<br/>');
                error = true;
            }
        }
        if (!audio) {
            $('#assistant-tooltips').append('未选择主音频编码<br/>');
            error = true;
        } else {
            if (title_audio && title_audio !== audio) {
                $('#assistant-tooltips').append("标题检测音频编码为" + audio_constant[title_audio] + "，选择音频编码为" + audio_constant[audio] + '<br/>');
                error = true;
            } else if (audio === 99) {
                $('#assistant-tooltips').append('音频编码选择为 other，请人工检查<br/>');
                error = true;
            }
        }
        if (!resolution && title_group !== 8) {
            $('#assistant-tooltips').append('未选择分辨率<br/>');
            error = true;
        } else {
            if (title_resolution && title_resolution !== resolution) {
                $('#assistant-tooltips').append("标题检测分辨率为" + resolution_constant[title_resolution] + "，选择分辨率为" + resolution_constant[resolution] + '<br/>');
                error = true;
            }
        }
        if (/tu\.totheglory\.im/.test(poster)) {
            $('#assistant-tooltips').append('海报使用防盗链图床，请更换或留空<br/>');
            error = true;
        }
        if (/論壇|论坛|公众号|微信/i.test(mediainfo_title)){
            $('#assistant-tooltips').append('请检查「MediaInfo」内信息是否含有广告，请确认资源来源是否可信<br/>');
            error = true;
        }
        if (!area && title_group !== 8) {
            $('#assistant-tooltips').append('未选择地区<br/>');
            error = true;
        }
        if (type === 1 && $('.mediainfo-short .codetop').text() === 'MediaInfo') {
            $('#assistant-tooltips').append('Blu-ray 媒体信息请使用 BDInfo<br/>');
            error = true;
        }
        if (!douban && !imdb && title_group !== 8) {
            $('#assistant-tooltips').append('未检测到豆瓣或 IMDb 链接<br/>');
            error = true;
        }
        if (!douban && imdb) {
            $('#assistant-tooltips').append('未优先使用豆瓣链接<br/>');
            error = true;
        }
        if ($('#peercount > b:first').text() === '0个做种者') {
            $('#assistant-tooltips').append('请先做种，再等待审核<br/>');
            error = true;
        }
        if ((type === 6 || type === 4 || type === 7 || type === 8 || type === 9 || type === 10) && $('.mediainfo-short .codemain').text().replace(/\s+/g, '') === $('.mediainfo-raw .codemain').text().replace(/\s+/g, '')) {
            $('#assistant-tooltips').append('媒体信息未解析<br/>');
            error = true;
        }
        // 标签
        console.log(title_is_complete)
        if (type !== 1 && is_bd){
            $('#assistant-tooltips').append('非原盘请勿选择「原生」标签<br/>');
            error = true;
        }
        if ((title_is_complete || /[集期]全|全\s*?[\d一二三四五六七八九十百千]*\s*?[集期]|合集/i.test(subtitle)) && !is_complete) {
            $('#assistant-tooltips').append('未选择「合集」标签<br/>');
            error = true;
        }
        if (sub_chinese && !is_chinese) {
            $('#assistant-tooltips').append('未选择「中字」标签<br/>');
            error = true;
        }
        if (/^(?!Encoding).*Dolby Vision/im.test(mediainfo_title) && !is_dovi) {
            $('#assistant-tooltips').append('未选择「DoVi」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*Dolby Vision/im.test(mediainfo_title) && is_dovi) {
            $('#assistant-tooltips').append('选择「DoVi」标签，未识别到「DoVi」<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HDR10\+/im.test(mediainfo_title) && !is_hdr10p) {
            $('#assistant-tooltips').append('未选择「HDR10+」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HDR10\+/im.test(mediainfo_title) && is_hdr10p) {
            $('#assistant-tooltips').append('选择「HDR10+」标签，未识别到「HDR10+」<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HDR10/im.test(mediainfo_title) && !/^(?!Encode).*HDR10\+/im.test(mediainfo_title) && !is_hdr10) {
            $('#assistant-tooltips').append('未选择「HDR10」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HDR10/im.test(mediainfo_title) && is_hdr10) {
            $('#assistant-tooltips').append('选择「HDR10」标签，未识别到「HDR10」<br/>');
            error = true;
        }
        if (is_hdr10 && is_hdr10p) {
            $('#assistant-tooltips').append('请勿同时选择「HDR10」与「HDR10+」标签<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HLG/im.test(mediainfo_title) && !is_hlg) {
            $('#assistant-tooltips').append('未选择「HLG」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HLG/im.test(mediainfo_title) && is_hlg) {
            $('#assistant-tooltips').append('选择「HLG」标签，未识别到「HLG」<br/>');
            error = true;
        }
        if (/^(?!Encoding).*HDR Vivid/im.test(mediainfo_title) && !is_hdr_vivid) {
            $('#assistant-tooltips').append('未选择「菁彩 HDR」标签<br/>');
            error = true;
        }
        if (!/^(?!Encoding).*HDR Vivid/im.test(mediainfo_title) && is_hdr_vivid) {
            $('#assistant-tooltips').append('选择「菁彩 HDR」标签，未识别到「菁彩 HDR」<br/>');
            error = true;
        }
        if (is_contest && !is_chinese) {
            $('#assistant-tooltips').append('选择「活动」标签，未识别到「中字」<br/>');
            error = true;
        }
        if (is_contest && type !== 7 ) {
            $('#assistant-tooltips').append('选择「活动」标签，未识别到「WEB-DL」<br/>');
            error = true;
        }
        console.log("标签判断完成")
        if ((/◎/i.test(torrent_extra)) && !$('span[title="制作组"]').length > 0) {
            $('#assistant-tooltips').append('请移除附加信息中除致谢、制作信息以外的内容。<br/>');
            error = true;
        }
        if (mediainfo_s.length < 30) {
            error = true;
            if (type === 1 || type === 3) {
                $('#assistant-tooltips').append('媒体信息格式错误，请使用「BDInfo」重新获取完整的英文信息<br/>');
            } else {
                $('#assistant-tooltips').append('媒体信息格式错误，请使用「Mediainfo」重新获取完整的英文信息<br/>');
            }
        }

        if (title_group && !group) {
            $('#assistant-tooltips').append('未选择制作组' + group_constant[title_group] + '<br/>');
            error = true;
        }

        if (pngCount < 3 && (title_group === 1 || !title_group) && !(type === 7 && resolution === 1 && (is_hdr10 || is_hdr10p || is_hdr_vivid || is_dovi))) {
            $('#assistant-tooltips').append('PNG 格式的图片未满 3 张<br/>');
            error = true;
        }

        const pichost_list = [
            'cmct.xyz',
            "static.ssdforum.org",
            'static.hdcmct.org',
            'gifyu.com',
            'imgbox.com',
            'pixhost.to',
            'ptpimg.me',
            'ssdforum.org'
        ];
        const shot = document.querySelector('section.screenshots-container');
        let shot_imgs;
        if (shot) {
            shot_imgs = Array.from(shot.querySelectorAll('img')).map(el => el.src);
        }else{
            $('#assistant-tooltips').append('无图片信息<br/>');
        }
        $(document).ready(function () {
            let wrongPicList = [];
            if (shot_imgs && shot_imgs.length) {
                shot_imgs.forEach(imgSrc => {
                    let valid = pichost_list.some(site => imgSrc.includes(site));
                    if (!valid) {
                        wrongPicList.push(imgSrc);
                    }
                });
                if (wrongPicList.length) {
                    $('#assistant-tooltips').append('请使用规则白名单内的图床<br/>');
                    error = true;
                }
            }
        });


        // =================================
        // 种审用（检测较为激进，需配合人工判断）
        // =================================
        if (isEditor) {

            $('#editor-tooltips').append('↓以下检测较为激进，需配合人工判断↓<br/>');
            if (!douban  && title_group !== 8 && area == 99) {
                $('#editor-tooltips').append('地区为 Other 且无豆瓣链接，请人工核对<br/>');
            }
            if (/第\s*?[\d一二三四五六七八九十百千]*(?:-\d+)?\s*?[集期]/i.test(subtitle) && !is_complete && (cat === 502 || cat === 503 || cat === 505) && (type === 5 || type ===7)) {
                $('#editor-tooltips').append('中性：识别到单集，无需审核<br/>');
            }
            if (!is_chinese && cat !== 501 && type === 7) {
                $('#editor-tooltips').append('中性：除电影外，无「中字」的 WEB 资源<br/>');
            }
            if (!is_chinese && type === 4) {
                $('#editor-tooltips').append('中性：无「中字」的 Remux 资源<br/>');
            }
            if (!is_chinese && cat === 502 && type === 1) {
                $('#editor-tooltips').append('中性：无「中字」的 Blu-Ray 剧集<br/>');
            }
            if (/(https?:\/\/)([\w\-]+(\.[\w\-]+)+)(:\d+)?(\/[^\s]*)?/i.test(mediainfo_title)){
                $('#editor-tooltips').append('检测到「Mediainfo」含有网址，请检查<br/>');
            }
            if (/^\s*(概览|概要)/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('检测到「中文Mediainfo」，请重新扫描<br/>');
            }
            if ((/\.(hdr|hdr10)\./i.test(title_lowercase) || /BT\.2020/i.test(mediainfo_title)) && !/ST\s2086|ST\s2094|HDR\sVivid/i.test(mediainfo_title) && !/Transfer\scharacteristics\s*:\sHLG/i.test(mediainfo_title) && $('.mediainfo-short .codetop').text() === 'MediaInfo') {
                $('#editor-tooltips').append('主标题检测到HDR，未识别到「HDR」相关元数据，请重新扫描 Mediainfo<br/>');
            }
            if (/\.(Criterion|CC)\./i.test(title_lowercase) || /CC标准收藏版|CC收藏版|CC版|CC(?!TV)/i.test(subtitle) && !is_cc) {
                $('#editor-tooltips').append('主副标题识别到「CC」相关字符，请检查是否有「CC」标签<br/>');
            }
            if (/版原盘/i.test(subtitle) && !is_bd) {
                $('#editor-tooltips').append('副标题识别到「原盘」相关字符，请检查是否有「原生」标签<br/>');
            }
            if (!audio_chinese && is_c_dub) {
                $('#editor-tooltips').append('未包含有普通话配音的影片，禁止使用「国配」标签<br/>');
            }
            if (/SUBtitleS:/.test(mediainfo_title)) {
                $('#editor-tooltips').append('识别到「SUBtitleS:」相关字符，请检查BDInfo<br/>');
            }
            if ((mediainfo_title.match(/(?<!\S)[ ]{2,}(?!\S)/g) || []).length < 30 && type != 1) {
                $('#editor-tooltips').append('识别到「mediainfo」空格字符过少，请检查排版是否正确<br/>');
            }
            if (/HDR\sformat.*dvhe\.05/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('DUPE参考：Dolby Vision P5（不含 HDR10 数据）<br/>');
            }
            if (type === 1 && /\.HK\./i.test(title_lowercase)){
                $('#editor-tooltips').append('检测到区号为「HK」，港版原盘应使用「HKG」<br/>');
            }
            if (/HDR\sformat.*dvhe\.08/i.test(mediainfo_title) || /HDR\sformat.*dvhe\.07/i.test(mediainfo_title)) {
                $('#editor-tooltips').append('DUPE参考：Dolby Vision P7 or P8（含 HDR10 数据）<br/>');
            }
            if (!sub_chinese && is_chinese) {
                $('#editor-tooltips').append('选择「中字」标签，未识别到中文字幕，请检查，如果为硬字幕，请补充至少一张带中字的截图；如果为外挂字幕，请上传外挂字幕<br/>');
            }
            if (/(FLUX|HHWEB|HHCLUB|DIY|海外).*字幕|(字幕|后缀|取自).*(FLUX|HHWEB|HHCLUB|海外)/i.test(torrent_extra) && type === 7) {
                $('#editor-tooltips').append('添加字幕后修改原视频后缀的「WEB-DL」资源，此类资源应保留原组名后缀<br/>');
            }
            if (/Progressive/i.test(mediainfo_title) && resolution === 3) {
                $('#editor-tooltips').append('扫描方式为 Progressive，分辨率为 1080i<br/>');
            }
            if(/Size: 0/i.test(mediainfo_s) && type === 1){
                $('#editor-tooltips').append('BDINFO：Size: 0，请人工检查<br/>');
            }
            if ((/\.DVDRip/i.test(title_lowercase) || type === 10) && resolution !== 5){
                $('#editor-tooltips').append('DVDRip 非 SD 分辨率，请检查是否为超分辨率<br/>');
            }
            if (/\.ma\./i.test(title_lowercase) && type === 7){
                $('#editor-tooltips').append('单独槽位：Movies Anywhere<br/>');
            }
            if (/\.nf\./i.test(title_lowercase) && type === 7 && resolution === 1){
                $('#editor-tooltips').append('单独槽位：Netflix 2160P<br/>');
            }
            if (/\.(Peacock|max|dsnp|nf|iTunes|atvp|amzn)\./i.test(title_lowercase) && type === 7 && resolution === 1 && !(is_hdr10p || is_hdr10 || is_dovi)){
                $('#editor-tooltips').append('标题检测：2160P SDR优质源<br/>');
            }
            if (/\.(max|dsnp|nf|Peacock|iTunes|atvp|Paramount|Paramount+|Hulu|Stan)\./i.test(title_lowercase) && type === 7 && resolution === 1 && (is_hdr10p || is_hdr10)){
                $('#editor-tooltips').append('标题检测：2160P HDR优质源<br/>');
            }
            if (/\.(amzn|max|dsnp|nf|iTunes|atvp|Paramount|Paramount+)\./i.test(title_lowercase) && type === 7 && resolution === 1 && is_dovi){
                $('#editor-tooltips').append('标题检测：2160P DV优质源<br/>');
            }
            if (/\.(dsnp|amzn|ma|cr|max|nf)\./i.test(title_lowercase) && type === 7 && resolution === 2 ){
                $('#editor-tooltips').append('标题检测：1080P 优质源<br/>');
            }
            if ((/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.test(torrent_extra))) {
                $('#editor-tooltips').append('请移除附加信息中的网址。<br/>');
            }
            //允许发布的版本
            if (type === 6||type === 8||type === 10) {
                if (resolution===1 && encode !==1){
                    $('#editor-tooltips').append('分辨率为2160P，只接受x265编码版本<br/>');
                }
                if (resolution === 2 && (is_dovi||is_hdr10||is_hdr10p||is_hlg||is_hdr_vivid) && encode !==1){
                    $('#editor-tooltips').append('分辨率为1080P 且带HDR，只接受x265编码版本<br/>');
                }
                if (!is_anime && resolution === 2 && !(is_dovi||is_hdr10||is_hdr10p||is_hlg||is_hdr_vivid) && encode !==2){
                    $('#editor-tooltips').append('分辨率为1080P且为SDR，只接受X264编码版本<br/>');
                }
                if (!is_anime && ((/x264/i.test(title_lowercase) && /10bit/i.test(title_lowercase)) || (/Bit\s+depth\s*:\s*10\s+bits/i.test(mediainfo_title) && /Writing\s+library\s*:\s*x264/i.test(mediainfo_title)))) {
                    $('#editor-tooltips').append('禁止发布：x264 10bit 硬件兼容性较差<br/>');
                }
            }
            if (is_anime === true && cat === 502 && is_bd){
                $('#editor-tooltips').append('禁止发布：分集形式 TV / OVA 番剧的原盘(不论单集还是合集)，仅允许剧场版/电影的原盘<br/>');
            }
            if (
                (/^(?:Format).*?(DTS-HD|TrueHD|DTS:X|LPCM|Format\s+:\s+PCM\s+Format settings\s+:\s+Little\s+\/\s+Signed)/im.test(
                    mediainfo_title
                ) ||
                 audio === 1 ||
                 audio === 2 ||
                 audio === 6) &&
                (resolution === 2 ||
                 resolution === 3 ||
                 resolution === 4 ||
                 resolution === 5) &&
                (type === 6 || type === 8 || type === 9 || type === 10)
            ) {
                $("#editor-tooltips").append("可替代：音频臃肿<br/>");
            }
            //          if (!sub_chinese && !is_bd) {
            //              $('#editor-tooltips').append('可替代：无中字或硬字幕<br/>');
            //          }
            //压制
            if (/(hds|hdh|Dream)$/i.test(title_lowercase) && [6, 8, 9, 10].includes(type)) {
                $('#editor-tooltips').append('可替代：不受信小组<br/>');
            }
            //DIY
            if (/(hdhome)$/i.test(title_lowercase) && [1].includes(type)) {
                $('#editor-tooltips').append('可替代：不受信小组<br/>');
            }
            //REMUX
            if (/(HDH|Dream)$/i.test(title_lowercase) && [4].includes(type)) {
                $('#editor-tooltips').append('可替代：不受信小组<br/>');
            }
            //WEB
            if (/(HDHWEB)$/i.test(title_lowercase) && [1].includes(type)) {
                $('#editor-tooltips').append('可替代：不受信小组<br/>');
            }
            if (/(BHDStudio)$/i.test(title_lowercase) && [1].includes(type)) {
                $('#editor-tooltips').append('可替代：质量较差的视频<br/>');
            }
        }

        //豆瓣判断
        // 函数：获取对应豆瓣内容
        function findDouban(searchText) {
            var result = null; // 存储找到的结果

            // 遍历所有的.peer元素
            douban_raw.find('.peer').each(function () {
                // 获取当前.peer元素中的.text-title和.text-content
                var textTitle = $(this).find('.text-title').text().trim();
                var textContent = $(this).find('.text-content').text().trim(); // 使用.html()以保留内部HTML结构，如链接

                // 检查.text-title是否包含搜索的文本
                if (textTitle.includes(searchText)) {
                    result = textContent;
                    return false; // 找到匹配后退出循环
                }
            });

            return result; // 返回结果，如果没有找到匹配项，则为null
        }


        // 豆瓣判断
        var douban_area = [], douban_cat;
        var isshow, isdoc, isani;

        if (douban) {

            var douban_genres = findDouban('◎类　　别')
            if (douban_genres.includes('真人秀')) {
                isshow = 1;
            }
            if (douban_genres.includes('纪录片')) {
                isdoc = 1;
            }
            if (douban_genres.includes('动画')) {
                isani = true;
            }
            var douban_type = findDouban('◎类　　型').split(" / ")[0];
            var country = findDouban('◎产　　地').split(" / ");
            var language = findDouban('◎语　　言');

            const areaMappings = [
                { areas: ['中国', '中国大陆'], value: 1 },
                { areas: ['香港', '中国香港'], value: 2 },
                { areas: ['台湾', '中国台湾'], value: 3 },
                { areas: ['印度'], value: 7 },
                { areas: ['日本'], value: 5 },
                { areas: ['韩国'], value: 6 },
                { areas: ['泰国'], value: 9 },
                { areas: ['阿尔巴尼亚', '爱尔兰', '爱沙尼亚', '安道尔', '奥地利', '白俄罗斯', '保加利亚',
                          '北马其顿', '比利时', '冰岛', '波黑', '波兰', '丹麦', '德国', '法国',
                          '梵蒂冈', '芬兰', '荷兰', '黑山', '捷克', '克罗地亚', '拉脱维亚', '立陶宛',
                          '列支敦士登', '卢森堡', '罗马尼亚', '马耳他', '摩尔多瓦', '摩纳哥', '挪威',
                          '葡萄牙', '瑞典', '瑞士', '塞尔维亚', '塞浦路斯', '圣马力诺', '斯洛伐克',
                          '斯洛文尼亚', '乌克兰', '西班牙', '希腊', '匈牙利', '意大利', '英国',
                          '安提瓜和巴布达', '巴巴多斯', '巴哈马', '巴拿马', '伯利兹', '多米尼加', '多米尼克',
                          '格林纳达', '哥斯达黎加', '古巴', '海地', '洪都拉斯', '加拿大', '美国', '墨西哥',
                          '尼加拉瓜', '萨尔瓦多', '圣基茨和尼维斯', '圣卢西亚', '圣文森特和格林纳丁斯',
                          '特立尼达和多巴哥', '危地马拉', '牙买加', '阿根廷', '巴拉圭', '巴西', '秘鲁',
                          '玻利维亚', '厄瓜多尔', '哥伦比亚', '圭亚那', '苏里南', '委内瑞拉', '乌拉圭',
                          '智利', '捷克斯洛伐克','澳大利亚','西德','新西兰'], value: 4 },
                { areas: ['苏联', '俄罗斯'], value: 8 }
            ];
            // 遍历映射表并检查 country 是否包含任何指定地区
            areaMappings.forEach(mapping => {
                if (mapping.areas.some(element => country.includes(element))) {
                    douban_area.push(mapping.value);
                }
            });

            // 如果 douban_area 为空，则添加 99
            if (douban_area.length === 0) {
                douban_area.push(99);
            }

            if (douban_type === '电视剧') {
                if (isshow) {
                    douban_cat = 505;
                } else if (isdoc) {
                    douban_cat = 503;
                } else {
                    douban_cat = 502;
                }
            } else {
                if (isdoc) {
                    douban_cat = 503;
                } else {
                    douban_cat = 501;
                }
            }
            if (language && is_c_dub && language.includes("普通话")) {
                $('#assistant-tooltips').append('原始语言为普通话的资源，不可使用「国配」标签<br/>');
                error = true;
            }
            if (language && audio_chinese && !is_c_dub && !language.includes("普通话")) {
                $('#editor-tooltips').append('外语片或粤语片包含有普通话配音，需使用「国配」标签<br/>');
            }
            if (cat && douban_cat && douban_cat >= 501 && douban_cat <= 505 && douban_cat !== cat) {
                $('#assistant-tooltips').append("豆瓣检测分类为" + cat_constant[douban_cat] + "，选择分类为" + cat_constant[cat] + '<br/>');
                error = true;
            }
            if (area && douban_area && !douban_area.includes(area)) {
                $('#assistant-tooltips').append("豆瓣检测地区为" + area_constant[douban_area[0]] + "，选择地区为" + area_constant[area] + '<br/>');
                error = true;
            }
            if (isani && !is_anime) {
                $('#assistant-tooltips').append('豆瓣检测「动画」类别，未选择「动画」标签<br/>');
                error = true;
            }
            if(findDouban('◎上映日期') == ''){
                $('#editor-tooltips').append('豆瓣未检测到年份，请检查<br/>');
            }else if(title_lowercase.match(/\.(18[8-9][0-9]|19[0-9]{2}|200[0-9]|201[0-9]|202[0-9]|2030)\./) && findDouban('◎上映日期').match(/^(\d{4})/)[1] != title_lowercase.match(/\.(18[8-9][0-9]|19[0-9]{2}|200[0-9]|201[0-9]|202[0-9]|2030)\./)[1]){
                $('#editor-tooltips').append('豆瓣与标题年份不匹配，请检查<br/>');
            }

            if (!isani && is_anime) {
                $('#assistant-tooltips').append('选择「动画」标签，豆瓣未识别到「动画」类别<br/>');
                error = true;
            }
            //显示结果
            if (error) {
                $('#assistant-tooltips').css('background', 'red');
            } else {
                $('#assistant-tooltips').append('此种子未检测到异常');
                $('#assistant-tooltips').css('background', 'green');
            }
        }

    }

    // ---------------------------------------------------
    // 只有种审需要下面的功能捏
    // ---------------------------------------------------
    if (isEditor) {
        // ===========================================
        // 3. << 鼠标停在加载完成的图片上显示大小和类型 >>
        // 对种子详情的图片信息进行审核
        // ===========================================
        if (window.location.href.includes("/details.php")) {
            // 1. 初始化 editor-tooltips DOM
            $('#editor-tooltips').append(`图片检查中<br>`);
            var imgNum;
            if (!authorText.replace(/\s+/g, '')) {
                imgNum = 1;
            } else {
                imgNum = 2;
            }


            var resolutionRegex = /分辨率:\s*(\d+)\s*x\s*(\d+)/;
            var match = mediainfo_s.match(resolutionRegex);
            var cWidth, cHeight;

            if (match) {
                cWidth = parseInt(match[1], 10);
                cHeight = parseInt(match[2], 10);
            } else if ($('.mediainfo-short .codetop').text() === 'MediaInfo') {
                $('#editor-tooltips').append("未找到 Mediainfo 分辨率信息<br>");
            }
            if (/Original height/i.test(mediainfo_title)){
                $('#editor-tooltips').append('检测到Original height，请人工辅助判断<br>');
            }
            // one time trigger
            var error_img = false;

            // 3. 对截图区域的图片进行悬浮显示信息
            const images = document.querySelectorAll('section[data-group="screenshots"] img[loading="lazy"][alt="screenshot image"], section[data-group="screenshots"] img[loading="lazy"][alt="image"]');
            let completedImages = 0; // 已完成检查的图片数量

            images.forEach((img, index) => {
                const imgExtension = img.src.split('.').pop().split(/\#|\?/)[0].toLowerCase(); // 获取文件扩展名并转换为小写

                // 3.1 对 .gif 特殊处理
                if (imgExtension === 'gif') {
                    console.log(`跳过 GIF 图片：${img.src}`);
                    completedImages++; // 增加已完成检查的图片数量，以便正确处理完成状态
                    if (completedImages === images.length) {
                        // $('#editor-tooltips').html($('#editor-tooltips').html().replace('图片检查中<br>', ''));
                        $('#editor-tooltips').html($('#editor-tooltips').html().replace('图片检查中<br>', ''));
                        console.log("gif 图片检查完成");
                    }
                    return; // 跳过此 GIF 图片
                }

                fetchImageDetails(img, (details) => {
                    displayImageDetails(img, details);
                    if (index >= imgNum - 1) {
                        checkImageResolution(details, $('span[title="分辨率"]').text(), index + 1);
                    }
                    completedImages++;
                    if (completedImages === images.length) {
                        // $('#editor-tooltips').html($('#editor-tooltips').html().replace('图片检查中<br>', ''));
                        $('#editor-tooltips').html($('#editor-tooltips').html().replace('图片检查中<br>', ''));
                        console.log("图片检查完成");
                    }
                });
            });

            function fetchImageDetails(img, callback) {

                if (img.src.includes('ptpimg.me')) {
                    // 对 ptpimg.me 使用 Blob
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: img.src,
                        responseType: 'blob',
                        onload: function (response) {
                            const blob = response.response;
                            const image = new Image();
                            image.onload = function () {
                                const details = {
                                    fileSize: `${(blob.size / 1024).toFixed(2)} KB`,
                                    resolution: `${this.width} x ${this.height}`,
                                    fileType: img.src.split('.').pop().split(/\#|\?/)[0]
                                };
                                callback(details);
                            };
                            image.src = URL.createObjectURL(blob);
                        }
                    });
                } else {
                    // 对其他域名使用 HEAD
                    GM_xmlhttpRequest({
                        method: "HEAD",
                        url: img.src,
                        onload: function (response) {
                            const size = response.responseHeaders.match(/Content-Length:\s?(\d+)/i);
                            const fileSize = size ? `${(size[1] / 1024).toFixed(2)} KB` : "未知大小";
                            const image = new Image();
                            image.onload = function () {
                                // const resolution = `${this.width} x ${this.height}`;
                                // infoBox.textContent = `大小：${fileSize}, 分辨率：${resolution}, 类型：${fileExtension}`;
                                const details = {
                                    fileSize,
                                    resolution: `${this.width} x ${this.height}`,
                                    fileType: img.src.split('.').pop().split(/\#|\?/)[0]
                                };
                                callback(details);
                            };
                            image.src = img.src;
                        }
                    });
                }
            }

            function checkImageResolution(details, expectedResolution, imgNum) {
                const {width, height} = parseResolution(details.resolution);
                let pswitch;
                if (!/Blu-ray/i.test(typeText)) {
                    if (height !== cHeight || width !== cWidth) {
                        if (!error_img) {
                            const isDVDType = type === 10 || type === 3 || (type === 4 && /dvd/i.test(title_lowercase));
                            if (isDVDType) {
                                const message = `DVD请人工确认截图分辨率，Mediainfo 高度为${cHeight} 宽度为${cWidth}<br>` +
                                      `可能的正确截图宽度为 高度大于480时：${Math.floor(cWidth / 45 * 64)} 或 ${Math.floor(cWidth / 15 * 16)} ` +
                                      `高度小等于480时：${Math.floor(cWidth / 9 * 8)} 或 ${Math.floor(cWidth / 27 * 32)}<br>`;
                                $('#editor-tooltips').append(message);
                                error_img = true;
                            } else {
                                const resolutionMessage = `第${imgNum}张图片，Mediainfo 分辨率${cWidth}x${cHeight}：截图分辨率${width}x${height}<br>`;
                                $('#editor-tooltips').append(resolutionMessage);
                                pswitch = true;
                            }
                        }
                    }
                }

                // 判断体积
                let size = parseFloat(details.fileSize.match(/[\d\.]+/)[0]);
                if ((is_dovi || is_hlg || is_hdr_vivid || is_hdr10p || is_hdr10) && size < 1800){
                    $('#editor-tooltips').append(`HDR影片，第${imgNum}张图片，截图体积低于1800KB：体积为${details.fileSize}<br>`);
                }else if (resolution === 1 && size < 1800){
                    $('#editor-tooltips').append(`2160p影片，第${imgNum}张图片，截图体积低于1800KB：体积为${details.fileSize}<br>`);
                }else if ((resolution === 2 || resolution === 3) && size < 1000){
                    $('#editor-tooltips').append(`1080p影片，第${imgNum}张图片，截图体积低于1000KB：体积为${details.fileSize}<br>`);
                }

                // 根据预期分辨率来检查实际图片分辨率
                if (!pswitch && !error_img && type !== 10) {
                    switch (expectedResolution) {
                        case '2160p':
                            if ((height < 2120 || height > 2160) && (width < 3800 || width > 3840)) {
                                $('#editor-tooltips').append(`第${imgNum}张图片，截图分辨率不符合 2160p 标准：实际高度为${height} 宽度${width}<br>`);
                                error_img = true;
                            }
                            break;
                        case '1080p':
                        case '1080i':
                            if ((height < 1040 || height > 1080) && (width < 1880 || width > 1920)) {
                                $('#editor-tooltips').append(`第${imgNum}张图片，截图分辨率不符合 1080p/1080i 标准：实际高度为${height} 宽度${width}<br>`);
                                error_img = true;
                            }
                            break;
                        case '720p':
                            if ((height < 680 || height > 720) && (width !== 1280)) {
                                $('#editor-tooltips').append(`第${imgNum}张图片，截图分辨率不符合 720p 标准：实际高度为${height} 宽度${width}<br>`);
                                error_img = true;
                            }
                            break;
                        default:
                            $('#editor-tooltips').append(`第${imgNum}张图片，未定义对分辨率${expectedResolution}的检查规则<br>`);
                            error_img = true;
                    }
                }
            }


            function displayImageDetails(img, details) {
                const infoBox = document.createElement('div');
                infoBox.style.position = 'absolute';
                infoBox.style.padding = '5px';
                infoBox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                infoBox.style.color = 'white';
                infoBox.style.fontSize = '12px';
                infoBox.style.visibility = 'hidden';
                infoBox.style.zIndex = '1000';
                document.body.appendChild(infoBox);

                infoBox.textContent = `大小：${details.fileSize}, 分辨率：${details.resolution}, 类型：${details.fileType}`;
                img.addEventListener('mouseover', () => {
                    updatePosition(img, infoBox);
                    infoBox.style.visibility = 'visible';
                });
                img.addEventListener('mouseout', () => {
                    infoBox.style.visibility = 'hidden';
                });
            }

            function updatePosition(img, infoBox) {
                const rect = img.getBoundingClientRect();
                infoBox.style.top = `${window.scrollY + rect.top - infoBox.offsetHeight - 5}px`;
                infoBox.style.left = `${window.scrollX + rect.left + (rect.width - infoBox.offsetWidth) / 2}px`;
            }

            function parseResolution(resolution) {
                const [width, height] = resolution.split(' x ').map(Number);
                return {width, height};
            }
        }
        // ===========================================
        // 调用函数，移动包含特定文本“相关资源”的tr到表格顶端
        // ===========================================
        function updateRowAndToggleImage(searchText) {
            // 获取页面中所有的tr元素
            const trElements = document.querySelectorAll('tr');

            // 遍历所有tr元素
            trElements.forEach(tr => {
                // 在当前tr中查找所有td元素
                const tdElements = tr.querySelectorAll('td.rowhead.nowrap');


                // 遍历这些td元素
                tdElements.forEach(td => {
                    // 检查td元素的文本内容是否为searchText（传入的参数）
                    if (td.textContent.trim() === searchText) {

                        // 获取这个tr的父表格
                        const table = tr.closest('table');
                        if (table) {
                            // 将这个tr移动到表格的最顶端
                            table.insertBefore(tr, table.firstChild);
                        }

                    }

                });
            });
        }

        if (window.location.href.includes("/details.php?")) {
            updateRowAndToggleImage("相关资源");
        }
    }


    // ===========================================
    // 2. << 添加隐藏已审按钮和 torrents.php 页面下的功能 >>
    // ===========================================
    // 添加隐藏已审按钮和 torrents.php 页面下的功能
    function enhanceTorrentsPage() {

        let buttonTop = 10; // 初始按钮位置
        const buttonSpacing = 30; // 按钮间隔

        // 按钮配置
        const buttons = [
            {text: '隐藏已审', action: hideReviewed},
            {text: '隐藏老种', action: hideOld},
            {text: '显示所有', action: () => jQuery('table.torrents tr').show()},
            {text: '隐藏匹配项', action: () => toggleVisibility(true)},
            {text: '隐藏非匹配项', action: () => toggleVisibility(false)},
            {text: '选中复选框', action: () => jQuery('table.torrents input[type="checkbox"]:visible').prop('checked', true)},
            {text: window.location.search.includes('neutral=1') ? '隐藏中性' : '显示中性', action: () => toggleParam('neutral')},
            {text: window.location.search.includes('trumpable=1') ? '隐藏可替代' : '显示可替代', action: () => toggleParam('trumpable')}
        ];

        // 创建按钮和输入框
        buttons.forEach(btn => createButton(btn.text, btn.action));
        const mainInput = createInput('匹配标题', 'savedMainRegex');
        const subtitleInput = createInput('匹配副标题', 'savedSubtitleRegex');

        function changeFrozenRowsStyle() {
            // 更改包含冻结图标的行的样式
            jQuery('span.bi.bi-info.torrent-icon[title="冻结"]').each(function () {
                const row = jQuery(this).closest('tr');
                row.find('div.torrent-title a').css('color', 'blue');
            });

            // 查找所有 <a href="?cat=502"> 或 <a href="?cat=503"> 或 <a href="?cat=505"> 链接
            jQuery('a[href="?cat=502"], a[href="?cat=503"], a[href="?cat=505"]').each(function() {
                const parentTd = jQuery(this).closest('td'); // 获取父级 td
                const nextTd = parentTd.next('td'); // 获取下一个 td
                // 检查下一个 td 的 table 内的 tbody 是否包含特定链接
                const hasPackLink = nextTd.find('table tbody a[href="/torrents.php?pack=1"], a[href="/torrents.php?untouched=1"]').length > 0;

                // 检查下一个 td 的 table 内的 tbody 中的 <div class="torrent-smalldescr"> 内的文本
                const descrText = nextTd.find('table tbody div.torrent-smalldescr').text();
                const regex = /第\s*?[\d一二三四五六七八九十百千]*(?:-\d+)?\s*?[集期]/;
                const matches = regex.test(descrText);

                if (!hasPackLink && matches) {
                    // 如果没有找到特定链接，并且文本匹配正则表达式，则设置颜色为深黄色
                    const row = jQuery(this).closest('tr');
                    const titleLink = row.find('div.torrent-title a');
                    // 仅当颜色不是蓝色时，才改为深黄色
                    if (titleLink.css('color') !== 'blue') {
                        titleLink.css('color', 'darkgoldenrod'); // 或使用 '#B8860B'
                    }
                }
            });

            // 查找具有特定内容的 <td> 元素，并根据颜色条件修改父 <tr> 中的链接颜色
            jQuery('td.rowfollow').each(function() {
                if (jQuery(this).find('span.red').text().trim() === '0') {
                    const row = jQuery(this).closest('tr');
                    const titleLink = row.find('div.torrent-title a');
                    const currentColor = titleLink.css('color');
                    if (currentColor !== 'blue' && currentColor !== 'darkgoldenrod') {
                        titleLink.css('color', 'darkred');
                    }
                }
            });
        }

        // 在页面加载后立即调用
        changeFrozenRowsStyle();
        function hideReviewed() {
            jQuery('span.bi.bi-check2.torrent-icon, span.bi.bi-heart-fill.torrent-icon, span.bi.bi-fire.torrent-icon, span.bi.bi-award-fill.torrent-icon').closest('table').closest('tr').hide();
            changeFrozenRowsStyle();
        }

        function hideOld() {
            jQuery('td.rowfollow.nowrap').each(function() {
                if (jQuery(this).text().includes('月')) {
                    jQuery(this).closest('tr').hide();
                }
            });
            changeFrozenRowsStyle();
        }
        function toggleParam(param) {
            const url = new URL(window.location);
            const currentValue = url.searchParams.get(param) === '1' ? '2' : '1';
            url.searchParams.set(param, currentValue);
            window.location.href = url.toString();
        }

        function toggleVisibility(match) {
            const mainRegex = new RegExp(mainInput.value, 'i');
            const subtitleRegex = new RegExp(subtitleInput.value, 'i');
            const rows = jQuery('table.torrents tr:visible');
            rows.each(function (index) {
                if (index === 0) return;
                if (index === rows.length - 1) return;

                const title = jQuery(this).find('div.torrent-title a[title]').attr('title');
                const subtitle = jQuery(this).find('div.torrent-smalldescr span:last').text();
                const regexToUse = mainInput.value ? mainRegex : subtitleRegex;
                const textToMatch = mainInput.value ? title : subtitle;
                const shouldHide = match ? regexToUse.test(textToMatch) : !regexToUse.test(textToMatch);
                jQuery(this).toggle(!shouldHide);
            });
        }



        function createButton(text, onClickFunction) {
            const button = document.createElement('button');
            button.textContent = text;
            button.style.cssText = `position:fixed;top:${buttonTop}px;right:10px;z-index:1000;`;
            document.body.appendChild(button);
            button.onclick = onClickFunction;
            buttonTop += buttonSpacing;
        }

        function createInput(placeholder, localStorageKey) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = placeholder;
            input.style.cssText = `position:fixed;top:${buttonTop}px;right:10px;z-index:1000;width:120px;`;
            document.body.appendChild(input);
            input.value = localStorage.getItem(localStorageKey) || '';
            input.addEventListener('input', () => {
                localStorage.setItem(localStorageKey, input.value);
            });
            buttonTop += buttonSpacing;
            return input;
        }
    }

    if ((window.location.href.includes("/torrents.php") || window.location.href.includes("offers.php"))&& GM_info.script.name === "SpringSunday-Torrent-Assistant 测试版魔改") {
        enhanceTorrentsPage();
    }

    // ===========================================
    // 4. << 快速添加回复的修改意见 >>
    // 快速添加 对应问题/标准回答 的答复
    // ===========================================
    if (window.location.href.includes("/details.php") && GM_info.script.name === "SpringSunday-Torrent-Assistant 测试版魔改") {
        // 确保页面加载完成后执行
        $(document).ready(function() {
            // 找到目标元素
            const target = $('td.rowhead.nowrap a[href="javascript: klappe_news(\'related\')"]');

            if (target.length > 0) {
                // 创建按钮
                const button = $('<br><button>显示副标题</button>');

                // 添加按钮到超链接后面
                target.after(button);

                // 按钮点击事件
                button.on('click', function() {
                    // 遍历处理 #krelated 表格中的每一行
                    $('#krelated table tr').each(function() {
                        var html = $(this).html();
                        // 将注释转换为 HTML
                        html = html.replace(/<!--\s*(.*?)\s*-->/g, '$1');
                        $(this).html(html);
                    });
                });
            }
        });
        const comments = [
            "请补充至少一张带中字的截图",
            "请重新截取 png 格式原图",
            "请参考截图及图床教程 [url=https://springsunday.net/forums.php?action=viewtopic&forumid=10&topicid=18105#pid389691] 教程 [/url] , 如该方法获取截图分辨率错误，右键视频->图像截取->按调整后的比例保存（取消勾选该选项，其余播放器同理）。",
            "盒子截图参考教程：https://springsunday.net/forums.php?action=viewtopic&forumid=3&topicid=19545",
            "现在我们提供一个春天种子检查 [url=https://springsunday.net/forums.php?action=viewtopic&forumid=16&topicid=16773] 脚本 [/url]，方便用户自检常见的种子信息不规范问题，提高发种效率。",
            "截图体积偏小，疑似压缩的太厉害，请重新截取png原图，1080影片截图应该在1000kb以上，HDR/2160影片截图应该在1800KB以上",
            "附加信息-请移除海报、ptgen信息、截图、 mediainfo。",
            "附加信息-压制、diy、remux作品请保留完整制作信息(包括音视频及字幕来源、处理方式等)。",
            "请参考资源规则中的主标题部分重新命名",
            "截图内容必须包含影视正片有效信息，片头不视为有效信息",
            "请使用mediainfo扫描完整的英文版媒体信息 [url=https://springsunday.net/forums.php?action=viewtopic&forumid=16&topicid=14319] 教程 [/url] [url=https://mediaarea.net/MediaInfoOnline] 在线版 [/url]",
            "请参考本帖，添加合适的标签。[url=https://springsunday.net/forums.php?action=viewtopic&forumid=3&topicid=19073] 参考 [/url]",
            "「原生标签」Untouch 原盘指正式出版未经过二次制作的影碟，包括 Blu-ray 和 DVD。",
            "「特效标签」字幕包含有位移、变色、动态等特殊效果。简单的颜色、字体处理不被视为特效。使用特效标签的种子要求至少提供 2 张特效截图，且必须截取剧情相关部分的特效，无分辨率和格式要求，且不计入 3 张截图的基本要求。",
            "「已取代标签」Trump 资源必须先于候选区发布，主动「举报/反馈」种子并说明 Trump（附带对应链接），附带 Trump 理由可更好的审核。",
            "「合集标签」剧集、纪录、动画等资源的整季打包。详见资源规则的 [url=rules.php#id59] 合集打包规则 [/url]",
            "「中字标签」资源包含有中文字幕。以下情形均可使用中字标签：内封/外挂/上传简繁字幕、内封/外挂/上传双语字幕、中文硬字幕。",
            "「国配标签」外语片或粤语片包含有普通话配音（包括台湾普通话配音）。原始对白为普通话的资源不可使用该标签。",
            "「CC 标签」原盘或压制的来源是 CC 标准收藏碟。"
        ];

        // 初始化 UI
        function initializeUI() {
            const textarea = $('textarea[name="body"]');
            const selectHTML = buildSelectOptions(comments);
            textarea.after(selectHTML);

            setupEventListeners(textarea);
        }

        // 创建监控选择框
        function createMonitoringSelect() {
            const table = $('#compose').closest('table');
            if (table.length) {
                // 确保表格具有相对定位
                table.css('position', 'relative');

                // 找到表格内的第一个 textarea
                const firstTextarea = table.find('textarea').first();
                if (firstTextarea.length) {
                    // 计算第一个 textarea 的位置
                    const textareaPosition = firstTextarea.position();

                    // 创建选择框并设置样式和位置
                    const monitoringSelect = $('<select id="monitoringSelect" multiple="multiple" style="width: 300px; height: 200px; position: absolute;"></select>');
                    monitoringSelect.css({
                        top: textareaPosition.top + 'px', // 顶部对齐
                        left: (textareaPosition.left + firstTextarea.outerWidth() + 15) + 'px' // 在 textarea 右侧 10px
                    });
                    table.append(monitoringSelect);

                    // 初始化内容
                    updateMonitoringSelect();

                    // 每 2 秒检查并更新内容
                    setInterval(updateMonitoringSelect, 2000);

                    // 设置事件监听器
                    monitoringSelect.change(function () {
                        const selectedText = $(this).find('option:selected').text();
                        const textarea = $('textarea[name="body"]');
                        textarea.val(textarea.val() + (textarea.val() ? '\n' : '') + selectedText);
                        formatTextareaInput(textarea); // 调用格式化函数
                    });
                }
            }
        }

        // 更新监控选择框的内容
        function updateMonitoringSelect() {
            const assistantContent = $('#assistant-tooltips').html() || '';
            const editorContent = $('#editor-tooltips').html() || '';
            const combinedContent = assistantContent + '<br>' + editorContent; // 将两个内容合并，assistant 在前
            const monitoringSelect = $('#monitoringSelect');

            // 使用简单的内容检查，如果有变化则更新
            if (monitoringSelect.data('content') !== combinedContent) {
                monitoringSelect.data('content', combinedContent);
                monitoringSelect.empty(); // 清空现有选项

                // 将内容分行并添加为选项
                const lines = combinedContent.split(/<br\s*\/?>/gi);
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    // 忽略包含特定文本的行
                    if (trimmedLine && !trimmedLine.includes('此种子未检测到异常')) {
                        monitoringSelect.append($('<option></option>').text(trimmedLine));
                    }
                });
            }
        }

        function submitForm(tid) {
            var form = document.createElement('form');
            form.action = 'https://springsunday.net/admin.php?action=freezeoffer';
            form.method = 'POST';

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'tid';
            input.value = tid;
            form.appendChild(input);

            document.body.appendChild(form);
            form.submit();
        }

        // 构建下拉选择 HTML
        function buildSelectOptions(comments) {
            let options = comments.map((comment, index) => `<option class="quickcomment" id="quickcomment${index}" value="${index}">${comment}</option>`).join('');
            return `<div align="center"><select id="quickcommentselect" multiple="multiple" style="width: 450px; height: 300px; margin-top: 5px; margin-bottom: 5px">${options}</select></div>`;
        }

        // 设置事件监听器
        function setupEventListeners(textarea) {
            $('#quickcommentselect').change(() => handleSelectChange(textarea));
            textarea.on('input', () => formatTextareaInput(textarea));

            // 添加两个复选框
            $('#qr').after('<input type="checkbox" id="addTextCheckbox" style="margin-left: 10px;"/><label for="addTextCheckbox">完成修改后请「举报/反馈」种子，谢谢</label>');
            $('#qr').after('<input type="checkbox" id="sendRequestCheckbox" style="margin-left: 20px;"/><label for="sendRequestCheckbox">冻结</label>');
            $('#qr').click((event) => handleQRClick(event, textarea)); // 绑定事件时传递event参数

            // 设置复选框的初始状态
            $('#addTextCheckbox').prop('checked', GM_getValue('addTextChecked', true));
            $('#sendRequestCheckbox').prop('checked', GM_getValue('sendRequestChecked', true));

            // 监听复选框状态变化并保存
            $('#addTextCheckbox').change(function() {
                GM_setValue('addTextChecked', $(this).is(':checked'));
            });
            $('#sendRequestCheckbox').change(function() {
                GM_setValue('sendRequestChecked', $(this).is(':checked'));
            });
        }
        // 处理下拉选择变更
        function handleSelectChange(textarea) {
            let selectedValues = $('#quickcommentselect').val();
            let currentText = textarea.val();
            let lastLineIsEmpty = currentText === '' || currentText.endsWith('\n');
            selectedValues.forEach(value => {
                let textToAdd = $(`#quickcomment${value}`).text();
                textarea.val(`${currentText}${lastLineIsEmpty ? '' : '\n'}● ${textToAdd}`);
                currentText = textarea.val();  // 更新当前文本
            });
        }

        // 格式化文本区域输入
        function formatTextareaInput(textarea) {
            let lines = textarea.val().split('\n');
            let transformedLines = lines.map(line => line.trim() !== '' && !line.trim().startsWith('●') ? `● ${line}` : line);
            textarea.val(transformedLines.join('\n'));
        }

        // 处理点击事件
        function handleQRClick(event, textarea) {
            event.preventDefault();  // 阻止表单默认提交行为

            const tid = new URLSearchParams(window.location.search).get('id');
            var url = "https://springsunday.net/admin.php?action=freezeoffer";
            var data = "tid=" + tid;

            // 根据复选框状态发送请求
            if ($('#sendRequestCheckbox').is(':checked')) {
                sendRequest(url, data); // 发送请求
            }

            // 根据复选框状态添加文本
            if ($('#addTextCheckbox').is(':checked')) {
                let currentText = textarea.val();
                let additionalText = "\n\n完成修改后请「举报/反馈」种子，谢谢 [em28]";
                if (!currentText.endsWith(additionalText)) {
                    textarea.val(`${currentText}${additionalText}`);
                }
            }

            // 延迟1秒后提交表单
            setTimeout(() => {
                document.getElementById('compose').submit();
            }, 1000);
        }
        // 通用发送请求的函数
        function sendRequest(url, data) {
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: data
            });
        }


        initializeUI();
        createMonitoringSelect();
    }
})();