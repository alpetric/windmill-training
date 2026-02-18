#!/usr/bin/env python3
import os
import time
import requests
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')

# Config from environment
RECORD_ID = os.environ.get('RECORD_ID')
WINDMILL_URL = os.environ.get('WINDMILL_URL', 'http://training-windmill-server:8000')
WORKSPACE = os.environ.get('WORKSPACE', 'training_demo')
WINDMILL_TOKEN = os.environ.get('WINDMILL_TOKEN')
CONFIG_REFRESH_INTERVAL = 10  # seconds

# Cached config and state
cached_config = None
cached_state = None
config_last_fetched = 0


def call_windmill(script_path, args):
    """Call a Windmill script and return the result."""
    url = f"{WINDMILL_URL}/api/w/{WORKSPACE}/jobs/run_wait_result/p/{script_path}"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {WINDMILL_TOKEN}'
    }
    response = requests.post(url, json=args, headers=headers, timeout=30)
    response.raise_for_status()
    return response.json()


def load_config():
    """Load config from Windmill."""
    global cached_config, cached_state, config_last_fetched
    if not RECORD_ID or not WINDMILL_TOKEN:
        return

    try:
        data = call_windmill('f/demo_provisioner/get_app_state', {'record_id': int(RECORD_ID)})
        cached_config = {
            'app_name': data.get('app_name', 'Demo Workspace'),
            'customer_name': data.get('customer_name', ''),
            'num_users': data.get('num_users', 10),
            'num_rooms': data.get('num_rooms', 4),
            'expires_at': data.get('expires_at'),
            'ttl_minutes': data.get('ttl_minutes', 30),
        }
        cached_state = data.get('app_state')
        config_last_fetched = time.time()
        print(f"Loaded config for record {RECORD_ID}: {cached_config}")
    except Exception as e:
        print(f"Failed to load config from Windmill: {e}")


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/api/config')
def get_config():
    global config_last_fetched
    # Refresh config if stale or not loaded
    if cached_config is None or (time.time() - config_last_fetched) > CONFIG_REFRESH_INTERVAL:
        load_config()
    return jsonify(cached_config or {})


@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify(cached_state)


@app.route('/api/state', methods=['POST'])
def save_state():
    global cached_state
    cached_state = request.json

    # Persist to Windmill in background
    if RECORD_ID and WINDMILL_TOKEN:
        try:
            call_windmill('f/demo_provisioner/set_app_state', {
                'record_id': int(RECORD_ID),
                'app_state': cached_state
            })
        except Exception as e:
            print(f"Failed to save state to Windmill: {e}")

    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    load_config()
    app.run(host='0.0.0.0', port=80)
