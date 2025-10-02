# app/__init__.py
from flask import Flask
from flask_cors import CORS
import os

def create_app():
    # 获取项目根目录
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # 配置Flask应用，指定模板和静态文件目录
    app = Flask(__name__, 
                template_folder=os.path.join(project_root, 'frontend'),
                static_folder=os.path.join(project_root, 'frontend'),
                static_url_path='/static')

    # 允许跨域请求
    CORS(app, supports_credentials=True)

    # 注册蓝图（模块化路由）
    from app.routers.clock import clock_bp
    app.register_blueprint(clock_bp)
    
    return app
