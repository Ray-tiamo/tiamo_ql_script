/**
 * 脚本地址: lxby.js
 * 转载请留信息,谢谢
 *
 * 联想百应签到
 *
 * cron 30 6 * * *  Reliablc_tiamo_script/lxby.js
 *
 * 01-04 新建脚本
 *
 * 感谢所有测试人员
 * ========= 青龙--配置文件 =========
 * 变量格式: export lxbyck='encryptData&iv&sessionKey'  多个账号用 @ 或者 换行分割
 * url（https://baiyingmalladmin.lenovo.com/api/v4/user/wxapp/loginWxApp），截取链提交数据内的内容
 * 抓取提交中的encryptData内容+&iv内容&sessionKey内容
 */

const $ = new Env("联想百应");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1 		//0为关闭通知，1为打开通知,默认为1
const debug = 0 		//0为关闭调试，1为打开调试,默认为0
///////////////////////////////////////////////////////////////////
let ckStr = process.env.lxbyhd;

let openid = "o2bfX5U5w7e8mMPWhQtCIkaGdl0c";
let unionid = "ot988v9wD4SBHfkYU6HbLgCnuAt0";

let msg = "";
let passtoken = "";
let token = "";
let task_num = '';
let ck_status = true;
let shop_status = false;
let store_status = false;
///////////////////////////////////////////////////////////////////
let Version = '\n 逐鹿少年   2022/12/31     联想百应签到脚本'
let thank = ``
let test = `脚本测试中,有bug及时反馈!     脚本测试中,有bug及时反馈!`

///////////////////////////////////////////////////////////////////

async function tips(ckArr) {

    console.log(`${Version}`);
    msg += `${Version}`

    // console.log(thank);
    // msg += `${thank}`

    // console.log(test);
    // msg += `${test}`

    // console.log(`\n 脚本已恢复正常状态,请及时更新! `);
    // msg += `脚本已恢复正常状态,请及时更新`

    console.log(`==================================================\n 脚本执行 - 北京时间(UTC+8): ${new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000
    ).toLocaleString()} \n==================================================`);
    //await wyy();  //开启网抑云语句
    console.log(`\n=================== 共找到 ${ckArr.length} 个账号 ===================`);
    debugLog(`【debug】 这是你的账号数组:\n ${ckArr}`);
}

