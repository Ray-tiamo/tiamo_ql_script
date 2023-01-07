/**
 * 脚本地址: qcs_hkj_qd.js
 * 转载请留信息,谢谢
 *
 * 屈臣氏签到
 *
 * cron 30 6 * * *  Reliablc_tiamo_script/lxby.js
 *
 * 2023/1/4 新建脚本
 *
 * 感谢所有测试人员
 * ========= 青龙--配置文件 =========
 * 变量格式: export qcsck='***'  多个账号用 @ 或者 换行分割
 * 回馈金获取参数链接:(https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/tasks)，截取链提交数据内协议头的内容 Authorization|openid|unionid
 * 日常签到获取参数链接:(https://iws.watsonsvip.com.cn/watsons-member-center/mp/user/wxLogin)，截取链提交数据内协议头的内容 Authorization
 * ck格式:回馈金签到的Authorization内容(获取的值,不要Bearer )+openid内容+unionid内容+日常签到的Authorization(日常签到获取的值,不要Bearer)内容 用&分隔开
 * 
 */

const $ = new Env("屈臣氏");
const notify = $.isNode() ? require("./sendNotify") : "";
const Notify = 1 		//0为关闭通知，1为打开通知,默认为1
const debug = 0 		//0为关闭调试，1为打开调试,默认为0
///////////////////////////////////////////////////////////////////
let ckStr = process.env.qcshkjck;

// 必备参数↓↓↓
let authorizer_appid = "wx1ffbd6927043dff7";
let Authorization = "";
let openid = "";
let unionid = "";
let Authorization1 = "";
let msg = "";
let ck_status = true;

///////////////////////////////////////////////////////////////////
let Version = '\n 逐鹿少年   2022/12/31     屈臣氏签到脚本'
let thank = ``
let test = `脚本测试中,有bug及时反馈! `

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
    let ckArr = await getCks(ckStr, "qcshkjck");
    await tips(ckArr);
    for (let index = 0; index < ckArr.length; index++) {
        let num = index + 1;
        console.log(`------------- 开始【第 ${num} 个账号】-------------`);
        ck = ckArr[index].split("&");
        debugLog(`【debug】 这是你第 ${num} 账号信息:\n ${ck}`);

        Authorization = 'Bearer ' + ck[0];
        openid = ck[1];
        unionid = ck[2];

        await start();
    }
    await SendMsg(msg);
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

async function start() {

    console.log("➡️开始 每日签到");
    if (ck[3] != null) {
        Authorization1 = 'Bearer ' + ck[3];
        await singinstar();
        await $.wait(2 * 1000);
    } else {
        console.log(` ❌日常签到ck不存在,已跳过 `);
        msg += ` ❌日常签到ck不存在,已跳过 `;
    }

    console.log("➡️开始 回馈金每日签到");
    await getsigninfo();
    await $.wait(2 * 1000);

    console.log("➡️开始 回馈金每日任务");
    await tasklist();
    await $.wait(2 * 1000);

    console.log("➡️开始 回馈金领取奖励");
    await tasklist_prize();
    await $.wait(2 * 1000);

}

/**
 * 每日签到    httpGet
 */
async function singinstar() {
    let Options = {
        url: `https://iws.watsonsvip.com.cn/watsons-member-center/mp/checkin/user/history/stats`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'Authorization': Authorization1,
        },
    };
    let result = await httpGet(Options, `每日签到`);
    if (result.code == 0 ) {
            console.log(` 每日签到: 今日签到成功,连续签到:${result.result.totalDayCount}天 🎉 `);
            msg += `\n 每日签到: 今日签到成功,连续签到:${result.result.totalDayCount}天 🎉 `;
    } else {
        console.log(` 每日签到查询: 失败 ❌ 了呢,原因未知！\n ${result} `);
        msg += `\n 每日签到查询: 失败 ❌ 了呢,原因未知！\n ${result} `;
    }
}

/**
 * 回馈金签到查询    httpGet
 */
