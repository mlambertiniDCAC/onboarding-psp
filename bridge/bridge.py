import os

import requests
from flask import Flask, Response, request

APIGW_PSP_URL = os.environ.get("APIGW_PSP_URL", "http://localhost:8010/").rstrip("/")
PORT = int(os.environ.get("BRIDGE_PORT", "9000"))

app = Flask(__name__)

HOP_BY_HOP_REQUEST_HEADERS = {"host", "content-length", "connection"}
HOP_BY_HOP_RESPONSE_HEADERS = {
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
}


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = request.headers.get(
        "Origin", "*"
    )
    response.headers["Access-Control-Allow-Methods"] = (
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )
    response.headers["Access-Control-Allow-Headers"] = (
        "Content-Type, Authorization, ngrok-skip-browser-warning"
    )
    response.headers["Vary"] = "Origin"
    return response


@app.route(
    "/<path:path>",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
def proxy(path):
    if request.method == "OPTIONS":
        return Response(status=204)

    target_url = f"{APIGW_PSP_URL}/{path}"
    forward_headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in HOP_BY_HOP_REQUEST_HEADERS
    }

    upstream = requests.request(
        method=request.method,
        url=target_url,
        headers=forward_headers,
        params=request.args,
        data=request.get_data(),
        stream=True,
        timeout=60,
    )

    response_headers = [
        (key, value)
        for key, value in upstream.raw.headers.items()
        if key.lower() not in HOP_BY_HOP_RESPONSE_HEADERS
    ]

    return Response(
        upstream.content,
        status=upstream.status_code,
        headers=response_headers,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
