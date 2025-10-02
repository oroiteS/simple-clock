# routers/clock.py
from app.routers.schedule import schedule_alarms
from flask import Blueprint, request, jsonify, render_template
import json
import uuid

clock_bp = Blueprint('clock', __name__)

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
        
@clock_bp.route('/alarms', methods=['GET'])
def get_alarms():
    '''
    获取所有闹钟
    '''
    return jsonify(load_alarms())

@clock_bp.route('/alarms', methods=['POST'])
def create_alarm():
    '''
    创建闹钟
    '''
    data = request.get_json(force=True)
    alarms = load_alarms()
    # 为新闹钟设置ID
    new_alarm = {
        "id": data.get("id") or str(uuid.uuid4()),
        "time": data["time"],     
        "label": data.get("label") or "闹钟",
        "enabled": data.get("enabled", True),
        "repeat": data.get("repeat") or "none"
    }
    alarms.append(new_alarm)
    # 保存更新后的闹钟列表
    save_alarms(alarms)
    # 调度
    schedule_alarms(new_alarm)
    
    return jsonify({'alarm': new_alarm}), 201

@clock_bp.route('/alarms/<alarm_id>', methods=['DELETE'])
def delete_alarm(alarm_id):
    """
    删除指定ID的闹钟
    """
    alarms = load_alarms()
    deleted_alarm = None
    
    # 查找并删除指定ID的闹钟
    for alarm in alarms:
        if str(alarm["id"]) == str(alarm_id):
            deleted_alarm = alarm
            alarms.remove(alarm)
            break
    
    if not deleted_alarm:
        return jsonify({'message': 'Alarm not found'}), 404
    
    # 保存更新后的闹钟列表
    save_alarms(alarms)
    
    # 取消调度任务
    try:
        from app.routers.schedule import scheduler
        scheduler.remove_job(f"alarm_{alarm_id}")
    except Exception:
        pass
    
    return jsonify({'message': 'Alarm deleted'}), 200

@clock_bp.route('/alarms/<alarm_id>', methods=['PUT'])
def update_alarm(alarm_id):
    """
    更新指定ID的闹钟
    """
    data = request.get_json(force=True)
    alarms = load_alarms()
    updated_alarm = None
    
    for a in alarms:
        if str(a["id"]) == str(alarm_id):
            a.update({
                "time": data.get("time", a["time"]),
                "label": data.get("label", a["label"]),
                "enabled": data.get("enabled", a["enabled"]),
                "repeat": data.get("repeat", a["repeat"]),
            })
            updated_alarm = a
            break
    
    if not updated_alarm:
        return jsonify({'message': 'Alarm not found'}), 404
    
    # 保存更新后的闹钟列表
    save_alarms(alarms)
    
    # 重新调度
    schedule_alarms(updated_alarm)
    
    return jsonify({'alarm': updated_alarm}), 200
    
@clock_bp.route('/')
def index():
    return render_template("index.html")