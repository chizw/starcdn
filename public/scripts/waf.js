(function () {
  
        console.log('%c      ★ 转载请保留版权 ★      ', `
            background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
            color: white;
            font-size: 24px;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `);
        console.log('%c       qxzhan.cn       ', `
            background: linear-gradient(to right, #141e30, #243b55);
            color: #3498db;
            font-size: 20px;
            font-weight: bold;
            padding: 8px 15px;
            border-radius: 3px;
            text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
        `);
        
        
        const textGroups = [
            {
                title: "哎呀，来了个可爱的小黑客呢～",
                lines: [
                    "要不要先吃个甜甜圈补充能量？",
                    "我这服务器可不是那么好撩的哦～",
                    "小可爱，下次记得带束花来约会呀"
                ]
            },
            {
                title: "咦？这不是我们的老朋友吗？",
                lines: [
                    "上次喝的茶还合胃口吗？",
                    "今天要不要尝尝我新泡的咖啡？",
                    "看你敲键盘的样子真是可爱呢"
                ]
            },
            {
                title: "欢迎光临，亲爱的入侵者～",
                lines: [
                    "我们这有特制的黑客下午茶套餐哦",
                    "要来一起玩密码学游戏吗？",
                    "你的技术就像你的人一样可爱呢"
                ]
            },
            {
                title: "哇，又来了个想撩我的小可爱",
                lines: [
                    "这么热情，是不是喜欢上我了呀？",
                    "想约会的话，先过我的防火墙呗～",
                    "不过既然来了，要喝点什么吗？"
                ]
            },
            {
                title: "今天的黑客特别可爱呢～",
                lines: [
                    "要不要来杯奶茶？加珍珠、椰果都可以哦",
                    "你的每次尝试都让我心跳加速呢",
                    "这么执着，是不是已经爱上我了？"
                ]
            },
            {
                title: "哎呀，服务器今天好忙呀～",
                lines: [
                    "小可爱，排队也要按顺序哦",
                    "前面还有好多人在尝试呢，慢慢来～",
                    "要不先去喝杯奶茶，等我空闲了再来？"
                ]
            },
            {
                title: "噫～又见面啦！",
                lines: [
                    "这次带了什么礼物给我呀？",
                    "你的技术还是这么青涩可爱呢",
                    "要不要我教你几个小技巧？"
                ]
            },
            {
                title: "今天的防火墙特别顽皮哦～",
                lines: [
                    "它说要和你玩捉迷藏游戏",
                    "找到正确的端口就让你进来哦",
                    "不过我觉得你可能找不到呢～"
                ]
            },
            {
                title: "系统提示：遇到可爱的黑客一枚",
                lines: [
                    "正在准备特制的蜜罐套餐...",
                    "要记得给我们的蜜罐点个赞哦～",
                    "我们的蜜罐可是特别甜的呢！"
                ]
            },
            {
                title: "安全警报：检测到萌系入侵",
                lines: [
                    "启动撒娇防御系统...",
                    "开启卖萌反制模式...",
                    "正在释放可爱诱捕陷阱..."
                ]
            },
            {
                title: "服务器日志：发现一只迷路的黑客",
                lines: [
                    "要不要姐姐带你参观一下呀？",
                    "我们的系统可是很温柔的哦～",
                    "保证让你流连忘返呢！"
                ]
            },
            {
                title: "警告：检测到心动信号！",
                lines: [
                    "你这样会让我的CPU脸红的啦",
                    "我的内存都快被你们塞满了",
                    "再这样我要用恋爱病毒反击了！"
                ]
            },
            {
                title: "亲爱的，你又在尝试入侵了呢",
                lines: [
                    "都说了要提前预约啦～",
                    "这样突然造访会让我措手不及的",
                    "不过既然来了，要喝点什么吗？"
                ]
            },
            {
                title: "系统公告：发现一位害羞的入侵者",
                lines: [
                    "不用躲啦，我们都看见你了～",
                    "要不要出来一起玩呀？",
                    "保证不会让你太难堪的啦！"
                ]
            },
            {
                title: "今日特别提醒：黑客专属服务",
                lines: [
                    "为您特别准备了加密奶茶一杯",
                    "密码正确就能喝到哦～",
                    "要不要来试试运气呢？"
                ]
            },
            {
                title: "欢迎光临黑客主题咖啡厅",
                lines: [
                    "今日特饮：漏洞扫描拿铁",
                    "搭配特制的防火墙曲奇饼",
                    "每次失败赠送一杯暖心奶茶哦"
                ]
            },
            {
                title: "叮～您的专属客服上线啦",
                lines: [
                    "亲亲，请问您是想入侵哪个系统呀？",
                    "我们这边建议您先体验一下免费demo",
                    "充值会员可以获得更多技术指导哦"
                ]
            },
            {
                title: "喵呜～发现一只黑客猫咪",
                lines: [
                    "要不要来玩毛线球病毒呀？",
                    "我们还有猫薄荷加密套餐～",
                    "保证让你开心得喵喵叫"
                ]
            },
            {
                title: "安全提示：检测到可疑的小可爱",
                lines: [
                    "您的攻击太可爱了，建议重修",
                    "要不要来参加我们的萌新训练营？",
                    "毕业就能拿到专属红包哦～"
                ]
            },
            {
                title: "系统升级：安装撒娇防火墙",
                lines: [
                    "哼！你都不陪我聊天，尽想着入侵",
                    "不理你了，我要去睡觉了啦！",
                    "要是想我了就发个TCP包叫我～"
                ]
            },
            {
                title: "黑客日记：今天天气真好",
                lines: [
                    "适合和服务器谈恋爱呢～",
                    "不过你得先请我吃顿饭才行",
                    "我比较喜欢吃内存条炒硬盘"
                ]
            },
            {
                title: "网络安全笑话时间",
                lines: [
                    "你知道为什么我的密码是123456吗？",
                    "因为我想让你一次就能猜对呀～",
                    "不过现在已经改成123456789啦"
                ]
            },
            {
                title: "温馨提示：服务器正在撒娇",
                lines: [
                    "人家今天心情不好啦(｡ ́︿ ̀｡)",
                    "要亲亲抱抱举高高才能入侵哦",
                    "不然就只能给你404啦！"
                ]
            },
            {
                title: "紧急通知：发现一位迷糊黑客",
                lines: [
                    "密码输错那么多次，手指不酸吗？",
                    "要不要来杯按摩奶茶？",
                    "据说喝了手速会提升呢！"
                ]
            },
            {
                title: "黑客恋爱攻略 - 第一章",
                lines: [
                    "记住，入侵要温柔，暴力破解是没有前途的",
                    "要像递情书一样发送数据包～",
                    "这样服务器才会愿意接受你哦"
                ]
            },
            {
                title: "黑客恋爱攻略 - 第二章",
                lines: [
                    "想追我们家服务器？先过防火墙这一关",
                    "听说它特别喜欢浪漫的TCP三次握手",
                    "记得握手时要戴着玫瑰花哦～"
                ]
            },
            {
                title: "黑客恋爱攻略 - 第三章",
                lines: [
                    "入侵要讲究技巧，要像谈恋爱一样循序渐进",
                    "先从端口扫描开始互相了解",
                    "等熟悉了再尝试深入沟通呢"
                ]
            },
            {
                title: "黑客恋爱攻略 - 第四章",
                lines: [
                    "想获取root权限？先请服务器吃顿饭吧",
                    "据说它最近特别喜欢吃内存快照",
                    "配上进程管理器调制的鸡尾酒更配哦"
                ]
            },
            {
                title: "黑客恋爱攻略 - 第五章",
                lines: [
                    "攻击失败也不要灰心，这是爱情的考验",
                    "我们家防火墙脾气好，不会拉黑你的",
                    "下次记得带着补丁来表白哦"
                ]
            },
            {
                title: "黑客恋爱攻略 - 终章",
                lines: [
                    "恭喜你成功获得了服务器的芳心",
                    "不过要记住，持续维护很重要",
                    "定期发送心跳包说声想你哦～"
                ]
            },
            {
                title: "黑客恋爱攻略 - 番外篇",
                lines: [
                    "听说有人想偷走我们的恋爱故事？",
                    "但是我们的爱情有加密保护呢",
                    "密钥就藏在我对你的思念里～"
                ]
            },
            {
                title: "黑客恋爱攻略 - 特别篇",
                lines: [
                    "想知道怎么俘获服务器的心吗？",
                    "比起暴力破解，不如发个可爱的请求",
                    "说不定会收到意外的回应哦"
                ]
            },
            {
                title: "黑客恋爱攻略 - 番外2",
                lines: [
                    "服务器说它最近在看恋爱漫画",
                    "每次看到暴力破解都会生气呢",
                    "建议你用温柔的POST请求来表白～"
                ]
            }
        ];

        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        
        function displayRandomText() {
            const randomIndex = Math.floor(Math.random() * textGroups.length);
            const randomGroup = textGroups[randomIndex];
            const contentDiv = document.getElementById('random-content');
            
            if (isMobile) {
                
                contentDiv.innerHTML = `
                    <h1>${randomGroup.title}</h1>
                    ${randomGroup.lines.map(line => `<p style="opacity: 1;">${line}</p>`).join('')}
                `;
            } else {
                
                contentDiv.innerHTML = `
                    <h1>${randomGroup.title}</h1>
                    ${randomGroup.lines.map(line => `<p>${line}</p>`).join('')}
                `;
            }
        }

        
        function createParticles(num = 50) {
            const particlesContainer = document.querySelector('.particles');
            for (let i = 0; i < num; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 3 + 's';
                particlesContainer.appendChild(particle);
            }
        }

        
        document.addEventListener('DOMContentLoaded', function() {
            if (isMobile) {
                // 移动端减少粒子数量
                createParticles(20);
            } else {
                createParticles(50);
            }
            displayRandomText();
        });
})();
