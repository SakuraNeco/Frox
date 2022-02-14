const Discord = require('discord.js');
require('dotenv').config();
var mines = {};
var wallet = {};
var timely = {};
var beauty = [];
var fs = require('fs');
getMines();
getWallet();
getTimely();
getBeauty();

// 初始化載入(含歷史訊息)
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
// 點表符領身分組
client.on('messageReactionAdd', (reaction, user) => {
    const member = reaction.message.guild.members.cache.get(user.id);
    // 訊息ID
    if (reaction.message.id === '940314674837196824') {
        switch (reaction.emoji.name) {
            //表符名稱
            case 'wu':
                // 身分組ID
                member.roles.add('938465035947216907');
                break;
        }
    }
    if (reaction.message.id === '940519663358586880') {
        // console.log(reaction.emoji);
        switch (reaction.emoji.name) {
            case '🇦':
                member.roles.add('940520055949635627');
                break;
        }
    }
});
// 取消表符移除身分組
client.on('messageReactionRemove', (reaction, user) => {
    const member = reaction.message.guild.members.cache.get(user.id);
    if (reaction.message.id === '940314674837196824') {
        switch (reaction.emoji.name) {
            case 'wu':
                member.roles.remove('938465035947216907');
                break;
        }
    }
    if (reaction.message.id === '940519663358586880') {
        switch (reaction.emoji.name) {
            case '🇦':
                member.roles.remove('940520055949635627');
                break;
        }
    }
});
client.on('message', async msg => {
    // 排除自己與場上機器人
    if (msg.author.id == client.user.id || msg.author.id == '544462904037081138') {
        // console.log('不吃自己的回覆');
        return;
    }
    // 地雷設置區
    if (msg.content.indexOf('.setMine') == 0) {
        var str = msg.content.replace('.setMine', '').trim();
        var tmp = str.split(' ');
        var key = tmp[0];
        var value = tmp[1];
        if(key && value) {
            console.log(key, value);
            var data = '';
            var isError = false;
            for(inx in mines) {
                data += inx + ' ' + mines[inx] + "\r\n";
                if(key == inx || key == mines[inx]) {
                    isError = true;
                    break;
                }
            }
            if(!isError) {
                data += key + ' ' + value;
                setMines(data);
                msg.reply('地雷設置成功！');
            } else {
                msg.reply('該地雷已存在或請勿讓紅蝶爆炸。');
            }
        } else {
            msg.reply('指令異常。');
        }
    // 地雷回應區
    } else if (Object.keys(mines).indexOf(msg.content) != -1) {
        msg.channel.send(mines[Object.keys(mines)[Object.keys(mines).indexOf(msg.content)]])
    // 錢包專區
    } else if (msg.content == '.$'){
        if(Object.keys(wallet).indexOf(msg.author.id) == -1) {
            setWallet(msg.author.id, 250000);
            msg.reply('歡迎使用花椰菜農會，做為初次使用獎勵您250,000顆花椰菜。');
        } else {
            var money = wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]];
            if(isNaN(money)) {
                setWallet(msg.author.id, 250000);
                msg.reply('您的錢包異常，將花椰菜重置為250,000顆。');
            } else {
                msg.reply('您目前有 ' + moneyFormat(money) + '顆花椰菜！');
            }
        }
    // 賭博專區
    } else if (msg.content.indexOf('.br') == 0) {
        var str = msg.content.replace('.br', '').trim();
        var tmp = str.split(' ');
        var money = tmp[0];
        var brMoney = 0;
        if(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]) {
            var walletMoney = parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]);
            if(money == 'all') {
                if(parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]) > 0) {
                    brMoney = walletMoney;
                } else {
                    msg.reply('您目前沒有花椰菜可以賭博。');
                    return;
                }
            } else if(!isNaN(money)){
                brMoney = parseInt(money);
                if(brMoney <= 0) {
                    msg.reply('是個不乖的小孩呢 <:emoji_8:939052460050354226> ');
                    return;
                }
            } else {
                msg.reply('請勿拿奇怪的東西進行賭博 <:emoji_8:939052460050354226> ');
                return;
            }
            if(brMoney > walletMoney) {
                msg.reply('賭資大於所擁有的花椰菜，不可賭博。');
                return;
            }
            var num = getBrNum();
            if(num < 66) {
                await setWallet(msg.author.id, walletMoney - brMoney);
                msg.reply('您骰出數字為 ' + num + '。再接再厲，下次會更好 ^_^');
            } else if(num == 87) {
                await setWallet(msg.author.id, walletMoney - brMoney + 87);
                msg.reply('您骰出數字為 ' + num + '。獲得獎勵為' + 87 + '顆花椰菜。');
            } else if(num >= 66 && num < 90) {
                await setWallet(msg.author.id, walletMoney - brMoney + (brMoney * 2));
                msg.reply('您骰出數字為 ' + num + '。獲得獎勵為' + moneyFormat(brMoney * 2) + '顆花椰菜。');
            } else if(num >= 90 && num < 100) {
                await setWallet(msg.author.id, walletMoney - brMoney + (brMoney * 4));
                msg.reply('您骰出數字為 ' + num + '。獲得獎勵為' + moneyFormat(brMoney * 4) + '顆花椰菜。');
            } else if(num == 100) {
                await setWallet(msg.author.id, walletMoney - brMoney + (brMoney * 10));
                msg.reply('您骰出數字為 ' + num + '。獲得獎勵為' + moneyFormat(brMoney * 10) + '顆花椰菜。');
            }
        } else {
            msg.reply('請先透過 .$ 領取5,000顆花椰菜。');
        }
    // 領錢專區
    } else if (msg.content == '.timely') {
        var dakaTime = parseInt(timely[Object.keys(timely)[Object.keys(timely).indexOf(msg.author.id)]]);
        var walletMoney = parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]);
        var daka = 60 * 60 * 6;
        if(!dakaTime) {
            // 領錢
            setWallet(msg.author.id, walletMoney + 150000);
            // 紀錄時間
            setTimely(msg.author.id, parseInt(Date.now()/1000));
            msg.reply('打卡成功！獲得獎勵為150,000顆花椰菜。');
        } else {
            var now = parseInt(Date.now()/1000);
            console.log(now - dakaTime);
            if((now - dakaTime) > daka) {
                // 領錢
                setWallet(msg.author.id, walletMoney + 150000);
                // 紀錄時間
                setTimely(msg.author.id, parseInt(Date.now()/1000));
                msg.reply('打卡成功！獲得獎勵為150,000顆花椰菜。');
            } else {
                // formatSecond
                msg.reply('打卡失敗！ ' + formatSecond(daka - (now - dakaTime)) + ' 後才能再次領錢！');
            }
        }
    // 給錢專區
    } else if (msg.content.indexOf('.give') == 0) {
        var str = msg.content.replace('.give', '').trim();
        var tmp = str.split(' ');
        var money = parseInt(tmp[0]);
        if(isNaN(money)) {
            msg.reply('指令異常。');
            return;
        }
        var giveTo = tmp[1];
        var A = msg.author.id;
        var B = giveTo.replace('<@!', '').replace('>', '').trim();
        if(isNaN(B)) {
            msg.reply('對象異常。');
            return;
        }
        if(A == B) {
            msg.reply('禁止交易給自己');
            return;
        }
        var MoneyA = parseInt(wallet[A]);
        var MoneyB = parseInt(wallet[B]);
        if(money > MoneyA) {
            msg.reply('您的花椰菜不足，還想貸款？');
            return;
        }
        // A扣錢
        console.log(A, MoneyA - money);
        await setWallet(A, MoneyA - money);
        // B領錢
        console.log(B, MoneyB + money);
        await setWallet(B, MoneyB + money);
        msg.reply('交易成功，給予 <@!' + B + '> ' + moneyFormat(money) + ' 顆花椰菜！');
    // 自肥專區
    } else if (msg.content == '海夢紅蝶婆' || msg.content == '高木紅蝶婆' || msg.content == '長瀞紅蝶婆' || msg.content == '七海紅蝶婆'){
        var walletMoney = parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]);
        // 領錢
        if(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]) {
            await setWallet(msg.author.id, walletMoney + 2000);
            msg.reply('感謝您的認證，系統獎勵您2,000顆花椰菜。');
        } else {
            msg.reply('請先透過 .$ 建立錢包並領取5,000顆花椰菜。');
        }
    } else if (msg.content == '火火紅蝶婆'){
        var walletMoney = parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]);
        // 領錢
        if(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]) {
            await setWallet(msg.author.id, walletMoney + 100000);
            msg.reply('感謝您的認證，日後歡迎您參加婚禮，系統獎勵您100,000顆花椰菜。');
        } else {
            msg.reply('請先透過 .$ 建立錢包並領取5,000顆花椰菜。');
        }
    } else if (msg.content.indexOf('.抽') == 0){
        console.log(msg.content.indexOf('.抽紅蝶'));
        if(msg.content.indexOf('.抽紅蝶') == 0) {
            // https://i.imgur.com/a1pEx0i.jpeg
            msg.channel.send('https://i.imgur.com/a1pEx0i.jpeg');
            return;
        }
        var str = msg.content.replace('.抽', '').trim();
        var tmp = str.split(' ');
        if(tmp[0] != '') {
            if(!isNaN(tmp[0])) {
                var num = parseInt(tmp[0]);
                if(num <= 0) {
                    msg.reply('指令錯誤');
                    return;
                }
                if(num > 5) {
                    msg.reply('一次最多5抽！');
                    return;
                }
            } else {
                msg.reply('多抽必須為數字！');
                return;
            }
        } else {
            var num = 1;
        }
        var pay = 25000;
        var walletMoney = parseInt(wallet[Object.keys(wallet)[Object.keys(wallet).indexOf(msg.author.id)]]);
        if(!walletMoney && walletMoney != 0) {
            msg.reply('請先透過 .$ 建立錢包並領取5,000顆花椰菜。');
            return;
        }
        if(walletMoney < pay * num) {
            msg.reply('抽 ' + num + ' 次卡須' + moneyFormat(pay * num) + '花椰菜，您的花椰菜不足。');
            return;
        }
        await setWallet(msg.author.id, walletMoney - pay * num);
        var rt = '';
        var atari = '';
        for(i = 0; i < num; i++) {
            // console.log(i);
            var max = beauty.length;
            console.log(max);
            var getWife = getBrNum(max) - 1;
            // console.log(num);
            rt += beauty[getWife] + '\r\n';
            if(beauty[getWife] == 'https://media.discordapp.net/attachments/919838386582327306/941531620635205722/IMG_-an3w90.jpg?width=537&height=536') {
                await setWallet(msg.author.id, walletMoney + 1000000);
                atari += '恭喜抽到扶賴約會大佬，系統獎勵您1,000,000顆花椰菜。\r\n';
            }
            if(beauty[getWife] == 'https://cdn.discordapp.com/attachments/917248532082212934/941534904120930314/video0.mov') {
                await setWallet(msg.author.id, walletMoney + 10000000);
                atari +=  '恭喜抽到打台的帥帥卡姆喵，系統獎勵您10,000,000顆花椰菜。 \r\n';
                getBeauty();
            }
            beauty.splice(getWife, 1);
        }
        msg.reply('您的抽卡結果 : \r\n' + atari + '\r\n' + rt);
    } else if (msg.content == '.rich') {
        var temp = [];
        for(inx in wallet) {
            temp.push({'user' : inx, 'money' : wallet[inx]});
        }
        var sort = temp.sort(function (a, b) {
            return parseInt(a.money) < parseInt(b.money) ? 1 : -1;
        });
        var rt = '目前狐呱富豪榜榜單為：\r\n';
        for(inx in sort) {
            rt += (parseInt(inx) + 1) + ' <@!' + sort[inx].user + '> : ' + moneyFormat(sort[inx].money) + '\r\n';
            if(inx == 4) {
                break;
            }
        }
        msg.channel.send(rt);
    }
});

