from apscheduler.triggers.date import DateTrigger
from apscheduler.schedulers.background import BackgroundScheduler
from win10toast import ToastNotifier
from datetime import datetime, timedelta
import json

def load_alarms():
    '''
    加载所有闹钟
    '''
    with open('data/alarms.json', 'r', encoding='utf-8') as f:
        alarms = json.load(f)
    return alarms

def save_alarms(alarms):
    '''
    保存所有闹钟
    '''
    with open('data/alarms.json', 'w', encoding='utf-8') as f:
        json.dump(alarms, f, indent=4, ensure_ascii=False)

def reschedule_all():
    """
    重新调度所有闹钟
    """
    for alarm in load_alarms():
        schedule_alarms(alarm)

def init():
    global toaster
    toaster = ToastNotifier()
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.start()

def schedule_alarms(alarm):
    """
    调度所有闹钟
    """
    if not alarm.get("enabled", True):
        return
    
    t = alarm["time"]
    try:
        # 支持 ISO "YYYY-MM-DDTHH:MM:SS" 与 简单 "HH:MM"/"HH:MM:SS"
        now = datetime.now()
        try:
            # 先尝试 ISO 格式
            run_time = datetime.fromisoformat(t)
        except Exception:
            # 回退到本地时分/时分秒
            try:
                parts = t.split(":")
                hh = int(parts[0])
                mm = int(parts[1])
                ss = int(parts[2]) if len(parts) > 2 else 0
                run_time = now.replace(hour=hh, minute=mm, second=ss, microsecond=0)
                if run_time <= now:
                    run_time += timedelta(days=1)
            except Exception:
                raise ValueError(f"Unsupported time format: {t}")
    except ValueError:
        # 假设格式为 "HH:MM"
        hh, mm = map(int, t.split(":"))
        now = datetime.now()
        run_time = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
        if run_time <= now:
            run_time += timedelta(days=1)
    
    job_id = f"alarm_{alarm['id']}"
    # 存在则移除
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass
    
    def fire():
        try:
            # 显示通知
            toaster.show_toast("闹钟提醒", alarm.get("label", "时间到啦"), duration=5, threaded=True)
            
            if alarm.get("repeat", "none") == "none":
                # 一次性闹钟，触发后禁用
                alarms = load_alarms()
                for a in alarms:
                    if str(a["id"]) == str(alarm["id"]):
                        a["enabled"] = False
                        break
                save_alarms(alarms)
            else:
                # 重复闹钟，计算下次触发时间
                alarms = load_alarms()
                current_alarm = None
                for a in alarms:
                    if str(a["id"]) == str(alarm["id"]):
                        current_alarm = a
                        break
                
                if current_alarm:
                    next_time = datetime.now()
                    if alarm["repeat"] == "daily":
                        next_time += timedelta(days=1)
                    elif alarm["repeat"] == "weekly":
                        next_time += timedelta(weeks=1)
                    
                    # 更新时间并重新调度
                    current_alarm["time"] = next_time.replace(second=0, microsecond=0).isoformat()
                    save_alarms(alarms)
                    
                    # 重新调度这个闹钟
                    schedule_alarms(current_alarm)
        except Exception as e:
            print(f"闹钟触发时发生错误: {e}")
    
    scheduler.add_job(fire, DateTrigger(run_date=run_time), id=job_id, replace_existing=True)
    print(f"已调度闹钟 {alarm['id']}: {alarm.get('label', '闹钟')} 在 {run_time}")

def reschedule_all():
    """
    重新调度所有闹钟
    """
    for alarm in load_alarms():
        schedule_alarms(alarm)
