import requests
import random
import re
import sendNotify
import json

fileName = '精易论坛签到'
env_name = 'jyltck'
answer_true = {}
answer_All = {}
all_msg = ''

def env(key):
    import os
    return os.environ.get(key)


def getwParam():
    param = env(env_name)
    if '@' in param:
        paramList = param.split("@")
        return paramList
    else:
        return [param]


def allmsg(content):
    global all_msg
    # print(content)
    all_msg += content + '\n'


def dailyTask(ck):
    headers = {
        'Cookie': f'{ck}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62'
    }
    # for i in range(5):
    session = requests.session()
    pageNumber = random.randint(0, 5)
    url_page = 'https://bbs.125.la/plugin.php?id=dsu_paulsign:sign'
    response = session.get(url=url_page, headers=headers)
    temp = re.findall(r'/thread-14(.*).html" target="_blank"', response.text)
    formhash = re.findall(r'formhash=(.*)">退出', response.text)
    # print(formhash)
    url_page = 'https://bbs.125.la/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1'
    response = session.post(url=url_page, headers=headers, data={'formhash': formhash, "submit": "1", "targerurl": "", "todaysay": "", "qdxq": "kx"})
    result = json.loads(response.text)
    print('\n精易论坛签到结果:\n')
    allmsg('\n精易论坛签到结果:\n')
    if result['status'] == 1:
        print(f'\n  本月签到:{result["data"]["mdays"]}天,累计签到:{result["data"]["days"]}天,本次奖励:{result["data"]["credit"]}精币,总得奖励:{result["data"]["reward"]}精币')
        allmsg(f'\n  本月签到:{result["data"]["mdays"]}天,累计签到:{result["data"]["days"]}天,本次奖励:{result["data"]["credit"]}精币,总得奖励:{result["data"]["reward"]}精币')
    else:
        print(result["msg"])
        allmsg(result["msg"])


def main():
    paramList = getwParam()
    print(f'\n共{len(paramList)}个账号束')
    allmsg(f'\n共{len(paramList)}个账号')
    for index in range(0, len(paramList)):
        print(f'\n开始第{index+1}个账号 {fileName} ')
        allmsg(f'\n开始第{index+1}个账号 {fileName} ')
        dailyTask(paramList[index])
    print(f'\n共{len(paramList)}个账号执行结束')
    # print(answer_All)
    allmsg(f'\n共{len(paramList)}个账号执行结束')
    sendNotify.send(fileName, all_msg)

main()