async function getsigninfo() {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/wx/signIn/index?unionId=${unionid}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
    };
    let result = await httpGet(Options, `回馈金签到查询`);
    if (result.code == 0 && result.result.signInStatus.signedToday == true) {
        // 今日已签到
        if (result.result.signInStatus.rewardType == 1) {
            // 奖励类型 1==回馈金，3==优惠券
            prize = Number(result.result.signInStatus.todayReward) / 100;
            console.log(` 回馈金签到查询: 今日已签到,连续签到:${result.result.signInStatus.continueDays}天,今日奖励: ${prize}回馈金 🎉 `);
            msg += ` 回馈金签到查询: 今日已签到,连续签到:${result.result.signInStatus.continueDays}天,今日奖励: ${prize}回馈金 🎉 `;
        } else if (result.result.signInStatus.rewardType == 3) {
            console.log(` 回馈金签到查询: 今日已签到,连续签到:${result.result.signInStatus.continueDays}天,今日奖励: ${result.result.signInStatus.rewardName}优惠券 🎉 `);
            msg += ` 回馈金签到查询: 今日已签到,连续签到:${result.result.signInStatus.continueDays}天,今日奖励: ${result.result.signInStatus.rewardName}优惠券 🎉 `;
        } else {
            console.log(` 回馈金签到查询: 今日已签到,奖励未知！\n ${result} `);
            msg += ` 回馈金签到查询: 今日已签到,奖励未知！\n ${result} `;
        }
    } else if (result.result.code == 0 && result.result.signInStatus.signedToday == false) {
        // 今日未签到
        await getsign();
    } else {
        console.log(` 回馈金签到查询: 失败 ❌ 了呢,原因未知！\n ${result} `);
        msg += ` 回馈金签到查询: 失败 ❌ 了呢,原因未知！\n ${result} `;
    }
}

/**
 * 回馈金每日签到    httpPost
 */
async function getsign() {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/wx/signIn/iter/sign`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
        body: `{"unionId":${unionid}}`
    };
    let result = await httpPost(Options, `每日回馈金签到`);
    if (result.code == 0) {
        console.log(` 每日回馈金签到: 成功 ,连续签到: ${result.result.continueDays},奖励金额: ${result.result.rewardAmount} 🎉 `);
        msg += ` 每日回馈金签到: 成功 ,连续签到: ${result.result.continueDays},奖励金额: ${result.result.rewardAmount} 🎉 \n`;
    } else if (result.code == 11000) {
        console.log(` 每日回馈金签到: ${result.errorMsg} 🎉 `);
        msg += ` 每日回馈金签到: ${result.errorMsg} 🎉 `;
    } else {
        console.log(` 每日回馈金签到: 失败 ❌ 了呢,原因未知！\n ${result} `);
        msg += ` 每日回馈金签到: 失败 ❌ 了呢,原因未知！\n ${result} `;
    }
}


/**
 * 任务中心 -- 任务列表    httpPost
 */
async function tasklist() {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/tasks`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
    };
    let result = await httpGet(Options, `任务列表`);
    // console.log(result);
    if (result.code == 0) {
        let taskArr = result.result.list;
        // console.log(taskArr);
        // 取任务数量;
        for (let index = 0; index < taskArr.length; index++) {
            //console.log(` ${taskArr[index].mainTitle} : 任务已完成,明天再来吧~! `);
            //msg += ` ${taskArr[index].mainTitle} : 任务已完成,明天再来吧~! `;
            if (taskArr[index].type != 'Browse') {
                //jump类型任务
                if (taskArr[index].state == 2) {
                    console.log(`${taskArr[index].name}: 任务已完成`);
                    msg += `${taskArr[index].name}: 任务已完成 \n`;
                } else {
                    // console.log(`➡️开始 执行任务: ${taskArr[index].name}`);
                    taskid = taskArr[index].id;
                    await dotask_jump(taskid);
                    await $.wait(2 * 1000);
                }
            } else if (taskArr[index].type == 'Browse') {
                //Browse类型任务
                if (taskArr[index].state == 2) {
                    console.log(`${taskArr[index].name}: 任务已完成`);
                    msg += `${taskArr[index].name}: 任务已完成 \n`;
                } else {
                    // console.log(`➡️开始 执行任务: ${taskArr[index].name}`);
                    taskid = taskArr[index].id;
                    await dotask_Browsetoken(taskid);
                    await $.wait(2 * 1000);
                }
            } else {
                console.log(`没有可执行的任务了 ,明天再来吧~!`)
                msg += `没有可执行的任务了 ,明天再来吧~! \n`;
            }
        }
        //await walk();
    } else {
        console.log(`任务列表: 失败 ❌ 了呢,原因未知! \n${result}`);
        msg += `任务列表: 失败 ❌ 了呢,原因未知! \n${result}`;
    }
}