client.login('Token');

// 取得表特正咩
function getBeauty() {
    // 讀取地雷檔
    fs.readFile('./beauty.txt', function (error, data) {
        // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
        if (error) {
            console.log('讀取表特正咩失敗');
            return
        }
        let tmp = data.toString().split('\r\n');
        for(inx in tmp) {
            if(tmp[inx].trim()) {
                beauty.push(tmp[inx]);
            }
        }
    })
}

// 取得地雷
function getMines() {
    // 讀取地雷檔
    fs.readFile('./mines.txt', function (error, data) {
        // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
        if (error) {
            console.log('讀取地雷失敗');
            return
        }
        let tmp = data.toString().split('\r\n');
        for(inx in tmp) {
            let mine = tmp[inx].split(' ');
            if(mine[0] && mine[1]) {
                mines[mine[0]] = mine[1];
            }
        }
    })
}
// 寫入地雷
function setMines(data) {
    // 寫入地雷檔
    fs.writeFile('./mines.txt', data ,function (error) {
        if (error) {
            console.log('地雷寫入失敗');
        } else {
            console.log('地雷寫入成功');
            getMines();
        }
    })
}
// 取得錢包
async function getWallet() {
    // 讀取錢包檔
    return new Promise((resolve, reject) => {
        fs.readFile('./wallet.txt', function (error, data) {
            // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
            if (error) {
                console.log('讀取錢包失敗');
                reject('error');
                return
            }
            let tmp = data.toString().split('\r\n');
            for(inx in tmp) {
                let temp = tmp[inx].split(' ');
                if(temp[0] && temp[1]) {
                    wallet[temp[0]] = temp[1];
                }
            }
            resolve('OK');
        })
    });
}
// 設定錢包
async function setWallet(user, money) {
    // 寫入錢包檔
    var data = '';
    var isAdd = true;
    for(inx in wallet) {
        if(user == inx) {
            isAdd = false;
            data += inx + ' ' + money + "\r\n";
        } else {
            data += inx + ' ' + wallet[inx] + "\r\n";
        }
    }
    if(isAdd) {
        data += user + ' ' + money;
    }
    return new Promise((resolve, reject) => {
        fs.writeFile('./wallet.txt', data , async function (error) {
            if (error) {
                console.log('錢包寫入失敗');
                reject('error');
            } else {
                console.log('錢包寫入成功');
                await getWallet();
                resolve('OK');
            }
        })
    });
}
// 取得打卡時間
function getTimely() {
    // 讀取打卡檔
    fs.readFile('./timely.txt', function (error, data) {
        // 若錯誤 error 為一個物件，則會在這邊觸發內部程式碼，作為簡單的錯誤處理
        if (error) {
            console.log('讀取錢包失敗');
            return
        }
        let tmp = data.toString().split('\r\n');
        for(inx in tmp) {
            let temp = tmp[inx].split(' ');
            if(temp[0] && temp[1]) {
                timely[temp[0]] = temp[1];
            }
        }
    })
}
// 打卡
function setTimely(user, time) {
    // 寫入打卡檔
    var data = '';
    var isAdd = true;
    for(inx in timely) {
        if(user == inx) {
            isAdd = false;
            data += inx + ' ' + time + "\r\n";
        } else {
            data += inx + ' ' + timely[inx] + "\r\n";
        }
    }
    if(isAdd) {
        data += user + ' ' + time;
    }
    fs.writeFile('./timely.txt', data ,function (error) {
        if (error) {
            console.log('打卡檔寫入失敗');
        } else {
            console.log('打卡檔寫入成功');
            getTimely();
        }
    })
}
// 賭博
function getBrNum(x = 100){
    return Math.floor(Math.random()*x) + 1;
};
// 秒數格式化
function formatSecond(secs) {         
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = parseInt( secs - (hr * 3600) - (min * 60));

    if(hr && hr < 10) {
        hr = '0' + hr;
    }
    if(min && min < 10) {
        min = '0' + min;
    }
    if(sec && sec < 10) {
        sec = '0' + sec;
    }

    if (hr) hr += ':';

    return hr + min + ':' + sec;
}
function moneyFormat(num) {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}