!(async () => {
    let ckArr = await getCks(ckStr, "lxbyck");
    await tips(ckArr);
    for (let index = 0; index < ckArr.length; index++) {
        let num = index + 1;
        console.log(`------------- 开始【第 ${num} 个账号】-------------`);
        ck = ckArr[index].split("&");
        debugLog(`【debug】 这是你第 ${num} 账号信息:\n ${ck}`);
        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

async function start() {

    console.log("➡️开始 获取token");
    await gettoken();
    await $.wait(2 * 1000);

    if (ck_status) {

        console.log("➡️开始 每日签到");
        await dailyCheckIn();
        await $.wait(2 * 1000);

        console.log("➡️开始 任务列表");
        await tasklist();
        await $.wait(2 * 1000);

    }

}

/**
* 登录获取token    httpPost
*/
async function gettoken() {
    let Options = {
        url: 'https://baiyingmalladmin.lenovo.com/api/v4/user/wxapp/loginWxApp',
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': ''
        },
        body: `encryptData=${ck[0]}&iv=${ck[1]}&sessionKey=${ck[2]}&openid=${openid}&unionid=${unionid}&nickname=&encryptUserData=&qrCodeKey=&iv_user=&registerChannel=MICRO_STATION&is_enterprise=1&from=&snQrCodeKey=`
    };
    // console.log('提交数据包:' + Options);
    let result = await httpPost(Options, `获取token`);
    if (result.code == 200) {
        passtoken = result.data.paasToken;
        token = result.data.token;
        console.log(` 当前获取token: ${result.data.token} \n 获取passtokentoken: ${result.data.paasToken} `);
        msg += ` 当前获取token: ${result.data.token} \n 获取passtokentoken: ${result.data.paasToken} `;
        // await gettoken(token1);
    } else {
        console.log(` 获取token:   失败 ❌ 了呢,原因未知！\n ${result.errors.message} `);
        msg += ` 获取token:   失败 ❌ 了呢,原因未知！\n ${result.errors.message} `;
        return ck_status = false;
    }
}

/**
 * 每日签到(进行中...)    httpPost
 */
async function dailyCheckIn() {
    let Options = {
        url: `https://paas.lenovo.com.cn/event-promotion-server/event/dailyCheckIn`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': passtoken
        },
    };
    let result = await httpGet(Options, `每日签到`);
    // console.log(result);
    if (result.code >= 200) {
        console.log(` 每日签到: ${result.message} 🎉 `);
        msg += ` 每日签到: ${result.message} 🎉 `;
        await dailyCheckInstatus();
    } else if (result.code == 0) {
        // console.log(` 每日签到: ${result.message} 🎉 `);
        // msg += ` 每日签到: ${result.message} 🎉 `;
        await dailyCheckInstatus();
    } else {
        console.log(` 每日签到: 失败 ❌ 了呢,原因未知！\n ${result} `);
        msg += ` 每日签到: 失败 ❌ 了呢,原因未知！\n ${result} `;
    }
}

/**
* 每日签到查询    httpPost
*/
async function dailyCheckInstatus() {
    let Options = {
        url: 'https://paas.lenovo.com.cn/event-promotion-server/event/dailyCheckIn/status',
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': passtoken
        },
    };
    let result = await httpGet(Options, `每日签到查询`);

    if (result.code == 200) {
        if (result.data.completed == false) {
            //判断是否签到
            console.log(` 当前签到天数: ${result.data.dayOfContinuous} 天 🎉 `);
            msg += ` 当前签到天数: ${result.data.dayOfContinuous} 天 🎉 `;
        } else {
            console.log(` 今日已签到,当前签到天数: ${result.data.dayOfContinuous} 天 🎉 `);
            msg += ` 今日已签到,当前签到天数: ${result.data.dayOfContinuous} 天 🎉 `;
        }
    } else {
        console.log(` 每日签到查询:   失败 ❌ 了呢,原因未知！\n ${result.message} `);
        msg += ` 每日签到查询:   失败 ❌ 了呢,原因未知！\n ${result.message} `;
    }
}

/**
 * 任务中心 -- 任务列表    httpPost
 */
async function tasklist() {
    let Options = {
        url: `https://baiyingmalladmin.lenovo.com/api/v5/user/profile?is_company=0`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': token
        },
    };
    let result = await httpGet(Options, `任务中心`);
    if (result.resultCode == 0) {
        let taskArr = result.data.integralTask;
        // console.log(taskArr);
        for (let index = 0; index < 8; index++) {
            //console.log(` ${taskArr[index].mainTitle} : 任务已完成,明天再来吧~! `);
            //msg += ` ${taskArr[index].mainTitle} : 任务已完成,明天再来吧~! `;

            if (taskArr[index].type == 3) {
                //关注店铺
                console.log(` ${taskArr[index].name} : 今日进度 ${taskArr[index].finishNum}/${taskArr[index].amount},单次可获得 ${taskArr[index].scoreSingle}积分 `);
                msg += ` ${taskArr[index].name} : 今日进度 ${taskArr[index].finishNum}/${taskArr[index].amount},单次可获得 ${taskArr[index].scoreSingle}积分 `;
                if (taskArr[index].finishNum == 3) {
                    console.log(`没有可执行的任务了 ,明天再来吧~!`)
                } else {
                    console.log("➡️开始 执行关注店铺");
                    await dotask_Storelist();
                    await $.wait(2 * 1000);
                }
            } else if (taskArr[index].type == 4) {
                //浏览商品
                console.log(` ${taskArr[index].name} : 今日进度 ${taskArr[index].finishNum}/${taskArr[index].amount},单次可获得 ${taskArr[index].scoreSingle}积分 `);
                msg += ` ${taskArr[index].name} : 今日进度 ${taskArr[index].finishNum}/${taskArr[index].amount},单次可获得 ${taskArr[index].scoreSingle}积分 `;
                if (taskArr[index].finishNum == 10) {
                    console.log(`没有可执行的任务了 ,明天再来吧~!`)
                } else {
                    console.log("➡️开始 执行浏览商品");
                    await dotask_shoplist();
                    await $.wait(2 * 1000);
                }
            } else {
                console.log(` ${taskArr[index].name} : 任务进度 ${taskArr[index].finishNum}/${taskArr[index].amount} `);
                msg += ` ${taskArr[index].mainTitle} : 任务进度 ${taskArr[index].finishNum}/${taskArr[index].amount} `;
            }

        }
        //await walk();

    } else {
        console.log(`任务列表: 失败 ❌ 了呢,原因未知!`);
        console.log(result);
    }
}

