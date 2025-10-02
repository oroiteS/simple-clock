from app import create_app

if __name__ == '__main__':
    from app.routers.schedule import init
    init()
    from app.routers.schedule import reschedule_all
    reschedule_all()
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=8888)