/**
* 任务中心---任务jump/Subscribe    httpPost
*/
async function dotask_jump(taskid) {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/tasks/complete`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
        body: JSON.stringify({ "taskId": taskid })
    };
    let result = await httpPost(Options, `执行任务_jump/Subscribe`);
    if (result.code == 0) {
        prize = Number(result.result[0].prize) / 100;
        console.log(`任务:${result.result[0].subPlayName}完成，奖励:${prize}回馈金 🎉 `);
        msg += `任务:${result.result[0].subPlayName}完成，奖励:${prize}回馈金 🎉 `;
    } else {
        console.log(` 做任务${taskid} : 失败 ❌ 了呢,原因未知！\n ${result} `);
        msg += ` 做任务${taskid} : 失败 ❌ 了呢,原因未知！\n ${result} `;
    }
}

/**
* 任务中心---任务Browse取token    httpGet
*/
async function dotask_Browsetoken(taskid) {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/tasks/browserTask/token/${taskid}`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
    };
    let result = await httpGet(Options, `任务_Browse取token`);
    // console.log(result.code);
    if (result.code == 0) {
        let token = result.result.token;
        await $.wait(10 * 1000);
        await dotask_Browse(taskid, token);
    } else {
        console.log(` 任务取token${taskid} : 失败 ❌ 了呢,原因未知！\n ${result} \n`);
        msg += ` 任务取token${taskid} : 失败 ❌ 了呢,原因未知！\n ${result} \n`;
    }
}

/**
* 任务接口---任务Browse    httpGet
*/
async function dotask_Browse(taskid, token) {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/tasks/complete`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
        body: JSON.stringify({ "taskId": taskid, "completeBrowserTaskToken": String(token) })
    };
    let result = await httpPost(Options, `执行任务_Browse`);
    if (result.code == 0) {
        prize = Number(result.result[0].grantNum) / 100;
        console.log(` 任务:${result.result[0].subPlayName}完成，奖励:${prize}回馈金 🎉`);
        msg += ` 任务:${result.result[0].subPlayName}完成，奖励:${prize}回馈金 🎉`;
    } else {
        console.log(` 执行任务${taskid} : 失败 ❌ 了呢,原因未知！\n ${result}`);
        msg += ` 执行任务${taskid} : 失败 ❌ 了呢,原因未知！\n ${result}`;
    }
}


/**
* 任务中心---查询任务奖励列表    httpPost
*/
async function tasklist_prize() {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/bubbles`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
    };
    let result = await httpGet(Options, `任务奖励列表`);
    let taskArr = result.result;
    // 取任务数量;
    if (result.code == 0 && taskArr.length != 0) {

        for (let index = 0; index < taskArr.length; index++) {
            if (taskArr[index].prizeAlarmMessage == "待领取") {
                prizeId = taskArr[index].prizeId; //取任务奖励id
                taskName = taskArr[index].taskName; //取任务名称
                await dotask_prize(prizeId, taskName);
                await $.wait(3 * 1000);
            } else {
                console.log(` 任务 ${taskArr[index].name} : 出错, 请检查数据！`);
                msg += ` 任务 ${taskArr[index].name} : 出错, 请检查数据！`;
            }
        }
    } else if (result.code == 0 && taskArr.length == 0) {
        console.log(` 任务已全部领取奖励, 请明天再来吧!`);
        msg += ` 任务已全部领取奖励, 请明天再来吧!`;
    } else {
        console.log(` 任务奖励列表: 失败 ❌ 了呢,原因未知!`);
        msg += ` 任务奖励列表: 失败 ❌ 了呢,原因未知!`;
    }
}


/**
* 任务接口---领取任务奖励    httpPost
*/
async function dotask_prize(prizeId, taskName) {
    let Options = {
        url: `https://mystore-01api.watsonsvip.com.cn/cloudapi/v2/users/receive`,
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN',
            'Content-Type': 'application/json',
            'authorizer_appid': authorizer_appid,
            'Authorization': Authorization,
            'openId': openid,
            'unionId': unionid,
        },
        body: JSON.stringify({ "prizeId": prizeId })
    };
    let result = await httpPost(Options, `领取任务奖励`);
    if (result.code == 0) {
        prizenum = Number(result.result.grantNum) / 100;
        console.log(` 任务: ${taskName} 成功收取${prizenum}奖励金 🎉 `);
        msg += ` 任务: ${taskName} 成功收取${prizenum}奖励金 🎉`;
    } else if (result.code == 1403 || result.code == 11000) {
        console.log(` 任务 ${taskName} : 收取失败,提示:${result.errorMsg}`);
        msg += ` 任务 ${taskName} : 收取失败,提示:${result.errorMsg}`;
    } else {
        console.log(` 收取任务奖励 : 失败 ❌ 了呢,原因未知！\n ${result}`);
        msg += ` 收取任务奖励 : 失败 ❌ 了呢,原因未知！\n ${result}`;
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