/**
* 任务接口---获取店铺列表    httpPost
*/
async function dotask_Storelist() {
    let Options = {
        url: `https://shop-pub-gateway.baiying.com.cn/api/goods/v1/getNearbyShopList`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ "keywords": "", "page": 1, "size": 10, "terminal": "wx", "distanceOrderType": 1, "shopScoreOrderType": "", "latitude": 39.92738, "longitude": 116.44227 })//latitude纬度，longitude经度
    };
    let result = await httpPost(Options, `获取店铺列表`);
    if (result.code == 200) {
        console.log(`\n 获取店铺列表成功 🎉 `);
        msg += `\n 获取店铺列表成功 🎉 `;
        let shoplist = result.data;
        for (let index = 0; index < 3; index++) {
            await dotask_collectStore(shoplist[index].ruId, shoplist[index].shopName)
            await $.wait(8 * 1000);
            await dotask_collectStore(shoplist[index].ruId, shoplist[index].shopName)
            await $.wait(2 * 1000);
        }
    } else {
        console.log(`\n 获取店铺列表 : 失败 ❌ 了呢,原因未知！\n ${result} \n`);
        msg += `\n 获取店铺列表 : 失败 ❌ 了呢,原因未知！\n ${result} \n`;
    }
}

/**
* 任务接口---关注/取关店铺    httpGet
*/
async function dotask_collectStore(ruId, shopName) {
    let Options = {
        url: `https://shop-pub-gateway.baiying.com.cn/api/shop/collect/collectStore/${ruId}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'token': token
        },
    };
    //console.log(Options);
    let result = await httpGet(Options, `关注店铺`);
    if (result.code == 200) {
        //console.log(result);
        console.log(` 店铺 : ${shopName} (${ruId}) --- ${result.data.msg} 🎉 `);
        msg += ` 店铺 : ${shopName} (${ruId}) --- ${result.data.msg} 🎉 `;
    } else {
        console.log(`\n 关注/取关店铺 : 失败 ❌ 了呢,原因未知！\n ${result} \n`);
        msg += `\n 关注/取关店铺 : 失败 ❌ 了呢,原因未知！\n ${result} \n`;
    }

}


/**
* 任务接口---获取商品列表    httpPost
*/
async function dotask_shoplist() {
    let Options = {
        url: `https://shop-pub-gateway.baiying.com.cn/api/goods/v1/getGoodsList`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ "page": 1, "size": 10, "terminal": "wx", "fourthCatId": "", "thirdCatId": "", "shopPriceOrderType": "", "ifRecommen": 1, "salesVolumeOrderType": "", "addTimeOrderType": "", "active": "" })
    };
    let result = await httpPost(Options, `获取商品列表`);
    if (result.code == 200) {
        console.log(`\n 获取商品列表成功 🎉 `);
        msg += `\n 获取商品列表成功 🎉 `;
        // return result.data
        let goodslist = result.data;
        //console.log(`\n 循环次数:${task_num} `);
        for (let index = 0; index < 10; index++) {
            await dotask_plusshop(goodslist[index].goodsId, goodslist[index].goodsName)
            await $.wait(5 * 1000);
        }
    } else {
        console.log(`\n 获取商品列表 : 失败 ❌ 了呢,原因未知！\n ${result} \n`);
        msg += `\n 获取商品列表 : 失败 ❌ 了呢,原因未知！\n ${result} \n`;
    }
}

/**
* 任务接口---浏览商品提交    httpPost
*/
async function dotask_plusshop(goodsId, goodsName) {
    // let shopdata=await dotask_shopdata(goodsId);
    let Options = {
        url: 'https://baiyingmalladmin.lenovo.com/api/v4/user/plusScore',
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'token': token
        },
        body: JSON.stringify({ "goods_id": String(goodsId), "act": 4, "lenovo_parent_id": goodsId })
    };
    //console.log(Options);
    let result = await httpPost(Options, `浏览商品`);
    if (result.code == 200) {
        //console.log(result);
        console.log(` 商品 : ${goodsName} (${goodsId}) - 浏览状态: ${result.status}；当前浏览次数:${result.data.plusScore.currScore} 🎉 `);
        msg += ` 商品 : ${goodsName} (${goodsId}) - 浏览状态: ${result.status}；当前浏览次数:${result.data.plusScore.currScore} 🎉 `;
    } else {
        console.log(`\n 浏览商品 : 失败 ❌ 了呢,原因未知！\n ${result} \n`);
        msg += `\n 浏览商品 : 失败 ❌ 了呢,原因未知！\n ${result} \n`;
    }

}





//#region 固定代码
// ============================================变量检查============================================ \\
async function getCks(ck, str) {


    return new Promise((resolve) => {

        let ckArr = []
        if (ck) {
            if (ck.indexOf("@") !== -1) {

                ck.split("@").forEach((item) => {
                    ckArr.push(item);
                });
            } else if (ck.indexOf("\n") !== -1) {

                ck.split("\n").forEach((item) => {
                    ckArr.push(item);
                });
            } else {
                ckArr.push(ck);
            }
            resolve(ckArr)
        } else {
            console.log(`\n 【${$.name}】：未填写变量 ${str}`)
        }

    }
    )
}
// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message) return;

    if (Notify > 0) {
        if ($.isNode()) {
            let notify = require("./sendNotify");
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        console.log(message);
    }
}

// ============================================ get请求 ============================================ \\
async function httpGet(getUrlObject, tip, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = getUrlObject;
        if (!tip) {
            let tmp = arguments.callee.toString();
            let re = /function\s*(\w*)/i;
            let matches = re.exec(tmp);
            tip = matches[1];
        }
        if (debug) {
            console.log(`\n 【debug】=============== 这是 ${tip} 请求 url ===============`);
            console.log(url);
        }

        $.get(
            url,
            async (err, resp, data) => {
                try {
                    if (debug) {
                        console.log(`\n\n 【debug】===============这是 ${tip} 返回data==============`);
                        console.log(data);
                        console.log(`======`);
                        console.log(JSON.parse(data));
                    }
                    let result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg += `\n ${tip} 失败了!请稍后尝试!!`
                } finally {
                    resolve();
                }
            },
            timeout
        );
    });
}

// ============================================ post请求 ============================================ \\
async function httpPost(postUrlObject, tip, timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = postUrlObject;
        if (!tip) {
            let tmp = arguments.callee.toString();
            let re = /function\s*(\w*)/i;
            let matches = re.exec(tmp);
            tip = matches[1];
        }
        if (debug) {
            console.log(`\n 【debug】=============== 这是 ${tip} 请求 url ===============`);
            console.log(url);
        }

        $.post(
            url,
            async (err, resp, data) => {
                try {
                    if (debug) {
                        console.log(`\n\n 【debug】===============这是 ${tip} 返回data==============`);
                        console.log(data);
                        console.log(`======`);
                        console.log(JSON.parse(data));
                    }
                    let result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    console.log(err, resp);
                    console.log(`\n ${tip} 失败了!请稍后尝试!!`);
                    msg += `\n ${tip} 失败了!请稍后尝试!!`
                } finally {
                    resolve();
                }
            },
            timeout
        );
    });
}

// ============================================ debug调试 ============================================ \\
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}

function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? { url: t } : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({ url: t }, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: { script_text: t, mock_type: "cron", timeout: r },
                    headers: { "X-Key": o, Accept: "*/*" }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => {
                const { message: s, response: i } = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/json"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const { url: s, ...i } = t;
                this.got.post(s, i).then(t => {
                    const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                    e(null, { status: s, statusCode: i, headers: r, body: o }, o)
                }, t => {
                    const { message: s, response: i } = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return { openUrl: e, mediaUrl: s }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return { "open-url": e, "media-url": s }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return { url: e }
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
